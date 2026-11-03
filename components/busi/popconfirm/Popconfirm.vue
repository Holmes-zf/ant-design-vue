<template>
  <a-popconfirm
    v-model:visible="state.visible"
    placement="bottomRight"
    v-bind="$attrs"
    :overlay-class-name="overlayClassName"
    @update:visible="methods.setVisible"
  >
    <!--
      默认不显示 antd 的感叹号图标：空插槽让它落到 `icon || 默认图标` 的空分支
      （传 icon=null 不行，antd 会回落到默认图标）。同时转发外部 #icon，避免外部图标被吞掉。
    -->
    <template #icon>
      <slot name="icon" />
    </template>
    <template #title>
      <slot name="title">提示</slot>
    </template>

    <slot></slot>

    <!--
      槽位语义与 antd 一致（ok 槽放确定、cancel 槽放取消），
      视觉上的「确定在左、取消在右」由样式 flex-direction: row-reverse 完成。
    -->
    <template #okButton>
      <RadiusButton type="primary" min-width="96" @click="methods.confirm">
        {{ okText || '确认' }}
      </RadiusButton>
    </template>
    <template #cancelButton>
      <RadiusButton v-if="showCancel" min-width="96" @click="methods.cancel">
        {{ cancelText || '取消' }}
      </RadiusButton>
    </template>
  </a-popconfirm>
</template>

<script lang="ts">
export default {
  name: 'Popconfirm',
  // attrs 只在模板里经 v-bind="$attrs" 下行一次；关掉自动继承，否则业务传的
  // overlayClassName 会盖掉本组件合并好的类名
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive, useAttrs, watch } from 'vue';
import RadiusButton from '../button/RadiusButton.vue';

const props = defineProps({
  /** 显隐受控：不传 = 组件自管；传了 = 由外部完全接管（v-model:visible） */
  visible: { type: Boolean, default: undefined },
  /** 是否显示「取消」按钮 */
  showCancel: { type: Boolean, default: true },
  /** 确定按钮文案，缺省为「确认」 */
  okText: { type: String, default: '' },
  /** 取消按钮文案，缺省为「取消」 */
  cancelText: { type: String, default: '' },
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'update:visible', visible: boolean): void;
  (e: 'visibleChange', visible: boolean): void;
}>();

const attrs = useAttrs();

/** 覆盖类名合并而非覆盖：缺了本组件类名，整块位序/间距规则会失效 */
const overlayClassName = computed(() => {
  const biz = (attrs as Record<string, unknown>).overlayClassName;
  return ['popconfirm', ...(Array.isArray(biz) ? biz : [biz])].filter(Boolean).join(' ');
});

/**
 * 显隐只有这一个值源：打开/关闭都走 antd 自己的 `update:visible` 通路，
 * 不依赖 `visibleChange` 是否被转发。
 */
const state = reactive({
  visible: false,
});

// 外部受控（v-model:visible）时把外部值镜像进内部；antd 只认这里绑定的 state.visible
watch(
  () => props.visible,
  visible => {
    if (visible !== undefined && visible !== state.visible) {
      state.visible = visible;
    }
  },
  { immediate: true },
);

const methods = {
  /** 确定 / 取消 / ESC / 点击外部 四条路径统一从这里对外发事件 */
  setVisible(visible: boolean) {
    state.visible = visible;
    emit('update:visible', visible);
    emit('visibleChange', visible);
  },
  confirm() {
    methods.setVisible(false);
    emit('confirm');
  },
  cancel() {
    methods.setVisible(false);
    emit('cancel');
  },
};
</script>

<style lang="less">
// 非 scoped（有意为之）：气泡 teleport 到 body，scoped 属性打不到 antd 自己的
// .ant-popover-buttons / .ant-popover-message-title；作用域靠组件自带的实例类名
// .popconfirm（overlayClassName）收敛。
.popconfirm {
  // 按钮位序反转：DOM 是 [取消][确定]，视觉要 [确定][取消]
  .ant-popover-buttons {
    display: flex;
    flex-direction: row-reverse;
    // row-reverse 把主轴掉头 ⇒ flex-start 才是「靠右」
    justify-content: flex-start;
    gap: 12px;

    // antd 的 `margin-left: 8px` 在反转后会把间距算到外侧，清零交给 gap
    .ant-btn.radius-button {
      margin-left: 0;
    }
  }

  // 默认图标已去掉（#icon 空槽），标题不需要 antd 预留的 22px 图标缩进
  .ant-popover-message-title {
    padding: 0;
  }
}
</style>
