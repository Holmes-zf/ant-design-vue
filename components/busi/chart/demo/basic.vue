<docs>
---
order: 0
title:
  zh-CN: 基础饼图
  en-US: Basic pie
---

## zh-CN

通过 `options` 传入 echarts 饼图配置，数据变化时组件会自动调用 `setOption` 更新。

## en-US

Pass the echarts pie option via `options`; the component calls `setOption` automatically when data changes.

</docs>
<template>
  <PieChart style="width: 320px; height: 240px" :options="options" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PieChart from '../PieChart.vue';

export default defineComponent({
  components: { PieChart },
  setup() {
    const options = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: [
            { value: 1048, name: '已发货' },
            { value: 735, name: '待发货' },
            { value: 580, name: '已取消' },
          ],
        },
      ],
    };
    return { options };
  },
});
</script>
