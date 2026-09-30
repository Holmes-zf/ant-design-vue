<template>
  <demo-sort :cols="1">
    <demo-form-date-picker />
    <demo-form-utc-date-picker />
    <demo-range-picker />
    <demo-form-range-picker />
    <demo-date-time-range-picker />
    <demo-date-picker-group />
    <demo-range-picker-group />
  </demo-sort>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DemoFormDatePicker from './form-date-picker.vue';
import DemoFormUTCDatePicker from './form-utc-date-picker.vue';
import DemoRangePicker from './range-picker.vue';
import DemoFormRangePicker from './form-range-picker.vue';
import DemoDateTimeRangePicker from './date-time-range-picker.vue';
import DemoDatePickerGroup from './date-picker-group.vue';
import DemoRangePickerGroup from './range-picker-group.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';

export default defineComponent({
  CN,
  US,
  components: {
    DemoFormDatePicker,
    DemoFormUTCDatePicker,
    DemoRangePicker,
    DemoFormRangePicker,
    DemoDateTimeRangePicker,
    DemoDatePickerGroup,
    DemoRangePickerGroup,
  },
});
</script>
