import type { App, Plugin } from 'vue';
import EyeSwitch from './EyeSwitch.vue';
import InputSwitch from './InputSwitch.vue';

/* istanbul ignore next */
EyeSwitch.install = function (app: App) {
  app.component('EyeSwitch', EyeSwitch);
  app.component('InputSwitch', InputSwitch);
  return app;
};

export { InputSwitch };

export default EyeSwitch as typeof EyeSwitch & Plugin;
