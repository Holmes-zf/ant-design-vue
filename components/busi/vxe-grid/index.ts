import type { App, Plugin } from 'vue';
import DcVxeGrid from './DcVxeGrid.vue';

export { useTable } from './vxeTablePlugin';
export { VxeModuleCellArea } from './vxeCellArea';
export { setGridOpts, gridComOptions, gridComEvents, busiOptions, updateQueryParams, updateColumns, PAGE } from './vxeGridConfig';

/* istanbul ignore next */
DcVxeGrid.install = function (app: App) {
  app.component('DcVxeGrid', DcVxeGrid);
  return app;
};

export default DcVxeGrid as typeof DcVxeGrid & Plugin;
