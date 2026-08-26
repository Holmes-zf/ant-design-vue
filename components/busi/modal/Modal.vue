<template>
  <a-modal
    class="define-modal"
    v-model:visible="state.visible"
    :maskClosable="false"
    :maskStyle="state.maskStyle"
    v-bind="attrs"
    @cancel="methods.cancel"
  >
    <template #footer>
      <slot name="footer">
        <a-space :size="16">
          <RadiusButton
            type="primary"
            :loading="loading"
            @click="methods.confirm"
          >
            <slot name="okText">
              {{ okText || '确认' }}
            </slot>
          </RadiusButton>
          <RadiusButton
            type="primary"
            ghost
            :loading="loading"
            @click="methods.cancel"
          >
            <slot name="cancelText">
              {{ cancelText || '取消' }}
            </slot>
          </RadiusButton>
        </a-space>
      </slot>
    </template>
    <template
      v-for="slotName in Object.keys($slots).filter(s => s !== 'footer')"
      #[slotName]
    >
      <slot :name="slotName"></slot>
    </template>
  </a-modal>
</template>

<script setup>
import { reactive, useAttrs, watch } from 'vue';
import RadiusButton from '../button/RadiusButton.vue';

const props = defineProps({
  okText: {
    type: String,
    default: undefined,
  },
  cancelText: {
    type: String,
    default: undefined,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  onCancel: {
    type: Function,
    default: undefined,
  },
});

const attrs = useAttrs();

const state = reactive({
  visible: props.visible,
  maskStyle: {
    background: 'rgba(0, 13, 22, 0.7200)',
    backdropFilter: 'blur(1px)',
  },
});

const $emit = defineEmits(['ok', 'update:visible']);

watch(
  () => props.visible,
  value => {
    state.visible = value;
    if (!value) {
      $emit('update:visible', false);
    }
  },
);

const methods = {
  confirm() {
    $emit('ok');
  },
  cancel: () => {
    if (!!props.onCancel) {
      props.onCancel();
      return;
    }
    state.visible = false;
    $emit('update:visible', false);
  },
};
</script>

<style lang="less" scoped>
.define-modal {
  :deep(.ant-modal-footer) {
    padding: 12px 24px;
  }
}
</style>
