import type { App, Plugin } from 'vue';
import ActionBody from './ActionBody.vue';

/* istanbul ignore next */
ActionBody.install = function (app: App) {
  app.component('ActionBody', ActionBody);
  return app;
};

export default ActionBody as typeof ActionBody & Plugin;
