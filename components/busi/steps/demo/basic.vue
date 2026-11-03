<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

`value` 显式指定点亮的节点（适合跳节点场景），`current` 按顺序点亮。每个示例独占一行，节点较多需要横向滚动时在外层套 `ScrollBox`。

## en-US

`value` lights nodes explicitly (useful when nodes are skipped) while `current` lights them sequentially. Each example takes a full row; wrap it in `ScrollBox` when horizontal scrolling is needed.

</docs>
<template>
  <a-space direction="vertical" :size="24" style="width: 100%">
    <StepsBox :steps="steps" :value="litIndexes" />

    <a-space :size="16" :wrap="true">
      <a-button @click="litIndexes = [0]">只到第 1 步</a-button>
      <a-button @click="litIndexes = [0, 1, 2]">到第 3 步</a-button>
      <a-button @click="litIndexes = [0, 1, 2, 3]">全部点亮</a-button>
    </a-space>

    <StepsBox :steps="steps" :current="2" />
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import StepsBox from '../StepsBox.vue';

const steps = [
  { title: '已下单', description: '2026-11-01 10:20' },
  { title: '已入库', description: '2026-11-01 15:40' },
  { title: '已出库', description: '2026-11-02 09:10' },
  { title: '已签收', description: '-' },
];

export default defineComponent({
  components: { StepsBox },
  setup() {
    const litIndexes = ref([0, 1, 2]);
    return { steps, litIndexes };
  },
});
</script>
