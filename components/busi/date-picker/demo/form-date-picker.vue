<docs>
---
order: 0
title:
  zh-CN: 单个日期时间
  en-US: Single Date/Time
---

## zh-CN

`FormDatePicker` 通过 `v-model:value` 双向绑定字符串值（格式恒为 `format`）。`format` 含 `HH:mm` 时自动出现时间面板；`formType="fail"` 展示错误态。透传属性直接生效（如 `disabled`、`allow-clear`）。

## en-US

`FormDatePicker` binds a string value via `v-model:value` (always in `format`). A time panel appears automatically when `format` contains `HH:mm`; `formType="fail"` shows the error state. Pass-through props work directly (e.g. `disabled`, `allow-clear`).

</docs>
<template>
  <a-space direction="vertical" :size="12" style="width: 360px">
    <FormDatePicker v-model:value="dateTime" format="YYYY-MM-DD HH:mm" />
    <FormDatePicker v-model:value="dateOnly" format="YYYY-MM-DD" />
    <FormDatePicker v-model:value="failed" format="YYYY-MM-DD HH:mm" formType="fail" />
    <FormDatePicker v-model:value="dateOnly" format="YYYY-MM-DD HH:mm" disabled />
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormDatePicker from '../FormDatePicker.vue';

export default defineComponent({
  components: { FormDatePicker },
  setup() {
    const dateTime = ref('2026-09-30 10:30');
    const dateOnly = ref('');
    const failed = ref('');
    return { dateTime, dateOnly, failed };
  },
});
</script>
