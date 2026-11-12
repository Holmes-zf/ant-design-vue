<template>
  <svg class="svg-icon icon">
    <use :xlink:href="svgIcon"></use>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
// SVG sprite 注入收编：外部系统在 index.html 全局引入 iconfont.js，本仓库无全局注入点，
// 由组件自身引入（ES 模块缓存保证只执行一次；icon 类别 demo 里的同路径 import 指向同一模块）。
// 引入后 window._iconfont_svg_string_* 定义并把 <symbol> 注入页面，<use xlink:href> 才有目标。
import './assets/iconfont-core/iconfont.js';
import './assets/iconfont-busi/iconfont.js';
const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: [String, Number], default: 14 },
});

const svgIcon = computed(() => (props.icon ? `#${props.icon}` : ''));

const fontSize = computed(() => {
  const num = Number(props.size);
  if (Number.isFinite(num)) {
    return `${num > 0 ? num : 14}px`;
  }
  return props.size || '14px';
});
</script>

<style lang="less" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  font-size: v-bind(fontSize);
  fill: currentColor;
  overflow: hidden;
  vertical-align: -0.15em;
  transition: color 0.15s ease;
  color: inherit;
}
</style>
