<template>
  <!-- 左下拉 + 右多行文本：外框 / 聚焦 / 错误三态由本件容器统一负责 -->
  <div class="select-textarea" v-bind="rootAttrs">
    <FormSelect
      v-if="props.dictCode || props.options.length > 1"
      :bordered="false"
      :allow-clear="false"
      :options="props.options"
      v-model:value="state.selected"
      :dictCode="props.dictCode"
      @change="methods.changeSelect"
      :getPopupContainer="methods.getPopupContainer"
    ></FormSelect>
    <FormTextarea
      v-model:value="state.value"
      :bordered="false"
      :rows="props.rows"
      :showCount="showCountConfig"
      :placeholder="props.placeholder || '多个内容请用换行、空格或逗号分隔'"
      v-bind="textareaAttrs"
      @change="methods.changeInput"
    />
  </div>
</template>

<script lang="ts">
/**
 * 「左下拉 + 右多行文本」合成框。改动前必读五条契约：
 *
 * 1. **属性显式分流**：本件 `inheritAttrs: false` —— `class` / `style` 归容器（尺寸由使用方决定），
 *    其余 `$attrs`（`disabled` / `maxlength` / `@keydown` …）**全部**转给右侧文本域。
 *    不要改回默认继承：单根组件默认继承会把未声明属性落到 `<div>` 上（`showCount` 曾因此从未生效）。
 *    **唯一例外 = `showCount`**：由本件截住（`showCountConfig`）—— antd 原生统计的是**字符数**，
 *    对「最多 N 个单号」没有参考价值，这里换成「条目数 / 上限」；传对象则视为自定义 formatter、原样透传。
 * 2. **外观三态归容器**：外框 / 聚焦（`:focus-within`）/ 错误（`.ant-form-item-has-error`）由本件承担，
 *    两个子件一律走官方 `bordered=false`。**不要再给子件补边框** —— 补了会把聚焦反馈和错误红框一起压掉。
 *    `bordered=false` 对 `a-textarea` 生效；对 `a-select` 实测不生效 ⇒ 样式里显式抹内框，
 *    这是本件**唯一**一条 `!important`（须压过 `FormSelect` 自身 scoped 规则）。
 * 3. **高度由内容决定**（`rows` prop，默认 2），容器 `align-items: stretch` 让左下拉跟随行高。
 *    不要再用调用方内联 `height` 定高：文本域不会跟高，外框会出现点不进去的死区。
 * 4. **超限即清空**：`methods.commit()` 是手输 / 粘贴的唯一出口（与 `SelectMultiInput` 同一口径）。
 *    提示走 `message.warning`（**本地校验不用 `error`**：红色 error 留给接口失败）。
 *    **不要**把「归一后的文本」（`formatTextaeraToArray` 的拆分/去重结果）回写 `state.value` ——
 *    会吞掉刚敲的分隔符；本件只写回原文或清空。
 * 5. 样式锚 `:deep(textarea.ant-input)` / `:deep(.ant-select-selector)` 本体，**不要锚 `form-textarea` 类**：
 *    该类在 `showCount` 时会被 antd 搬到外层 `div`，锚类会突然失配。
 *
 * Vue 3.2 无 `defineOptions`：显式分流 `$attrs` 时必须关掉自动继承，否则同一份属性会被 Vue 再落一次。
 */
export default {
  name: 'SelectTextarea',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive, useAttrs, watch } from 'vue';
import type { HTMLAttributes, PropType } from 'vue';
import { omit, pick } from 'lodash-es';
import message from '../../message';
import FormSelect from '../select/FormSelect.vue';
import FormTextarea from './FormTextarea.vue';
import { formatTextaeraToArray, getPopupContainer as resolvePopupContainer } from './helper/utils';

interface SelectOption {
  label?: string;
  value?: string | number;
  disabled?: boolean;
}

const props = defineProps({
  // 左侧下拉的选中值（v-model:selected）
  selected: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  // 右侧文本原文（v-model:value）
  value: {
    type: String,
    default: undefined,
  },
  // 左侧下拉数据源（与 `dictCode` 二选一；≥2 条才渲染下拉）
  options: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
  // 左侧下拉数据源-字典编码（优先于 `options`）
  dictCode: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  // 文本域行数：高度由它决定（不要再由调用方给容器内联 height）
  rows: {
    type: Number,
    default: 2,
  },
  // 条目上限：超限提示并清空（与 `SelectMultiInput` 同一口径）
  limitCount: {
    type: Number,
    default: 50,
  },
});

const $emit = defineEmits(['update:selected', 'update:value', 'changeSelect', 'changeInput']);

const attrs = useAttrs();
// class / style 归容器（尺寸与留白由使用方决定），其余属性全部转发给右侧文本域。
// `showCount` 例外：见下方 `showCountConfig`（要截住它才能把「字数」改成「条目数」）。
const rootAttrs = computed(() => pick(attrs, ['class', 'style']) as HTMLAttributes);
const textareaAttrs = computed(() => omit(attrs, ['class', 'style', 'showCount']));

const state = reactive<{
  selected?: string | number;
  value?: string;
}>({
  selected: undefined,
  value: undefined,
});

// 计数文案：**条目数 / 上限**。
// antd 原生统计的是**字符数**，对「最多 100 个单号」没有意义；这里用官方 `showCount.formatter`
// 把它换成条目数（与 `limitCount` 校验**同一个** `formatTextaeraToArray`，保证「显示的数字」与
// 「触发上限的数字」永远一致）。调用方传对象 ⇒ 视为自定义 formatter，原样透传；传 `false`/不传 ⇒ 不显示。
const showCountConfig = computed(() => {
  const raw = attrs.showCount;
  if (!raw) return undefined;
  if (typeof raw === 'object') return raw;
  return {
    formatter: () => `${formatTextaeraToArray(state.value).length} / ${props.limitCount}`,
  };
});

// 外部值 → 内部（父级可能程序化重置，如清空整个查询数组）
watch(
  () => props.selected,
  value => {
    if (value === state.selected) {
      return;
    }
    state.selected = value;
  },
  { immediate: true },
);
watch(
  () => props.value,
  value => {
    if (value === state.value) {
      return;
    }
    state.value = value;
  },
  { immediate: true },
);

const methods = {
  changeSelect(value: string | number) {
    $emit('update:selected', value);
    $emit('changeSelect', value);
  },
  changeInput(e: Event) {
    methods.commit((e.target as HTMLTextAreaElement).value);
  },
  // 唯一出口（手输 / 粘贴共用）：超限 → 提示 + 清空；否则原样写回。
  // 写回的是**原文**，不是 `formatTextaeraToArray` 的结果 —— 拆分/去重会吞掉刚敲的分隔符。
  commit(raw: string) {
    const items = formatTextaeraToArray(raw);
    if (items.length > props.limitCount) {
      state.value = undefined;
      // 本地校验用 warning（不是接口失败，不用 error 的红色告警）
      message.warning(`最多支持 ${props.limitCount} 个条目`);
    } else {
      state.value = raw;
    }
    $emit('update:value', state.value);
    $emit('changeInput', state.value);
  },
  // 弹层挂到「合成框的上一层」（单元格），避免被定高容器裁切。
  // 用锚点定位而不是 `parentNode.parentNode`：内部再加 wrapper 也不会错位。
  getPopupContainer(triggerNode: HTMLElement): HTMLElement {
    return resolvePopupContainer(triggerNode, '.select-textarea');
  },
};
</script>

<style lang="less" scoped>
.select-textarea {
  display: flex;
  // 高度由文本域 rows 决定，左下拉靠 stretch 跟随 ⇒ 两侧内容区等高
  align-items: stretch;
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: var(--border-radius-base, 4px);
  background-color: var(--bg-color-white, #fff);

  // 焦点反馈：两侧子件的边框已交给容器（子件走 bordered=false），整体由容器统一响应
  &:focus-within {
    border-color: var(--primary-color, #0032a0);
  }

  .form-select {
    flex: 0 0 auto;
    width: 145px; // 定值：选项文案长度接近时宽度一致性优先
    // 分隔线画在根元素上（不穿透 `.ant-select-selector` 去画右边框）
    border-right: 1px solid var(--border-color-line, #d9d9d9);

    :deep(.ant-select-selector) {
      height: 100%; // 跟随容器内容区，让选中项与外框等高
      // 下拉自身的内框必须显式抹掉：官方 `bordered=false` 对 `a-select` 未生效，
      // 不抹就与外框叠成 2px 粗边。用 `border-width: 0` 而不是只改颜色（宽度归零内容区才准）。
      border-width: 0 !important;
    }

    :deep(.ant-select-selection-item) {
      // antd 把选中项 line-height 写死 30px，selector 被拉高后不 flex 居中就会贴顶 —— 不要删
      display: flex;
      align-items: center;
    }
  }

  .form-textarea {
    flex: 1;
    min-width: 0;
  }

  // 计数文案（`showCount`，由调用方决定是否开启）：antd 用 `::after` 流内浮行挂在文本域外层，
  // 默认紧贴右下边框 ⇒ 这里只补右侧留白与 2px 下沿。不要改成绝对定位：会脱离文档流压住文本。
  :deep(.ant-input-textarea-show-count) {
    padding-bottom: 2px;

    &::after {
      padding-right: 8px;
      color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
    }
  }

  :deep(textarea.ant-input) {
    // 锚 textarea 本体（不要锚 `.form-textarea` 类：showCount 时该类会被 antd 搬到外层 div）
    word-break: break-all; // 长单号不横向溢出
    // antd 未声明 resize，UA 默认可拖拽改高 —— 不要删
    resize: none;
  }
}

// 错误态同样归容器（业务侧不必再用 `!important` + 硬编码红去反补）
.ant-form-item-has-error .select-textarea {
  border-color: var(--error-color, #f6530f);
}
</style>
