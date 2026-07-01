import type { App, Plugin } from 'vue';
import Modal from './Modal.vue';
import ConfirmModal from './ConfirmModal.vue';

/* istanbul ignore next */
Modal.install = function (app: App) {
  app.component('Modal', Modal);
  app.component('ConfirmModal', ConfirmModal);
  return app;
};

export { ConfirmModal };
export type { default as ModalType } from './Modal.vue';

export default Modal as typeof Modal &
  Plugin & {
    readonly Confirm: typeof ConfirmModal;
  };
