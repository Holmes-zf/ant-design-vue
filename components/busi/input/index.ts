import type { App, Plugin } from 'vue';
import FormInput from './FormInput.vue';

/* istanbul ignore next */
FormInput.install = function (app: App) {
  app.component('FormInput', FormInput);
  return app;
};

export default FormInput as typeof FormInput & Plugin;
