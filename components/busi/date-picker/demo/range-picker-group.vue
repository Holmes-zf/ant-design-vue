<docs>
---
order: 6
title:
  zh-CN: 下拉 + 日期区间
  en-US: Select + Date Range
---

## zh-CN

`RangePickerGroup` 把维度下拉（`FormSelect`）与日期区间（`RangePicker`，隐式禁未来）合成一个控件。`joinArrayValue` 开启后 `v-model:selected` 出口恒为数组（逗号串入口兼容）。

## en-US

`RangePickerGroup` combines a dimension select (`FormSelect`) with a date range (`RangePicker`, future disallowed implicitly). With `joinArrayValue` on, `v-model:selected` is always an array (comma string accepted as input).

</docs>
<template>
  <div style="width: 420px">
    <RangePickerGroup
      v-model:selected="selected"
      v-model:start="start"
      v-model:end="end"
      :options="options"
      joinArrayValue
    />
    <a-typography-paragraph type="secondary" style="margin-top: 12px; margin-bottom: 0">
      维度：{{ selected?.join(' / ') || '-' }}，区间：{{ start || '-' }} ~ {{ end || '-' }}
    </a-typography-paragraph>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RangePickerGroup from '../RangePickerGroup.vue';

export default defineComponent({
  components: { RangePickerGroup },
  setup() {
    const selected = ref<string[]>([]);
    const start = ref('');
    const end = ref('');
    const options = ref([
      { label: 'WH001-上海仓', value: 'WH001' },
      { label: 'WH002-北京仓', value: 'WH002' },
      { label: 'WH003-广州仓', value: 'WH003' },
    ]);
    return { selected, start, end, options };
  },
});
</script>
