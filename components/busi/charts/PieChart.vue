<template>
  <!-- 薄壳：只做 attrs 透传。
       注意：id 必须原样透传给实现（实现靠 document.getElementById(props.id) 初始化），不得加前缀。
       文档站约束：不使用 defineAsyncComponent（异步加载会在路由切换时产生竞态，演示区偶发空白）。 -->
  <PieChartImpl v-bind="$attrs" />
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions，用普通选项声明。attrs 的唯一出口是模板里的 v-bind="$attrs"：
// 关掉自动继承，避免"两个出口同时生效"依赖 mergeProps 对同值 attrs 的去重（前提一破就会重复应用）
export default {
  name: 'PieChart',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import PieChartImpl from './impl/PieChartImpl.vue';
</script>
