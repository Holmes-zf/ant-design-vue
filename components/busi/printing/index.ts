import type { App, Plugin } from 'vue';
import PrintingBody from './PrintingBody.vue';

/* istanbul ignore next */
PrintingBody.install = function (app: App) {
  app.component('PrintingBody', PrintingBody);
  return app;
};

export default PrintingBody as typeof PrintingBody & Plugin;
