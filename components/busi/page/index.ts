import type { App, Plugin } from 'vue';
import PageBody from './PageBody.vue';
import PageBodyHeader from './PageBodyHeader.vue';
import DetailPage from './DetailPage.vue';
import DetailHeader from './DetailHeader.vue';
import DetailContainer from './DetailContainer.vue';

/* istanbul ignore next */
PageBody.install = function (app: App) {
  app.component('PageBody', PageBody);
  app.component('PageBodyHeader', PageBodyHeader);
  app.component('DetailPage', DetailPage);
  app.component('DetailHeader', DetailHeader);
  app.component('DetailContainer', DetailContainer);
  return app;
};

export { PageBodyHeader, DetailPage, DetailHeader, DetailContainer };

export default PageBody as typeof PageBody & Plugin;
