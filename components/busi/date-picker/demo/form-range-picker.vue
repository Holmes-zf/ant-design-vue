<docs>
---
order: 3
title:
  zh-CN: 表单日期区间
  en-US: Form Date Range
---

## zh-CN

`FormRangePicker` = `RangePicker` + 固定宽度外壳，隐式禁未来（`curLimit="max"`）。`width` 控制外壳宽度（数字按 px，CSS 表达式透传）；透传属性直接生效（如 `disabled`）。

## en-US

`FormRangePicker` = `RangePicker` + a fixed-width shell, future dates disallowed implicitly (`curLimit="max"`). `width` controls the shell width (numbers as px, CSS expressions pass through); pass-through props work directly (e.g. `disabled`).

</docs>
<template>
  <a-space direction="vertical" :size="12">
    <FormRangePicker v-model:start="start" v-model:end="end" :width="320" />
    <FormRangePicker v-model:start="start" v-model:end="end" width="50%" disabled />
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormRangePicker from '../FormRangePicker.vue';

export default defineComponent({
  components: { FormRangePicker },
  setup() {
    const start = ref('');
    const end = ref('');
    return { start, end };
  },
});
</script>
