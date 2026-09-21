import type { App, Plugin } from 'vue';
import FormRow from './FormRow.vue';
import FormBox from './FormBox.vue';
import FormARow from './FormARow.vue';
import FormACol from './FormACol.vue';
import FormTitle from './FormTitle.vue';
import FormFooter from './FormFooter.vue';

/* istanbul ignore next */
FormRow.install = function (app: App) {
  app.component('FormRow', FormRow);
  app.component('FormBox', FormBox);
  app.component('FormARow', FormARow);
  app.component('FormACol', FormACol);
  app.component('FormTitle', FormTitle);
  app.component('FormFooter', FormFooter);
  return app;
};

export { FormBox, FormARow, FormACol, FormTitle, FormFooter };
export default FormRow as typeof FormRow & Plugin;
