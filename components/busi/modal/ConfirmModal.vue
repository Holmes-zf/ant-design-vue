<template>
  <!--
    确认框 = `Modal`（唯一外壳）+ 本文件的「确认语义 body」。
    外壳能力（遮罩、底部按钮区、可见性与关闭语义、`$attrs` 单通道、按钮文案兜底）一律由 `Modal` 提供，本文件不再复刻。
    · `default` 插槽是正文的**唯一落点**，不再转发给 a-modal —— 转发会用调用方内容覆盖下面这个静态 body，
      图标与 `.confirm-modal-body` 包裹会一起消失（老实现的病灶）。
    · 具名插槽未传就不透传，保留外壳自己的默认按钮区 / 文案兜底。
    · 属性分流：`title` / `width` 显式给默认值、`$attrs` 在其后 ⇒ 调用方可覆盖（与 `Modal` 同一写法）。
  -->
  <Modal
    title="操作确认"
    width="700px"
    :visible="visible"
    :loading="loading"
    :ok-text="okText"
    :cancel-text="cancelText"
    :on-cancel="methods.cancel"
    :mask-style="state.maskStyle"
    v-bind="$attrs"
    @ok="methods.confirm"
    @update:visible="emits('update:visible', false)"
  >
    <div class="confirm-modal-body">
      <SvgIcon :icon="state.icon" class="confirm-modal-icon"></SvgIcon>
      <div>
        <slot>
          <div class="confirm-modal-title" v-if="content">{{ content }}</div>
          <div class="confirm-modal-tips" v-if="tips">{{ tips }}</div>
        </slot>
      </div>
    </div>

    <!-- 具名插槽透传：**排除 default**（正文唯一落点，转发出去会覆盖上面的静态 body） -->
    <template v-for="name in forwardedSlots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}"></slot>
    </template>
  </Modal>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：显式透传 $attrs 时必须关掉自动继承，
// 否则同一份属性会被 Vue 再落到根元素（本组件根元素即 Modal）上一次
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive, useSlots } from 'vue';
import Modal from './Modal.vue';
import SvgIcon from '../icon/SvgIcon.vue';

const slots = useSlots();

// 只透传「非默认槽」的具名插槽：未传就不透传，保留外壳自身的默认按钮区与文案兜底
const forwardedSlots = computed(() => Object.keys(slots).filter(name => name !== 'default'));

const props = defineProps({
  content: {
    type: String,
    default: undefined,
  },
  tips: {
    type: String,
    default: undefined,
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
    validator: (value: string) => ['success', 'warning', 'error'].includes(value),
  },
});

const emits = defineEmits(['ok', 'update:visible']);

// 语义 → 图标：未命中（含老代码放行的空串）一律回落 `warning`，与 `type` 默认值同档
const ICON_MAP: Record<string, string> = {
  success: 'icon-core-confirmModalSuccess',
  warning: 'icon-core-confirmModalWarn',
  error: 'icon-core-confirmModalError',
};

const state = reactive({
  // 遮罩：色只认 token（dark 主题可切换）、模糊与 `Modal` 同族一致；
  // 经 `$attrs` 覆盖外壳自身的显式值（`Modal` 里显式在前、attrs 在后）
  // 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线
  maskStyle: {
    background: 'var(--modal-mask-bg, rgba(0, 13, 22, 0.7200))',
    backdropFilter: 'blur(1px)',
  },
  icon: computed(() => ICON_MAP[props.type] || ICON_MAP.warning),
});

const methods = {
  // 提交中的重复点击由外壳按钮的 `:loading` 兜住（antd Button 会吞掉 loading 态点击），不再另设守卫
  confirm() {
    emits('ok');
  },
  // 关闭语义：调用方接管 → 否则由父级回写 visible
  cancel() {
    if (props.onCancel) {
      props.onCancel();
      return;
    }
    emits('update:visible', false);
  },
};
</script>

<style lang="less" scoped>
.confirm-modal-body {
  padding: 26px 0 34px calc(10.7% - 24px);
  display: flex;
  align-items: center;
  .confirm-modal-icon {
    font-size: 50px;
    margin-right: 5.43%;
  }
  // 文案类名是组件自有的**可选**装饰：调用方在默认插槽里复刻同款文案时直接复用；
  // 插槽内容带的是调用方 scopeId ⇒ 必须 `:deep()` 才命中（类名带组件前缀，不会误伤页面自有规则）
  // 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线
  :deep(.confirm-modal-title) {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color-deep, #122d41);
    line-height: 33px;
  }
  :deep(.confirm-modal-tips) {
    font-size: 16px;
    font-weight: 400;
    color: var(--text-color-deep, #122d41);
    line-height: 22px;
    margin-top: 10px;
  }
}
</style>
