import type { App, Plugin } from 'vue';
import FormSelect from './FormSelect.vue';
import FormSelectDefault from './FormSelectDefault.vue';
import SelectGroup from './SelectGroup.vue';

/* istanbul ignore next */
FormSelect.install = function (app: App) {
  app.component('FormSelect', FormSelect);
  app.component('FormSelectDefault', FormSelectDefault);
  app.component('SelectGroup', SelectGroup);
  return app;
};

export { FormSelectDefault, SelectGroup };

export default FormSelect as typeof FormSelect & Plugin;
