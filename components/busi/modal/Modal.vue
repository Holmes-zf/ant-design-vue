<template>
  <a-modal
    class="define-modal"
    v-model:visible="state.visible"
    :maskClosable="false"
    :maskStyle="state.maskStyle"
    v-bind="state.$attrs"
    @cancel="methods.cancel"
  >
    <template #footer>
      <slot name="footer" v-if="props.footer">
        <a-space :size="16">
          <RadiusButton
            type="primary"
            :loading="loading"
            @click="methods.confirm"
          >
            <slot name="okText">
              {{ okText || '确定' }}
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
    <template v-for="slotName in Object.keys($slots)" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, getCurrentInstance, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import RadiusButton from '../button/RadiusButton.vue';

const { proxy } = getCurrentInstance();
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
  footer: {
    type: Boolean,
    default: true,
  },
});

const state = reactive({
  visible: false,
  maskStyle: {
    background: 'rgba(0, 13, 22, 0.7200)',
    backdropFilter: 'blur(1px)',
  },
  $attrs: computed(() => {
    const obj = {
      ...proxy.$attrs,
      footer: undefined,
    };
    if (!props.footer) {
      obj.footer = null;
    }
    return obj;
  }),
  loadingFlag: computed(() => {
    return props.loading || !state.visible;
  }),
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
  { immediate: true },
);

const methods = {
  confirm() {
    if (state.loadingFlag) return;
    $emit('ok');
  },
  cancel: () => {
    if (props.loading) {
      message.warning('正在保存，请稍等...');
      return;
    }
    if (!!props.onCancel) {
      props.onCancel();
      return;
    }
    state.visible = false;
    $emit('update:visible', false);
  },
};
</script>

<style lang="less">
.define-modal {
  .ant-modal-content {
    .form-row {
      padding: 0;
    }
  }
  .ant-modal-footer {
    padding: 16px 24px;
  }
}
</style>
