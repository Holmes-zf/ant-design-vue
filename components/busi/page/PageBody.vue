<template>
  <div class="page-body">
    <!-- 页头横条复用 PageBodyHeader（尺寸/底色/间距由它提供）；class="page-header" 仅作外部样式锚点保留 -->
    <!-- 渲染与否 = 有没有 #header 槽；排布恒为「换行」（PageBodyHeader 基础即 flex-wrap:wrap） -->
    <PageBodyHeader v-if="$slots.header" class="page-header">
      <slot name="header"></slot>
    </PageBodyHeader>
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PageBodyHeader from './PageBodyHeader.vue';

const props = defineProps({
  // 宽度：数字 / 纯数字串按 px 处理，带单位或 CSS 关键字原样透传（toCssSize 口径）
  width: {
    type: [String, Number],
    default: '100%',
  },
  // 高度：口径同 width；默认撑满父级，需随内容长高时传 "auto"
  height: {
    type: [String, Number],
    default: '100%',
  },
});

// 尺寸口径：数字 / 纯数字串补 px；带单位与 CSS 关键字透传；空值与非有限数值不设尺寸
const toCssSize = (value: string | number, fallback?: string) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return fallback;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : fallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? `${num}px` : value;
};

const widthCss = computed(() => toCssSize(props.width));
const heightCss = computed(() => toCssSize(props.height));
</script>

<style lang="less" scoped>
// 使用方要改内容区样式时，用「祖先类 + 目标类」（多数配合 :deep()）即可稳定胜出，例如
//   .detail-wrap :deep(.page-content) { overflow: auto; }
.page-body {
  width: v-bind(widthCss);
  height: v-bind(heightCss);
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-color-white, #fff);
}
</style>
