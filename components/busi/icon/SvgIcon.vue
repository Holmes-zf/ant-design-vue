<template>
  <svg class="icon svg-icon" aria-hidden="true">
    <use :xlink:href="svgIcon"></use>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  size: {
    type: [String, Number],
    default: '14px',
  },
});
const fontSize = computed(() => {
  if (typeof props.size == 'number') {
    return props.size + 'px';
  } else if (typeof props.size == 'string') {
    return props.size.replace('px', '') + 'px';
  } else {
    return;
  }
});
const svgIcon = computed(() => {
  return `#${props.icon}`;
});
</script>

<style lang="less">
.svg-icon {
  &.icon {
    width: 1em;
    min-width: 16px !important;
    height: 1em;
    font-size: v-bind(fontSize);
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
}
</style>
