<template>
  <div class="form-footer" :class="{ 'fixed-footer': fixed }">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 形态契约：
// · 默认：文档流底栏（随内容一起滚动）
// · fixed：常驻底部（position: absolute，定位锚点由页面祖先提供，组件不创建）
// · inset：左右内缩值，默认 12px（对齐页面容器 .menu-content 的 padding）；inset=0 即通栏
const props = defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
  inset: {
    type: [Number, String],
    default: 12,
  },
});

// 归一为 CSS 长度：数字/纯数字字符串补 px；带单位字符串原样透传；null/空串回落 12px（与 props 默认值一致，不静默变通栏）
const insetCss = computed(() => {
  const value = props.inset;
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return '12px';
  }
  const num = Number(value);
  return Number.isFinite(num) ? `${num}px` : String(value).trim();
});
</script>

<style lang="less" scoped>
// 业务主题变量（--form-footer-height / --bg-color-white / --z-index-fixed-footer /
// --form-footer-shadow）在文档站点无定义，以 var() 内联回落值给出浅色基线；
// 接入业务主题后仍可被主题覆盖
.form-footer {
  width: 100%;
  margin-top: 16px;
  min-height: var(--form-footer-height, 60px);
  background: var(--bg-color-white, #fff);
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  & > :deep(.radius-button) {
    margin-left: 16px;
  }

  &.fixed-footer {
    position: absolute;
    bottom: 0;
    left: v-bind(insetCss);
    right: v-bind(insetCss);
    width: auto;
    z-index: var(--z-index-fixed-footer, 600);
    box-shadow: var(--form-footer-shadow, 0 1px 8px rgba(19, 32, 67, 0.1));
  }
}
</style>
