<template>
  <div class="form-range-picker light-form-range-picker">
    <RangePicker curLimit="max" v-bind="$attrs"></RangePicker>
  </div>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：$attrs 已显式透传给 RangePicker，必须同时关掉自动继承，
// 否则同一份属性会再落到根 div 上一次（同 FormDatePicker 的处理）
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import RangePicker from './RangePicker.vue';
import { toCssSize } from './helper/utils.js';

const props = defineProps({
  width: {
    type: [String, Number],
    default: 320,
  },
});

// 尺寸口径统一走公共工具（数字/纯数字串补 px；带单位与 CSS 关键字透传；空值与非有限数值不设宽度）
const width = computed(() => toCssSize(props.width));
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.form-range-picker {
  width: v-bind(width);
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: var(--border-radius-base, 4px);
  display: flex;
  align-items: center;
  background: var(--bg-color-white, #fff);

  // 边框已收到外壳、聚焦态仍在内层 picker ⇒ 由容器统一响应
  // （聚焦变主色、无发光，与 FormDatePicker / DatePickerGroup 同口径）
  &:focus-within {
    border-color: var(--primary-color, #0032a0);
  }

  // scoped 下靠"子组件根元素继承父 scope id"命中 RangePicker 根元素；
  // 深层 input 的居中由 RangePicker 自身样式负责，这里不重复声明
  .define-range-picker.ant-picker {
    width: 0;
    flex: 1;
    border: none;
    &.ant-picker-focused {
      box-shadow: none;
    }
  }
}
</style>
