import type { App, Plugin } from 'vue';
import ScrollBox from './ScrollBox.vue';

/* istanbul ignore next */
ScrollBox.install = function (app: App) {
  app.component('ScrollBox', ScrollBox);
  return app;
};

export default ScrollBox as typeof ScrollBox & Plugin;
