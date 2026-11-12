import type { App, Plugin } from 'vue';
import RichTextEditor from './RichTextEditor.vue';

/* istanbul ignore next */
RichTextEditor.install = function (app: App) {
  app.component('RichTextEditor', RichTextEditor);
  return app;
};

export default RichTextEditor as typeof RichTextEditor & Plugin;
