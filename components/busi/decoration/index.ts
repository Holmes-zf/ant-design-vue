import type { App, Plugin } from 'vue';
import Empty from './Empty.vue';

/* istanbul ignore next */
Empty.install = function (app: App) {
  app.component('Empty', Empty);
  return app;
};

export default Empty as typeof Empty & Plugin;
