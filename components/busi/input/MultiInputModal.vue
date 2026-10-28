<template>
  <Modal
    title="批量录入"
    :width="600"
    :centered="true"
    :visible="visible"
    :maskClosable="true"
    v-bind="$attrs"
    :on-cancel="methods.close"
    @ok="methods.confirm"
  >
    <FormTextarea
      allow-clear
      placeholder="多个内容请用换行、空格或逗号分隔"
      :auto-size="{ minRows: 15, maxRows: 15 }"
      :value="displayText"
      @change="methods.changeMultiInput"
    />
  </Modal>
</template>

<script lang="ts">
/**
 * 批量文本录入盒：textarea 里是「分隔符」分隔的一串值，点确定时归一为去重数组回传。
 * 改动前必读五条契约：
 *
 * 1. **受控可见性**：`v-model:visible`（props.visible + emit update:visible）。四条关闭路径
 *    （确定 / 取消 / 右上角 × / 点遮罩）统一走外壳的 **`onCancel` 语义入口**（`Modal.vue` 里
 *    `onCancel` 存在时外壳不再自己 emit update:visible）⇒ 本件在 `methods.close` 里清草稿并
 *    emit update:visible(false)；`update:visible` 只作为**对外**的关闭信号，不再当输入事件监听。
 * 2. **`value` 只作初值**（折成一项一行便于核对），不是 v-model。显示值 = `草稿 ?? fold(value)`：
 *    用户输入只写草稿、**关闭时清草稿**（`methods.close`）⇒ 两种挂载都自洽，且**不需要 watch 回灌**：
 *    · `v-if` 挂载：关闭 = 销毁，草稿随实例消失；
 *    · 常驻 / 缓存挂载：关闭自清，下次打开派生值自动取当时的 `value`。
 *    前提：`visible` 只由本组件的 `update:visible` 驱动（受控组件的常规约定）。
 * 3. **折行规则可配**（本组件核心）：`separators` 改分隔符（RegExp / 单个字面量 / 字面量数组，
 *    不传用内置默认 `TEXTAREA_SEPARATORS`，它含 `\s` 已覆盖换行）。折行与确认拆分用**同一份规则**，
 *    **自定义规则里必须带上换行**（如 `/[,;|\n]+/`、`[',', '\n']`）—— 折行把分隔符换成了换行，
 *    规则不含换行就拆不回来（会「看到 3 行、提交 1 项」）。
 * 4. `inheritAttrs: false` + `$attrs` 显式交给 `Modal`：调用方传的 `title` / `maskClosable` 等
 *    落在外壳；`:width="600"` 写在 `$attrs` 之前 ⇒ 默认值可被覆盖（后写者胜，顺序不能反）。
 *    **宽度必须数字绑定**：antd 只给 number 补 `px`，字符串会渲染成非法 CSS 并回落默认宽度。
 * 5. 输入期折行（自动换行）是核心需求；折行时**光标跟着搬**（落点 = 光标前那段文本折叠后的
 *    长度），所以「回改中间某一项后继续输入」不会跑位。实现顺序固定 `DOM 先行 → 搬光标 → 状态后跟`，
 *    靠 Vue 的等值短路保证 state 跟上时不再重写 DOM。
 *    **不要给输入法组合期加「跳过 state 同步」的特判** —— 拼音不含分隔符，本来就早退；跳过同步会让
 *    受控 `:value` 把拼音擦掉，中文直接打不进字。
 *
 * Vue 3.2 无 defineOptions：显式透传 $attrs 时必须关掉自动继承，
 * 否则同一份属性会被 Vue 再落到根组件（本件根组件即 Modal）上一次。
 */
export default {
  name: 'MultiInputModal',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import Modal from '../modal/Modal.vue';
import FormTextarea from './FormTextarea.vue';
import { foldTextareaSeparators, formatTextaeraToArray, normalizeSeparators } from './helper/utils';

const props = defineProps({
  // 受控可见性（v-model:visible）
  visible: {
    type: Boolean,
    default: false,
  },
  // 打开时灌入的初始文本（调用方输入框的当前值）
  value: {
    type: String,
    default: undefined,
  },
  // 折行/拆分用的分隔符规则；不传则用 TEXTAREA_SEPARATORS
  separators: {
    type: [RegExp, String, Array],
    default: undefined,
  },
});

const emit = defineEmits(['update:visible', 'confirm']);

// 分隔符规则只在 prop 变化时归一一次，逐键输入不再重复构造正则
const pattern = computed(() => normalizeSeparators(props.separators));

// 草稿：undefined = 本轮还没编辑过（显示时回落到 value）
const state = reactive<{ text: string | undefined }>({
  text: undefined,
});

// 显示值 = 草稿 ?? 当前初值（初值折行一次，便于核对）⇒ 无论是否 v-if 挂载都自动取最新 value
const displayText = computed(
  () => state.text ?? foldTextareaSeparators(props.value, pattern.value),
);

const methods = {
  // 输入 / 粘贴时折行，并把光标搬到「光标前那段文本折叠后的长度」（同一变换作用于位置）。
  //
  // 三条不能改的约束：
  // 1. `next === before` 时必须 `state.text = before` 再返回 —— 草稿不跟上 DOM，受控 `:value`
  //    就会把用户刚输入的内容擦掉（中文输入法下表现为拼音被清、根本打不进字）。
  // 2. 改写时顺序必须是 **DOM 先行 → 搬光标 → 状态后跟**：state 跟上后 Vue 判等即跳过写 DOM，
  //    光标才不会被重新打到末尾。
  // 3. **不做输入法组合期特殊处理**：组合期的 value 是拼音字母、不含分隔符 ⇒ 走第 1 条早退，
  //    DOM 一行不动，组合天然不受影响。
  changeMultiInput(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    const before = el.value;
    const next = foldTextareaSeparators(before, pattern.value);
    if (next === before) {
      state.text = before; // 无分隔符（含拼音组合中）：只同步草稿，不碰 DOM 与光标
      return;
    }
    const caret = foldTextareaSeparators(
      before.slice(0, el.selectionStart ?? before.length),
      pattern.value,
    ).length;
    el.value = next;
    el.setSelectionRange(caret, caret);
    state.text = next;
  },
  confirm() {
    emit('confirm', formatTextaeraToArray(displayText.value, pattern.value));
    methods.close();
  },
  // 关闭自清：草稿不跨次残留（缓存 / 常驻挂载同样成立，无需 watch 回灌）
  close() {
    state.text = undefined;
    emit('update:visible', false);
  },
};
</script>
