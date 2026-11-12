<docs>
---
order: 1
title:
  zh-CN: 透传容器 id / class
  en-US: Forward container id / class
---

## zh-CN

薄壳关闭了 `inheritAttrs`，`id` / `class` / `style` 等属性会原样落到 echarts 容器 `div` 上；`id` 会覆盖默认的 `mychart`。

## en-US

The shell disables `inheritAttrs`, so `id` / `class` / `style` land on the echarts container `div` as-is; `id` overrides the default `mychart`.

</docs>
<template>
  <PieChart id="my-pie" class="demo-pie" style="width: 320px; height: 240px" :options="options" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PieChart from '../PieChart.vue';

export default defineComponent({
  components: { PieChart },
  setup() {
    const options = {
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          data: [
            { value: 320, name: '电' },
            { value: 240, name: '水' },
            { value: 149, name: '气' },
          ],
        },
      ],
    };
    return { options };
  },
});
</script>
