import type { App, Plugin } from 'vue';
import PieChart from './PieChart.vue';

/* istanbul ignore next */
PieChart.install = function (app: App) {
  app.component('PieChart', PieChart);
  return app;
};

export default PieChart as typeof PieChart & Plugin;
