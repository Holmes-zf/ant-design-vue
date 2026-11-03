<docs>
---
order: 4
title:
  zh-CN: 标签 + 下拉
  en-US: Label + Select
---

## zh-CN

`label` 作为左侧前缀标签，其余属性透传给内部 `FormSelect`。外框尺寸由 `style` / `class` 决定，弹层锚点已挂到合成框外层。

## en-US

`label` renders as the leading label, other props go to the inner `FormSelect`. The outer size comes from `style` / `class`, and the popup anchor is already moved outside the composed box.

</docs>
<template>
  <a-space :wrap="true" :size="16">
    <SelectGroup v-model:value="value" label="时间维度" :options="options" style="width: 220px" />
    <SelectGroup
      v-model:value="multipleValue"
      label="状态"
      :options="options"
      multiple
      style="width: 280px"
    />
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SelectGroup from '../SelectGroup.vue';

const options = [
  { value: 'day', label: '按天' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

export default defineComponent({
  components: { SelectGroup },
  setup() {
    const value = ref('day');
    const multipleValue = ref(['day']);
    return { options, value, multipleValue };
  },
});
</script>
