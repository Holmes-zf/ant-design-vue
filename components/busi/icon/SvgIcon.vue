<template>
  <svg class="svg-icon icon">
    <use :xlink:href="svgIcon"></use>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: [String, Number], default: 14 },
});

const svgIcon = computed(() => (props.icon ? `#${props.icon}` : ''));

const fontSize = computed(() => {
  const num = Number(props.size);
  if (Number.isFinite(num)) {
    return `${num > 0 ? num : 14}px`;
  }
  return props.size || '14px';
});
</script>

<style lang="less" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  font-size: v-bind(fontSize);
  fill: currentColor;
  overflow: hidden;
  vertical-align: -0.15em;
  transition: color 0.15s ease;
  color: inherit;
}
</style>
