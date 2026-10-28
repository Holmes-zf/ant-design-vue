<template>
  <!-- 左下拉 + 右文本合成框：`separators` 默认按内置规则拆成多条目（批量查询）；传 false 即不拆分、原文进出（单值编辑） -->
  <div class="select-multi-input" v-bind="rootAttrs">
    <FormSelect
      :bordered="false"
      v-if="props.dictCode || (props.options && props.options.length > 1)"
      :allow-clear="false"
      :options="props.options"
      v-model:value="state.selected"
      :dictCode="props.dictCode"
      @change="methods.changeSelect"
      :getPopupContainer="methods.getPopupContainer"
    ></FormSelect>
    <FormInput
      :bordered="false"
      :prefix="prefixLabel"
      v-model:value="state.value"
      v-bind="inputAttrs"
      @change="methods.changeInput"
      @blur="methods.blurInput"
    ></FormInput>
    <div
      class="batch-icon"
      v-if="props.isShowModal"
      role="button"
      tabindex="0"
      aria-label="批量录入"
      title="批量录入"
      @click="methods.showModal()"
      @keydown.enter.prevent="methods.showModal()"
      @keydown.space.prevent="methods.showModal()"
    >
      <SvgIcon icon="icon-core-diff" size="16px" />
    </div>
  </div>
  <MultiInputModal
    v-if="props.isShowModal && state.showModal"
    v-model:visible="state.showModal"
    :value="state.value"
    @confirm="methods.backFillValue"
  ></MultiInputModal>
</template>

<script lang="ts">
/**
 * 查询条件「左下拉 + 右文本 + 批量图标」三合一段。改动前必读五条契约：
 *
 * 1. **外观三态归容器**：外框 / 聚焦 / 错误一律由本件容器承担（`:focus-within` 与
 *    `.ant-form-item-has-error`），容器**定高 32px + border-box**（外框不再叠加高度，与同排 antd 控件齐平）。
 *    **不要再给子件补外框** —— 会把聚焦反馈与错误红框一起压掉。
 *    `bordered=false` 对 `a-input` 生效，但**对 `a-select` 未生效**（下拉仍画 1px 内框，与外框/分隔线
 *    叠成 2px 粗边）⇒ 样式里显式抹掉它的内框，这是本件**唯一一条 `!important`**（须压过 `FormSelect`
 *    自身 scoped 规则）。分隔线画在 `.form-select` 根元素上。
 * 2. **`options` / `dictCode` 是正式 props**（曾靠 `$attrs` 隐式承载，会顺带落到 `<input>` 的 DOM 上）。
 *    `$attrs` 只做真透传（`disabled` / `@keydown` / `placeholder` …），且经 `inputAttrs` 显式交给输入框。
 * 3. **条目数组是唯一中间形态**：`toItems(raw)` 把原文变数组（`separators` 只影响这一步），
 *    `commitItems(items)` 统一做 上限校验 → join 拼串 → **先写回 `state.value` 再 emit**。
 *    · `separators` 不传（默认）= 按内置规则（换行/空白/加号/逗号/分号）拆成多条目；
 *    · `separators` 传规则 = 自定义拆分（如 `/[\n]+/` 只按换行、保留空格）；
 *    · `separators=false` = **不拆分**，原文进出（空格与逗号都算内容）⇒ 数组恒为 1 项、
 *      `join(',')` 恒等于原文，`limitCount`（只校验数组长度）天然不触发 —— **两者不耦合**；
 *    注意：`FormInput.handleChange` 是**先** emit `update:value`（原文写进 `state.value`）、**再** emit
 *    `change`，而 `formatTextaeraToArray` 会丢弃空段 ⇒ 回写会把**结尾刚敲的分隔符**一并抹掉
 *    （`'a,'`→`'a'`，紧接着输入的字符会接到 `'a'` 后面变成 `'ab'`）。这是该形态的已知特征，
 *    多值录入走批量弹窗。
 * 4. **`useInjectFormItemContext` 是刻意手法**：一个 `a-form-item` 里有两个控件，由本件统一代表字段
 *    注册并向下 provide 空 context（否则 antd 会因「一个 item 收集到多个 field」报警）。
 *    ⇒ 代价：`a-form-item` 的 `label[for]` 不再指向具体控件。**即时校验必须显式传 `validateList`**。
 * 5. **批量入口对键盘可达**（`role="button"` + `tabindex="0"` + Enter/Space），改回裸 `div@click` 会退化。
 *
 * Vue 3.2 无 defineOptions：显式分流 `$attrs` 时必须关掉自动继承，否则同一份属性会被 Vue 再落一次。
 */
export default {
  name: 'SelectMultiInput',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive, useAttrs, watch } from 'vue';
import type { HTMLAttributes, PropType } from 'vue';
import { omit, pick } from 'lodash-es';
import message from '../../message';
import { useInjectFormItemContext } from '../../form';
import FormInput from './FormInput.vue';
import FormSelect from '../select/FormSelect.vue';
import MultiInputModal from './MultiInputModal.vue';
import SvgIcon from '../icon/SvgIcon.vue';
import {
  formatTextaeraToArray,
  getPopupContainer as resolvePopupContainer,
  TEXTAREA_SEPARATORS,
} from './helper/utils';

interface SelectOption {
  label?: string;
  value?: string | number;
  disabled?: boolean;
}

const props = defineProps({
  // 左侧下拉的选中值（v-model:selected）
  selected: {
    type: [String, Number],
    default: undefined,
  },
  // 右侧文本值（v-model:value）
  value: {
    type: String,
    default: undefined,
  },
  // 左侧下拉数据源（与 `dictCode` 二选一；≥2 条才渲染下拉，恰好 1 条时退化为前缀标签）
  options: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
  // 左侧下拉数据源-字典编码（优先于 `options`）
  dictCode: {
    type: String,
    default: '',
  },
  // 是否开启批量操作
  isShowModal: {
    type: Boolean,
    default: false,
  },
  // 条目上限（校验对象是「条目数组」的长度，**与是否拆分无关**：不拆分时数组恒为 1 项，天然不触发）
  limitCount: {
    type: Number,
    default: 1000,
  },
  // 拆分规则（透传 `formatTextaeraToArray`）。三态：
  // · 不传 ⇒ 走本 prop 的 default：内置 `TEXTAREA_SEPARATORS`（换行 / 空白 / 加号 / 逗号 / 分号）；
  // · 传规则 ⇒ 自定义拆分（「只按换行拆、保留空格」用 `/[\n]+/`）；
  // · **传 `false` ⇒ 不拆分**，原文进出（空格与逗号都算内容）。
  separators: {
    type: [RegExp, String, Array, Boolean],
    default: () => TEXTAREA_SEPARATORS,
  },
  // 单选项时是否把该项 label 作为输入框前缀标签
  isShowLabel: {
    type: Boolean,
    default: true,
  },
  // 需要即时触发所在 a-form-item 校验的字段名，['selected','value']；默认不触发
  validateList: {
    type: Array,
    default: () => [],
  },
});

const $emit = defineEmits(['update:selected', 'update:value', 'changeSelect', 'changeInput']);

const attrs = useAttrs();
// class / style 归容器（尺寸与留白由使用方决定），其余属性全部转发给输入框
const rootAttrs = computed(() => pick(attrs, ['class', 'style']) as HTMLAttributes);
const inputAttrs = computed(() => omit(attrs, ['class', 'style']));

const state = reactive<{
  selected?: string | number;
  value?: string;
  showModal: boolean;
}>({
  selected: undefined,
  value: undefined,
  showModal: false,
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

// 单选项时把该项 label 作为输入框前缀：走 `a-input` 的 `prefix` prop（字符串可直接渲染），
// 不用 `#prefix` 槽 —— `FormInput` 是 JS 组件、无槽类型，`lang="ts"` 下传具名槽会报错。
const prefixLabel = computed(() =>
  props.isShowLabel && props.options.length === 1 ? `${props.options[0].label ?? ''}：` : undefined,
);

// form 表单校验不支持一个 item 中多个 input，要使用这个注入方式判断哪里触发校验
const { onFieldChange, onFieldBlur } = useInjectFormItemContext();
const methods = {
  changeSelect(value: string | number) {
    $emit('update:selected', value);
    $emit('changeSelect', value);
    props.validateList.includes('selected') && onFieldChange();
  },
  changeInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    methods.commitItems(methods.toItems(value));
    props.validateList.includes('value') && onFieldChange();
  },
  // 原文 → 条目数组：**唯一**受 `separators` 影响的一步。
  // `separators === false` ⇒ 不拆分，原文即 1 个条目（空格/逗号都算内容）；后续校验与拼串完全共用。
  toItems(raw: string): string[] {
    return props.separators === false ? [raw] : formatTextaeraToArray(raw, props.separators);
  },
  // 统一出口（**入参是条目数组**）：赋值（先）→ 超量守卫 → 双向 emit
  // 手输 / 粘贴 / 批量回填共用这一条路，避免只有批量入口受 `limitCount` 保护。
  commitItems(items: string[]) {
    if (items.length > props.limitCount) {
      state.value = undefined;
      // 本地校验用 warning（不是接口失败，不用 error 的红色告警）
      message.warning(`最多支持 ${props.limitCount} 个条目`);
    } else {
      // 单条目时 join 恒等于原文 ⇒「不拆分」模式原样进出
      state.value = items.join(',');
    }
    $emit('update:value', state.value);
    $emit('changeInput', state.value);
  },
  blurInput() {
    props.validateList.includes('value') && onFieldBlur();
  },
  // 弹层挂到「合成框的上一层」（表单单元格），避免被定高的 flex 容器裁切。
  // 用锚点定位（`getPopupContainer`）而不是 `parentNode.parentNode`：内部再加 wrapper 也不会错位。
  getPopupContainer(triggerNode: HTMLElement): HTMLElement {
    return resolvePopupContainer(triggerNode, '.select-multi-input');
  },
  showModal() {
    state.showModal = true;
  },
  backFillValue(arr: string[] = []) {
    // 弹窗确认给的就是条目数组，直接进统一出口（不再 join 后又被 split）
    methods.commitItems(arr);
  },
};
</script>

<style lang="less" scoped>
.select-multi-input {
  display: flex;
  // 定高 + border-box：外框 1px 不再叠加到高度上（否则比同排控件高 2px）
  height: 32px;
  box-sizing: border-box;
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: var(--border-radius-base, 4px);
  background-color: var(--bg-color-white, #fff);

  // 焦点反馈：两侧子件的边框已交给容器，整体由容器统一响应
  &:focus-within {
    border-color: var(--primary-color, #0032a0);
  }

  // 下拉宽度贴合当前文案、上限 160px（定值会把长 label 截断）：
  // `flex-basis:auto` 取文案固有宽度、`max-width` 只封顶；保留 shrink + `min-width:0`
  // ⇒ 查询列被压窄时仍能收缩（antd 内部自带省略号），不溢出容器。
  // 分隔线画在根元素上（而非 `.ant-select-selector`）⇒ 少一层穿透。
  .form-select {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 160px;
    border-right: 1px solid var(--border-color-line, #d9d9d9);

    // 下拉自身的内框必须显式抹掉：官方 `bordered=false` 对 `a-select` 未生效，
    // 不抹就会与外框/分隔线叠成「粗边框」。
    // 用 `border-width: 0` 而不是只改颜色：宽度归零后内容区正好 30px，antd 内部那些 30px 行高才不多不少。
    :deep(.ant-select-selector) {
      height: 100%; // 跟随容器内容区（30px）
      border-width: 0 !important;
    }
  }

  .form-input {
    flex: 1;
    min-width: 0;
    height: 100%; // 跟随容器内容区（30px）：padding 4+4 + line-height 22 正好填满
    min-height: 0; // 兜底：antd 若给 affix wrapper 加 min-height，也不会把容器撑破
  }

  .batch-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    cursor: pointer;
  }
}

// 错误态同样归容器（业务侧不必再用 `!important` + 硬编码红去反补）
.ant-form-item-has-error .select-multi-input {
  border-color: var(--error-color, #f6530f);
}
</style>
