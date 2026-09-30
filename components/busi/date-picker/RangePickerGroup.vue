<template>
  <div class="range-picker-group" v-bind="rootAttrs">
    <FormSelect
      :bordered="false"
      :allow-clear="false"
      :options="options"
      :dictCode="dictCode"
      :showSearch="showSearch"
      :filterValues="filterValues"
      :joinArrayValue="joinArrayValue"
      :value="methods.toSelectValue(selected)"
      :filterOption="filterOption"
      @update:value="methods.handleSelectInput"
      @change="methods.handleSelectChange"
    ></FormSelect>
    <RangePicker
      v-bind="dateAttrs"
      :bordered="false"
      :start="start"
      :end="end"
      @update:start="value => emit('update:start', value)"
      @update:end="value => emit('update:end', value)"
      @change="value => emit('change', value)"
    ></RangePicker>
  </div>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：$attrs 已显式分流（class/style → 外壳、其余 → RangePicker），
// 必须同时关掉自动继承，否则同一份属性会被 Vue 再落到根 div 一次（同 DatePickerGroup 的处理）
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { omit, pick } from 'lodash-es';
import type { HTMLAttributes } from 'vue';
import FormSelect from '../select/FormSelect.vue';
import RangePicker from './RangePicker.vue';
import { filterOption } from './helper/utils.js';

const props = defineProps({
  // ① 下拉侧（显式声明，不再从 $attrs 取名）
  options: {
    type: Array,
    default: () => [],
  },
  dictCode: {
    type: String,
    default: '',
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  // 字典过滤（仅 FormSelect 的 dictCode 形态生效，由 FormSelect 内部消费）
  filterValues: {
    type: Array,
    default: () => [],
  },
  // ② 选中值：joinArrayValue 开启时「数组」是出口契约（逗号串入口兼容，见下方转换函数）
  selected: {
    type: [Array, String, Number],
    default: undefined,
  },
  joinArrayValue: {
    type: Boolean,
    default: false,
  },
  // ③ 区间侧：显式声明保证 v-model:start / v-model:end 是可见契约（原先靠 $attrs 漏传）
  start: {
    type: String,
    default: undefined,
  },
  end: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits([
  'update:selected',
  'changeSelect',
  'update:start',
  'update:end',
  'change',
]);

const attrs = useAttrs();
// 根外壳只接 class / style（盒子宽度与外部留白归使用方）；其余属性全部转发给区间控件
const rootAttrs = computed(() => pick(attrs, ['class', 'style']) as HTMLAttributes);
// 区间控件属性：curLimit 的隐式默认 max 在此显式声明，调用方传入即覆盖（同 FormRangePicker 口径）
const dateAttrs = computed(() => ({
  curLimit: 'max',
  ...omit(attrs, ['class', 'style']),
}));

// 读侧：把「数组」形式的选中值转成下拉可匹配的逗号串（非空数组才转；关闭时仅把 null 归一为 undefined）
// 写侧：把下拉回传的逗号串拆回数组（出口恒为数组、元素恒为字符串；关闭时原样回传）
const methods = {
  toSelectValue(value: unknown) {
    if (!props.joinArrayValue) return value ?? undefined;
    return Array.isArray(value) && value.length > 0 ? value.join(',') : value;
  },
  toModelValue(value: unknown) {
    if (!props.joinArrayValue) return value;
    return value == null ? undefined : String(value).split(',');
  },
  handleSelectInput(value: unknown) {
    emit('update:selected', methods.toModelValue(value));
  },
  handleSelectChange(value: unknown) {
    emit('changeSelect', methods.toModelValue(value));
  },
};
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.range-picker-group {
  display: flex;
  min-width: 0; // 可被压窄：作为 flex 项时不再按内容最小值顶出表单格
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: var(--border-radius-base, 4px);
  background-color: var(--bg-color-white, #fff);

  &:focus-within {
    border-color: var(--primary-color, #0032a0);
  }

  // 下拉：贴合文案、上限 160px，空间不足时让位
  .form-select {
    width: auto;
    flex: 0 1 auto;
    max-width: 160px;
    border-right: 1px solid var(--border-color-line, #d9d9d9);
  }
}
</style>
