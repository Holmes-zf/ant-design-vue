<template>
  <div :class="['step-icon', { active }]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * 步骤条圆形图标壳（`Step` 的内部件，一般不单独使用）。
 *
 * 几何：44px 固定圆 —— 与 `StepSpotIcon` 的 `height: 44px`（连接点垂直居中对齐）成对。
 */
defineProps<{
  /** 是否点亮（点亮 = 主色底 + 主色同族投影） */
  active?: boolean;
}>();
</script>

<style lang="less" scoped>
.step-icon {
  width: 44px;
  height: 44px;
  background: var(--text-color-deep, rgba(0, 0, 0, 0.85));
  box-shadow: 0 4px 13px 0
    color-mix(in srgb, var(--text-color-deep, rgba(0, 0, 0, 0.85)) 30%, transparent);
  font-size: 24px;
  color: var(--bg-color-white, #fff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &.active {
    background: var(--primary-color, #0032a0);
    box-shadow: 0 4px 13px 0 color-mix(in srgb, var(--primary-color, #0032a0) 45%, transparent);
  }
}
</style>
