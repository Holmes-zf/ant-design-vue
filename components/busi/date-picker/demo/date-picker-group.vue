<docs>
---
order: 5
title:
  zh-CN: 下拉 + 单日期
  en-US: Select + Date
---

## zh-CN

`DatePickerGroup` 把维度下拉（`FormSelect`）与单日期（`FormDatePicker`）合成一个控件：`v-model:selected` 绑定维度，`v-model:dateValue` 绑定日期。透传属性（如 `format`）转发给右侧日期框。

## en-US

`DatePickerGroup` combines a dimension select (`FormSelect`) with a single date (`FormDatePicker`): `v-model:selected` for the dimension and `v-model:dateValue` for the date. Pass-through props (e.g. `format`) go to the date picker on the right.

</docs>
<template>
  <div style="width: 360px">
    <DatePickerGroup
      v-model:selected="selected"
      v-model:dateValue="dateValue"
      :options="options"
      format="YYYY-MM-DD HH:mm"
      showSearch
    />
    <a-typography-paragraph type="secondary" style="margin-top: 12px; margin-bottom: 0">
      维度：{{ selected ?? '-' }}，日期：{{ dateValue || '-' }}
    </a-typography-paragraph>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DatePickerGroup from '../DatePickerGroup.vue';

export default defineComponent({
  components: { DatePickerGroup },
  setup() {
    const selected = ref('WH001');
    const dateValue = ref('');
    const options = ref([
      { label: 'WH001-上海仓', value: 'WH001' },
      { label: 'WH002-北京仓', value: 'WH002' },
      { label: 'WH003-广州仓', value: 'WH003' },
    ]);
    return { selected, dateValue, options };
  },
});
</script>
