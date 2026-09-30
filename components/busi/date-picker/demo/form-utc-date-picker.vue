<docs>
---
order: 1
title:
  zh-CN: 限时窗口
  en-US: Limited Time Window
---

## zh-CN

`FormUTCDatePicker` 在外壳能力之上叠加「限时窗口」：`timeLimit` 声明口岸时区「此刻」往前多少小时内可选，`timeZone` 指定时区。日期格与时·分·秒列同步禁用；输入框手输的候选值越界时「确定」按钮灰显不可点。

## en-US

`FormUTCDatePicker` adds a limited time window on top of the shell: `timeLimit` declares how many hours before "now" in the port time zone are selectable, `timeZone` sets the zone. Date cells and hour/minute/second columns are disabled accordingly; when a manually typed candidate is out of the window, the OK button is disabled.

</docs>
<template>
  <a-space direction="vertical" :size="12" style="width: 360px">
    <FormUTCDatePicker
      v-model:value="value"
      format="YYYY-MM-DD HH:mm"
      :timeLimit="2"
      timeZone="UTC+8"
    />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      当前值：{{ value || '空' }}（仅可选 UTC+8 此刻往前 2 小时内）
    </a-typography-paragraph>
    <FormUTCDatePicker v-model:value="free" format="YYYY-MM-DD HH:mm" />
    <a-typography-paragraph type="secondary" style="margin-bottom: 0">
      不传 timeLimit 时不做任何限制
    </a-typography-paragraph>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormUTCDatePicker from '../FormUTCDatePicker.vue';

export default defineComponent({
  components: { FormUTCDatePicker },
  setup() {
    const value = ref('');
    const free = ref('');
    return { value, free };
  },
});
</script>
