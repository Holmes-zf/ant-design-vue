<template>
  <div class="form-title">
    <div class="title">
      <slot></slot>
    </div>
    <div class="separated"></div>
    <div class="tool">
      <slot name="tool"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * FormTitle — 表单标题栏
 *
 * - 默认插槽：标题文案
 * - tool 插槽：右侧操作区
 * - inset：左右内缩，语义同 FormFooter（0 = 与宿主容器 / 内容块对齐）
 */
const props = defineProps({
  // 左右内缩：数字补 px；带单位字符串原样透传；空值回落 20px
  inset: {
    type: [Number, String],
    default: 20,
  },
});

const insetCss = computed(() => {
  const value = props.inset;
  if (value == null) return '20px';
  const str = String(value).trim();
  if (str === '') return '20px';
  return Number.isFinite(Number(str)) ? `${Number(str)}px` : str;
});
</script>

<style lang="less" scoped>
// 业务主题变量（--text-color-deep / --divider-color）在文档站点无定义，
// 以 var() 内联回落值给出浅色基线；接入业务主题后仍可被主题覆盖
.form-title {
  // 左右内缩出口：默认 20px（与 FormRow / .box-padding 的容器内缩对齐）
  --form-title-inset: v-bind(insetCss);
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px var(--form-title-inset) 16px;
  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-deep, #122d41);
    line-height: 20px;
    letter-spacing: 1px;
  }
  .separated {
    height: 1px;
    flex: 1;
    background: var(--divider-color, #eeeeee);
    margin-left: 15px;
  }
}
</style>
