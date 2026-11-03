<template>
  <div class="step">
    <StepIcon :active="active">
      <slot>{{ text }}</slot>
    </StepIcon>
    <div class="step-title ellipsis">{{ title }}</div>
    <div class="step-description ellipsis">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 步骤条单节点（`StepsBox` 的内部件，一般不单独使用）。
 *
 * 几何：宽 208px 是所有节点统一的内容宽（含首末）；首末节点的「贴边」由 `StepsBox`
 *      用负外边距整块外探实现（不改内容宽）。
 */
import StepIcon from './StepIcon.vue';

defineProps<{
  /** 标题 */
  title?: string;
  /** 副标题（如节点时间） */
  description?: string;
  /** 图标位默认内容（`StepsBox` 传序号；外层传默认槽时被槽内容覆盖） */
  text?: string | number;
  /** 是否点亮 */
  active?: boolean;
}>();
</script>

<style lang="less" scoped>
.step {
  width: 208px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .step-title {
    margin-top: 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color-deep, rgba(0, 0, 0, 0.85));
    line-height: 20px;
  }

  .step-description {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 400;
    color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
    line-height: 20px;
  }
}
</style>
