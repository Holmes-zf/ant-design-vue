<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

`StatisticsBox` 决定列数与行高，`StatisticsItem` 只负责「名称：数值」。`collapsible` 开启后内容超出一行才出现折叠开关。

## en-US

`StatisticsBox` owns column count and row height, while `StatisticsItem` only renders "label: value". With `collapsible`, the toggle appears only when content overflows one row.

</docs>
<template>
  <a-space direction="vertical" :size="24" style="width: 100%">
    <StatisticsBox collapsible :columns="4">
      <StatisticsItem v-for="item in items" :key="item.label" :label="item.label">
        {{ item.value }}
      </StatisticsItem>
    </StatisticsBox>

    <StatisticsBox :columns="2">
      <StatisticsItem label="总票数">128</StatisticsItem>
      <StatisticsItem label="总件数">3,204</StatisticsItem>
    </StatisticsBox>
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StatisticsBox from '../StatisticsBox.vue';
import StatisticsItem from '../StatisticsItem.vue';

const items = [
  { label: '总票数', value: '128' },
  { label: '总件数', value: '3,204' },
  { label: '总重量', value: '12,580 kg' },
  { label: '总体积', value: '86.4 m³' },
  { label: '已出库', value: '96' },
  { label: '待出库', value: '32' },
  { label: '异常件', value: '3' },
  { label: '托盘数', value: '48' },
  { label: '客户数', value: '17' },
  { label: '目的港数', value: '6' },
];

export default defineComponent({
  components: { StatisticsBox, StatisticsItem },
  setup() {
    return { items };
  },
});
</script>
