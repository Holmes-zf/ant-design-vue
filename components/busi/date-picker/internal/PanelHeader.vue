<template>
  <div class="dc-panel-header" :class="`dc-panel-header--${position}`">
    <template v-if="position === 'left'">
      <span v-if="showSuperPrev" class="dc-panel-header__btn" @click="$emit('super-prev')">
        <IconDoubleLeft />
      </span>
      <span v-if="showPrev" class="dc-panel-header__btn" @click="$emit('prev')">
        <IconLeft />
      </span>
    </template>
    <span class="dc-panel-header__title">{{ title }}</span>
    <template v-if="position === 'right'">
      <span v-if="showNext" class="dc-panel-header__btn" @click="$emit('next')">
        <IconRight />
      </span>
      <span v-if="showSuperNext" class="dc-panel-header__btn" @click="$emit('super-next')">
        <IconDoubleRight />
      </span>
    </template>
  </div>
</template>

<script setup>
import { IconDoubleLeft, IconDoubleRight, IconLeft, IconRight } from './panelIcons.js';

const props = defineProps({
  /** 面板位置：left 显示上一组箭头，right 显示下一组箭头 */
  position: {
    type: String,
    default: 'left',
    validator: value => ['left', 'right'].includes(value),
  },
  /** 面板标题（如 2026-09） */
  title: {
    type: String,
    default: '',
  },
  showSuperPrev: { type: Boolean, default: false },
  showPrev: { type: Boolean, default: false },
  showNext: { type: Boolean, default: false },
  showSuperNext: { type: Boolean, default: false },
});

defineEmits(['prev', 'next', 'super-prev', 'super-next']);
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.dc-panel-header {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 32px;
  user-select: none;

  &--right {
    justify-content: flex-end;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--heading-color, rgba(0, 0, 0, 0.85));
    padding: 0 6px;
    white-space: nowrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: var(--primary-color, #0032a0);
      background: var(--select-bg-color, #f5f7fa);
    }
  }
}
</style>
