<docs>
---
order: 4
title:
  zh-CN: 日期时间区间
  en-US: Datetime Range
---

## zh-CN

`DateTimeRangePicker` 自绘双月面板：双月联动、底部「日期 / 时间」四格切换、全局「确定」按钮。点触发框某一段切换操作端，落笔后自动交替；`showTime: false` 时选满两端即自动确认。`span` 限制跨度并自动修正另一端。

## en-US

`DateTimeRangePicker` renders a custom dual-month panel: linked months, date/time tabs at the bottom and a global OK button. Clicking a segment of the trigger box switches the writing side, which alternates after each pick; with `showTime: false` the range auto-confirms once both sides are picked. `span` limits the span and auto-corrects the other side.

</docs>
<template>
  <a-space direction="vertical" :size="12" style="width: 360px">
    <DateTimeRangePicker
      v-model:start="start"
      v-model:end="end"
      :span="7"
      :showTime="{ defaultValue: ['09:00:00', '18:00:00'] }"
      @ok="onOk"
    />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      当前区间：{{ start || '-' }} ~ {{ end || '-' }}（跨度 ≤ 7 天，默认时间 09:00 / 18:00）
    </a-typography-paragraph>
    <DateTimeRangePicker
      v-model:start="noTimeStart"
      v-model:end="noTimeEnd"
      :showTime="false"
      curLimit="no"
    />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      showTime=false：不带时间，选满两端自动确认
    </a-typography-paragraph>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DateTimeRangePicker from '../DateTimeRangePicker.vue';

export default defineComponent({
  components: { DateTimeRangePicker },
  setup() {
    const start = ref('');
    const end = ref('');
    const noTimeStart = ref('');
    const noTimeEnd = ref('');
    const onOk = (list: string[]) => {
      console.log('datetime range ok:', list);
    };
    return { start, end, noTimeStart, noTimeEnd, onOk };
  },
});
</script>
