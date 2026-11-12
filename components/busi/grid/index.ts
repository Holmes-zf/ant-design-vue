import type { App, Plugin } from 'vue';
import PagerStatistics from './PagerStatistics.vue';
import ActionBody from './ActionBody.vue';
import GridAction from './GridAction.vue';
import GridQryBtn from './GridQryBtn.vue';
import ColumnsConfig from './ColumnsConfig.vue';
import DcGridQryForm from './DcGridQryForm.vue';

/* istanbul ignore next */
const Grid = {
  install(app: App) {
    app.component('PagerStatistics', PagerStatistics);
    app.component('ActionBody', ActionBody);
    app.component('GridAction', GridAction);
    app.component('GridQryBtn', GridQryBtn);
    app.component('ColumnsConfig', ColumnsConfig);
    app.component('DcGridQryForm', DcGridQryForm);
    return app;
  },
} as Plugin;

export { PagerStatistics, ActionBody, GridAction, GridQryBtn, ColumnsConfig, DcGridQryForm };
export default Grid;
