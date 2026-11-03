import type { App, Plugin } from 'vue';
import Popconfirm from './Popconfirm.vue';

/* istanbul ignore next */
Popconfirm.install = function (app: App) {
  app.component('Popconfirm', Popconfirm);
  return app;
};

export default Popconfirm as typeof Popconfirm & Plugin;
