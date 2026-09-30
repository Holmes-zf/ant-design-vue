<template>
  <div class="date-picker-group" v-bind="rootAttrs">
    <FormSelect
      :bordered="false"
      :allow-clear="false"
      :options="options"
      :dictCode="dictCode"
      :showSearch="showSearch"
      :value="selected"
      :filterOption="filterOption"
      @update:value="value => emit('update:selected', value)"
      @change="(value, option) => emit('selectChange', value, option)"
    ></FormSelect>
    <FormDatePicker
      v-bind="dateAttrs"
      :bordered="false"
      :value="dateValue"
      @update:value="value => emit('update:dateValue', value)"
      @change="value => emit('dateChange', value)"
    ></FormDatePicker>
  </div>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions，用普通选项声明：显式透传 $attrs 时必须关掉自动继承，避免重复应用
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { omit, pick } from 'lodash-es';
import type { HTMLAttributes } from 'vue';
import FormSelect from '../select/FormSelect.vue';
import FormDatePicker from './FormDatePicker.vue';
import { filterOption } from './helper/utils.js';

defineProps({
  // ① 下拉侧
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
  // 下拉选中值：命名与 RangePickerGroup 的 `selected` 对齐
  selected: {
    type: [Array, String, Number],
    default: undefined,
  },
  // ② 日期侧
  dateValue: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['update:selected', 'update:dateValue', 'selectChange', 'dateChange']);

const attrs = useAttrs();
// 根容器只接 class / style（尺寸与留白归使用方）；其余属性全部转发给日期框
const rootAttrs = computed(() => pick(attrs, ['class', 'style']) as HTMLAttributes);
const dateAttrs = computed(() => omit(attrs, ['class', 'style']));
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.date-picker-group {
  display: flex;
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: 4px;
  background-color: var(--bg-color-white, #fff);

  // 焦点反馈：内层边框已被 bordered=false 抹掉，整体由容器统一响应
  &:focus-within {
    border-color: var(--primary-color, #0032a0);
  }

  // 下拉宽度贴合当前仓库文案、上限 160px：调用点标签是「仓库代码-仓库名」（实测典型墨宽 100~160px），
  // 原定值 145px 可用文字仅 ~105px ⇒ 多数被截断。flex:none ⇒ flex-basis:auto 取文案固有宽度，
  // max-width 只封顶；用 width 会退回定值。320px 盒内月份框仍留 ~158px（其最小可用宽 ~100px）。
  .form-select {
    flex: none;
    max-width: 160px;
    border-right: 1px solid var(--border-color-line, #d9d9d9);
  }

  .form-date-picker {
    flex: 1;
    min-width: 0;
  }
}
</style>
