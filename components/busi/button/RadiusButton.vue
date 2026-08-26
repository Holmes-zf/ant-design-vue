<template>
  <a-button class="radius-button" v-bind="$attrs">
    <slot />
  </a-button>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  minWidth: {
    type: [String, Number],
    default: undefined,
  },
});
const minWidthCss = computed(() => {
  const value = props.minWidth;
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const num = Number(value);
  // 有限数字（数字/纯数字字符串）补 px；带单位字符串或非有限值（vw/%/Infinity 等）原样透传
  return Number.isFinite(num) ? num + 'px' : value;
});
</script>

<style lang="less" scoped>
.radius-button {
  padding: 0 10px;
  border-radius: 4px;
  overflow: hidden;
  min-width: v-bind(minWidthCss);
}
</style>
