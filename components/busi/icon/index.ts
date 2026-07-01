import type { App, Plugin } from 'vue';
import SvgIcon from './SvgIcon.vue';

/* istanbul ignore next */
SvgIcon.install = function (app: App) {
  app.component('SvgIcon', SvgIcon);
  return app;
};

export default SvgIcon as typeof SvgIcon & Plugin;
