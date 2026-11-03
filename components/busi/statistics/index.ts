import type { App, Plugin } from 'vue';
import StatisticsBox from './StatisticsBox.vue';
import StatisticsItem from './StatisticsItem.vue';

/* istanbul ignore next */
StatisticsBox.install = function (app: App) {
  app.component('StatisticsBox', StatisticsBox);
  app.component('StatisticsItem', StatisticsItem);
  return app;
};

export { StatisticsItem };

export default StatisticsBox as typeof StatisticsBox & Plugin;
