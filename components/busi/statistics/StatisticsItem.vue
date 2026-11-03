<template>
  <div class="statistics-item">
    <!-- label 超长按省略号收敛，title 兜住全文（原生 tooltip，无需额外交互） -->
    <div class="statistics-item__label" :title="label">{{ label }}</div>
    <div class="statistics-item__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  /** 统计项名称；「：」由样式负责，不要写进文案 */
  label: { type: String, required: true },
});
</script>

<style lang="less" scoped>
.statistics-item {
  display: flex;
  align-items: center;
  // 行高由容器 grid 行轨道决定（--statistics-row-height），条目不自带固定行高
  padding: 0 1.5%;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color-deep, rgba(0, 0, 0, 0.85));
  line-height: 20px;

  &__label {
    flex: 0 1 auto;
    max-width: 60%;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    // 冒号归样式：可样式化、不再是匿名 flex 子项、不参与文案
    &::after {
      content: '：';
    }
  }

  &__content {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
    // 数字等宽，避免数值变化时宽度跳动
    font-variant-numeric: tabular-nums;
  }
}
</style>
