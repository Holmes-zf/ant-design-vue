<docs>
---
order: 2
title:
  zh-CN: 日期区间
  en-US: Date Range
---

## zh-CN

`RangePicker` 通过 `v-model:start` / `v-model:end` 双向绑定两端字符串。`span` 限制含头含尾跨度（本例 7 天），超限落笔时另一端自动拉到边界；`curLimit="max"` 禁未来，`pointTime` 把边界整体前移。

## en-US

`RangePicker` binds both sides via `v-model:start` / `v-model:end`. `span` limits the inclusive span (7 days here); when exceeded, the other side is auto-clamped to the boundary. `curLimit="max"` disallows future dates and `pointTime` shifts the boundary back.

</docs>
<template>
  <a-space direction="vertical" :size="12" style="width: 360px">
    <RangePicker
      v-model:start="start"
      v-model:end="end"
      :span="7"
      curLimit="max"
      @change="onChange"
    />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      当前区间：{{ start || '-' }} ~ {{ end || '-' }}（最多 7 天，禁未来）
    </a-typography-paragraph>
    <RangePicker v-model:start="freeStart" v-model:end="freeEnd" :span="0" curLimit="no" />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      span=0 + curLimit=no：不限制跨度与方向
    </a-typography-paragraph>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RangePicker from '../RangePicker.vue';

export default defineComponent({
  components: { RangePicker },
  setup() {
    const start = ref('');
    const end = ref('');
    const freeStart = ref('');
    const freeEnd = ref('');
    const onChange = (list: string[]) => {
      console.log('range change:', list);
    };
    return { start, end, freeStart, freeEnd, onChange };
  },
});
</script>
