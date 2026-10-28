import type { App, Plugin } from 'vue';
import FormInput from './FormInput.vue';
import FormTextarea from './FormTextarea.vue';
import SelectMultiInput from './SelectMultiInput.vue';
import SelectTextarea from './SelectTextarea.vue';
import MultiInputModal from './MultiInputModal.vue';

/* istanbul ignore next */
FormInput.install = function (app: App) {
  app.component('FormInput', FormInput);
  app.component('FormTextarea', FormTextarea);
  app.component('SelectMultiInput', SelectMultiInput);
  app.component('SelectTextarea', SelectTextarea);
  app.component('MultiInputModal', MultiInputModal);
  return app;
};

export { FormTextarea, SelectMultiInput, SelectTextarea, MultiInputModal };

export default FormInput as typeof FormInput & Plugin;
