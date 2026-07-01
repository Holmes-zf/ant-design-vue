import type { App, Plugin } from 'vue';
import RadiusButton from './RadiusButton.vue';

/* istanbul ignore next */
RadiusButton.install = function (app: App) {
  app.component('RadiusButton', RadiusButton);
  return app;
};

export default RadiusButton as typeof RadiusButton & Plugin;
