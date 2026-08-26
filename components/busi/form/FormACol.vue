<template>
  <a-form-item class="form-acol">
    <slot />
  </a-form-item>
</template>

<script setup>
/**
 * FormACol — 带跨列配置的表单项容器（配套 FormARow 使用）
 *
 * - colspan: 占 colNum 中的 N 个逻辑列（如 colNum=3 时 colspan=2 → 占 2/3）
 * - span: 24 栅格直透（如 span=12 → 占半行）
 * - 其余属性（label / name / rules / required / labelCol 等）自动透传给内部 a-form-item
 */
defineProps({
  // 占 colNum 中的逻辑列数
  colspan: {
    type: [String, Number],
    default: 0,
  },
  // 24 栅格直接透传
  span: {
    type: [String, Number],
    default: 0,
  },
});
</script>
