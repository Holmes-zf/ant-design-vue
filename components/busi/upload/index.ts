import type { App, Plugin } from 'vue';
import FormUpload from './FormUpload.vue';
import FormFileItem from './FormFileItem.vue';
import ImportButton from './ImportButton.vue';

/* istanbul ignore next */
FormUpload.install = function (app: App) {
  app.component('FormUpload', FormUpload);
  app.component('FormFileItem', FormFileItem);
  app.component('ImportButton', ImportButton);
  return app;
};

export { FormFileItem, ImportButton };

export default FormUpload as typeof FormUpload & Plugin;
