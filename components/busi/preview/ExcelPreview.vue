<template>
  <!-- 薄壳：只做 attrs / slots 透传，重实现在 impl/ 内。
       文档站约束：不使用 defineAsyncComponent（异步加载会在路由切换时产生竞态，演示区偶发空白）。 -->
  <ExcelPreviewImpl v-bind="$attrs">
    <template v-for="(_, slotsName) in $slots" #[slotsName]="scope">
      <slot :name="slotsName" v-bind="scope" />
    </template>
  </ExcelPreviewImpl>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions，用普通选项声明：显式透传 $attrs 时必须关掉自动继承，避免重复应用
export default {
  name: 'ExcelPreview',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import ExcelPreviewImpl from './impl/ExcelPreviewImpl.vue';
</script>
