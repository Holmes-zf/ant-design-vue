<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

分页统计条：`statistics` 数组驱动，`name` 由宿主传入**已翻译文本**（本组件不做 i18n），`name` 缺失的条目降级为「值 单位」。

## en-US

Pager statistics bar driven by the `statistics` array. `name` is passed in already translated by the host (no i18n here); items without `name` degrade to "value unit".

</docs>
<template>
  <PagerStatistics :statistics="statistics" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PagerStatistics from '../PagerStatistics.vue';

export default defineComponent({
  name: 'DemoPagerStatistics',
  components: { PagerStatistics },
  setup() {
    // name 传已翻译文本；name 缺失的条目降级为「值 单位」
    const statistics = [
      { name: '总票数', value: 128 },
      { name: '总件数', value: 3204, unit: '件' },
      { name: '总重量', value: '12,580', unit: 'kg' },
      { value: '96', unit: '托' },
    ];
    return { statistics };
  },
});
</script>
