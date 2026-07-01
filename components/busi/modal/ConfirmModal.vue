<template>
  <a-modal
    title="操作提示"
    width="700px"
    class="confirm-modal"
    v-model:visible="state.visible"
    :maskClosable="false"
    :maskStyle="state.maskStyle"
    v-bind="$attrs"
    @cancel="methods.cancel"
  >
    <template #footer>
      <slot name="footer">
        <a-space :size="16">
          <slot name="confirm">
            <RadiusButton
              type="primary"
              :loading="loading"
              @click="methods.confirm"
            >
              <slot name="okText">
                {{ okText || '确定' }}
              </slot>
            </RadiusButton>
          </slot>
          <RadiusButton type="primary" ghost @click="methods.cancel">
            <slot name="cancelText">
              {{ cancelText || '取消' }}
            </slot>
          </RadiusButton>
        </a-space>
      </slot>
    </template>

    <div class="configm-modal-body">
      <SvgIcon :icon="state.icon" class="define-icon"></SvgIcon>
      <div>
        <slot>
          <div class="title">{{ content }}</div>
          <div class="tips" v-if="tips">{{ tips }}</div>
        </slot>
      </div>
    </div>

    <template v-for="slotName in Object.keys($slots)" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import RadiusButton from '../button/RadiusButton.vue';
import SvgIcon from '../icon/SvgIcon.vue';

const props = defineProps({
  content: {
    type: String,
    default: 'content',
  },
  tips: {
    type: String,
    default: '',
  },
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
  type: {
    type: String,
    default: 'warning',
    validator: value => {
      return ['', 'success', 'warning', 'error'].includes(value);
    },
  },
});

const state = reactive({
  visible: false,
  maskStyle: {
    background: 'rgba(0, 13, 22, 0.7200)',
    backdropFilter: 'blur(1px)',
  },
  icon: computed(() => {
    let icon = 'icon-YTconfirmModalSuccess';
    if (props.type == 'warning') {
      icon = 'icon-YTconfirmModalWarn';
    }
    if (props.type == 'error') {
      icon = 'icon-YTconfirmModalError';
    }
    return icon;
  }),
  loadingFlag: computed(() => {
    return props.loading || !state.visible;
  }),
});

const $emit = defineEmits(['ok', 'update:visible']);

watch(
  () => props.visible,
  value => {
    if (value) {
      state.visible = value;
    } else {
      state.visible = value;
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
.confirm-modal {
  .ant-modal-footer {
    padding: 16px 24px;
  }
}
.ant-modal-mask,
.ant-modal-wrap {
  // z-index: 1004 !important;
  .configm-modal-body {
    padding: 26px 0 34px calc(10.7% - 24px);
    display: flex;
    align-items: center;
    .define-icon {
      font-size: 50px;
      margin-right: 5.43%;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1b252e;
      line-height: 33px;
    }
    .tips {
      font-size: 16px;
      font-weight: 400;
      color: #1b252e;
      line-height: 22px;
      margin-top: 10px;
    }
  }
}
</style>
