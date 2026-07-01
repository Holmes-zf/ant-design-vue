<template>
  <a-button :class="['radius-button', className]" v-bind="$attrs">
    <slot></slot>
  </a-button>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  width: {
    type: [String, Number],
    default: undefined,
  },
  grey: {
    type: Boolean,
    default: false,
  },
});
const width = computed(() => {
  if (typeof props.width == 'number') {
    return props.width + 'px';
  } else if (typeof props.width == 'string') {
    if (props.width.includes('%')) return props.width;
    return props.width.replace('px', '') + 'px';
  } else {
    return;
  }
});
const className = computed(() => {
  return {
    'ant-btn-grey': props.grey,
  };
});
</script>

<style lang="less">
body {
  .radius-button {
    padding: 0 20px;
  }
}
.radius-button {
  border-radius: 4px !important;
  overflow: hidden;
  min-width: v-bind(width);
  &.ant-btn-grey {
    color: #9ba7af;
    border-color: #d7dcdf;
    background: #d7dcdf;
    box-shadow: 0 2px 0 rgb(0 0 0 / 5%);
    &:hover {
      color: #9ba7af;
      background: #e4e8eb;
      border-color: #e4e8eb;
    }
    &:active {
      color: #9ba7af;
      background: #cdcfd1;
      border-color: #cdcfd1;
    }
    &:focus {
      color: #9ba7af;
      background: #cdcfd1;
      border-color: #cdcfd1;
    }
  }
}
</style>
