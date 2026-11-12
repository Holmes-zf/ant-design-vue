<template>
  <div class="action-body" :class="`action-body--${align}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  align: {
    type: String,
    default: 'left',
  },
});
</script>

<style lang="less" scoped>
.action-body {
  display: flex;
  align-items: center;
  gap: 8px;
  & > * {
    white-space: nowrap;
  }
  &--center {
    justify-content: center;
  }
  &--right {
    justify-content: flex-end;
  }
}
</style>
