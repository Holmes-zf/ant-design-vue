import type { App, Plugin } from 'vue';
import Dropdown from './Dropdown.vue';

/* istanbul ignore next */
Dropdown.install = function (app: App) {
  app.component('Dropdown', Dropdown);
  return app;
};

export default Dropdown as typeof Dropdown & Plugin;
