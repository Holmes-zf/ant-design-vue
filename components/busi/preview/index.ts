import type { App, Plugin } from 'vue';
import PreviewModal from './PreviewModal.vue';
import PDFPreview from './PDFPreview.vue';
import ImgPreview from './ImgPreview.vue';
import ExcelPreview from './ExcelPreview.vue';
import WordPreview from './WordPreview.vue';
import TextPreview from './TextPreview.vue';
import EmptyPreview from './EmptyPreview.vue';

/* istanbul ignore next */
PreviewModal.install = function (app: App) {
  app.component('PreviewModal', PreviewModal);
  app.component('PDFPreview', PDFPreview);
  app.component('ImgPreview', ImgPreview);
  app.component('ExcelPreview', ExcelPreview);
  app.component('WordPreview', WordPreview);
  app.component('TextPreview', TextPreview);
  app.component('EmptyPreview', EmptyPreview);
  return app;
};

export { PDFPreview, ImgPreview, ExcelPreview, WordPreview, TextPreview, EmptyPreview };

export default PreviewModal as typeof PreviewModal & Plugin;
