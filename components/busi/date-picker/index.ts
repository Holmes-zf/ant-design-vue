import type { App, Plugin } from 'vue';
import FormDatePicker from './FormDatePicker.vue';
import FormUTCDatePicker from './FormUTCDatePicker.vue';
import FormRangePicker from './FormRangePicker.vue';
import RangePicker from './RangePicker.vue';
import DateTimeRangePicker from './DateTimeRangePicker.vue';
import DatePickerGroup from './DatePickerGroup.vue';
import RangePickerGroup from './RangePickerGroup.vue';

/* istanbul ignore next */
FormDatePicker.install = function (app: App) {
  app.component('FormDatePicker', FormDatePicker);
  app.component('FormUTCDatePicker', FormUTCDatePicker);
  app.component('FormRangePicker', FormRangePicker);
  app.component('RangePicker', RangePicker);
  app.component('DateTimeRangePicker', DateTimeRangePicker);
  app.component('DatePickerGroup', DatePickerGroup);
  app.component('RangePickerGroup', RangePickerGroup);
  return app;
};

export {
  FormDatePicker,
  FormUTCDatePicker,
  FormRangePicker,
  RangePicker,
  DateTimeRangePicker,
  DatePickerGroup,
  RangePickerGroup,
};

export default FormDatePicker as typeof FormDatePicker & Plugin;
