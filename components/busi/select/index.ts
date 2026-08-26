import type { App, Plugin } from 'vue';
import FormSelect from './FormSelect.vue';

/* istanbul ignore next */
FormSelect.install = function (app: App) {
  app.component('FormSelect', FormSelect);
  return app;
};

export default FormSelect as typeof FormSelect & Plugin;
