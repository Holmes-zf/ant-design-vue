<template>
  <div class="select-group" v-bind="rootAttrs">
    <div class="select-group-block">
      <span v-if="label" class="label">{{ label }}:</span>
      <FormSelect v-bind="busiAttrs" :get-popup-container="methods.getPopupContainer" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SelectGroup',
  // 不自动透传：class / style 归容器（外框尺寸与留白由使用方决定），其余属性与事件只投给内部下拉。
  // 默认继承会让同一份属性再落一次根 div（options 变 DOM 属性、事件在根上多挂一份）。
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import FormSelect from './FormSelect.vue';

defineProps({
  // 左侧前缀标签：不传则不渲染（不留孤立冒号）
  label: {
    type: String,
    default: undefined,
  },
});

const attrs = useAttrs();
// class / style 归容器，其余属性与事件只投给内部下拉
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const busiAttrs = computed(() => {
  const rest: Record<string, unknown> = {};
  Object.keys(attrs).forEach(key => {
    if (key !== 'class' && key !== 'style') rest[key] = attrs[key];
  });
  return rest;
});

const methods = {
  // 弹层挂在「带边框的合成框」外面（= 组件根 `.select-group`），
  // 锚点取 `.select-group-block`（真正有 border/background 的那层），框架的「锚点根的上一层」正好落到根。
  // 排在 `v-bind="busiAttrs"` 之后 ⇒ 业务传的同名属性不生效（本件已接管，无需外部再传）。
  getPopupContainer(triggerNode: HTMLElement) {
    const root = triggerNode?.closest?.('.select-group-block');
    const container = root?.parentElement ?? triggerNode?.parentElement;
    return container ?? document.body;
  },
};
</script>

<style lang="less" scoped>
.select-group {
  // inline 级：可与其它控件并排；需要定宽/填满由使用方的 class / style 决定，组件不写固有宽
  display: inline-block;

  .select-group-block {
    display: flex;
    align-items: center;
    // 定高 + border-box：下拉 32 + 上下边框各 1 = 34px，与同排控件等高
    height: 32px;
    box-sizing: border-box;
    border: 1px solid var(--border-color-line, #d9d9d9);
    border-radius: var(--border-radius-base, 4px);
    background-color: var(--bg-color-white, #fff);

    // 聚焦反馈归容器：内层下拉的边框与焦点环已被抹掉，焦点只能由外框表达
    &:focus-within {
      border-color: var(--primary-color, #0032a0);
    }

    .label {
      flex: 0 0 auto;
      font-size: var(--font-size-base, 14px);
      color: var(--text-color-deep, rgba(0, 0, 0, 0.85));
      margin-left: 12px;
      line-height: 20px;
      white-space: nowrap;
    }

    // `.form-select` 是 FormSelect 的根元素：子件根会带上父作用域 id ⇒ 这里无需 :deep()
    .form-select.ant-select {
      // 恒撑满容器内容区（30px）：内层 selector 的 100% 才有确定参照
      align-self: stretch;
      flex: 1 1 auto;
      min-width: 0;

      // 内框必须抹掉（外框已由容器承担）。antd 在 hover / focus 上也写了
      // `border-right-width:1px !important`，故这里必须用 !important 才能压住。
      :deep(.ant-select-selector) {
        height: 100%;
        border: none !important;
        box-shadow: none !important;

        input,
        .ant-select-selection-placeholder,
        .ant-select-selection-item {
          text-align: right;
        }
      }

      // 底色交容器统一；`:not(disabled)` ⇒ 禁用态仍取 FormSelect 自身的灰底
      &:not(.ant-select-disabled) :deep(.ant-select-selector) {
        background-color: var(--bg-color-white, #fff);
      }
    }
  }
}
</style>
