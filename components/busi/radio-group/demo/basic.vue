<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

`v-model:value` 绑定选中值，子项可用 `RadioGroupItem`。`variant="native"` 回到 antd 原生形态，用于承接存量分段按钮。

## en-US

Bind the value with `v-model:value` and use `RadioGroupItem` inside. `variant="native"` falls back to the plain antd form for legacy segmented buttons.

</docs>
<template>
  <a-space direction="vertical" :size="16">
    <RadioGroup v-model:value="value" @change="handleChange">
      <RadioGroupItem value="day">按天</RadioGroupItem>
      <RadioGroupItem value="week">按周</RadioGroupItem>
      <RadioGroupItem value="month">按月</RadioGroupItem>
    </RadioGroup>

    <RadioGroup v-model:value="nativeValue" variant="native">
      <RadioGroupItem value="all">全部</RadioGroupItem>
      <RadioGroupItem value="done">已完成</RadioGroupItem>
      <RadioGroupItem value="todo">未完成</RadioGroupItem>
    </RadioGroup>

    <div>当前值：{{ value }}；原生形态：{{ nativeValue }}</div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RadioGroup from '../RadioGroup.vue';
import RadioGroupItem from '../RadioGroupItem.vue';

export default defineComponent({
  components: { RadioGroup, RadioGroupItem },
  setup() {
    const value = ref('week');
    const nativeValue = ref('all');
    const handleChange = (e: any) => {
      value.value = e?.target?.value;
    };
    return { value, nativeValue, handleChange };
  },
});
</script>
