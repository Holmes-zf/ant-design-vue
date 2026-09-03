<template>
  <div :class="['grid-wrap', gridTheme]">
    <vxe-grid v-bind="$attrs" ref="xGrid" tabindex="-1">
      <template v-for="(_, slotsName) in $slots" #[slotsName]="scope">
        <slot :name="slotsName" v-bind="scope" />
      </template>
      <template v-if="!$slots['empty']" #empty>
        <a-empty :image="SIMPLE_IMAGE" />
      </template>
      <template v-if="!$slots['pagerLeft']" #pagerLeft></template>
    </vxe-grid>
  </div>
</template>
<script>
export default {
  name: 'DcVxeGrid',
};
</script>
<script setup>
import { Empty } from 'ant-design-vue';
import { ref } from 'vue';

defineProps({
  gridTheme: {
    type: String,
    default: 'grid--default',
  },
});

const SIMPLE_IMAGE = Empty.PRESENTED_IMAGE_SIMPLE;
const xGrid = ref();
// vxe 自身已内置 onActivated → recalculate → refreshScroll 与 autoResize ResizeObserver，
// 切回时的重算不依赖此处；若表格空白问题复发再恢复 element-resize-detector 方案
defineExpose({
  grid: xGrid,
});
</script>

<style lang="less">
@import './style/index.less';
</style>
