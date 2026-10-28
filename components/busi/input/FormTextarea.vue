<template>
  <a-textarea
    class="form-textarea"
    :placeholder="placeholder || '请输入'"
    allow-clear
    autoComplete="off"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
/**
 * FormTextarea —— a-textarea 的透传壳（无内部状态）
 *
 * 改动前必读四条契约：
 * 1. `v-model:value` 靠 `v-bind="$attrs"` 直达 a-textarea（value / onUpdate:value）。
 *    **不要**声明 `value` prop —— 一旦声明，透传链被截断，双向绑定立刻失效。
 * 2. `form-textarea` 既是下方 scoped 样式的唯一锚点，也是外部覆盖契约（`SelectTextarea` 按这个类名覆盖样式）
 *    —— 不要改名或删除。
 * 3. 样式只锚 textarea 本体 `:deep(textarea.ant-input)`：antd 在 `show-count` 时会把父级
 *    class 搬到外层 div（textarea 本体失类），`allowClear` 时还会同时挂到 wrapper span
 *    （该 wrapper 被 antd 写死 `border: 0 !important`）—— 锚类名会让同一组件出现两套外观。
 * 4. `allow-clear` 是「默认值 + 可被覆盖」的透传属性（不声明为 prop），所以它必须排在
 *    `v-bind="$attrs"` 之前；**顺序一反，父级传 false 就失效、清空按钮恒开**。
 */
defineProps({
  placeholder: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
// 定制外观只有两条：圆角走主题尺寸、聚焦走项目主色并去掉 antd 的 2px 光晕（与 FormInput 一致）。
// border-color 的常态与 hover 一律交还 antd（不用 !important 硬压，否则 :hover 反馈会被压死）。
.form-textarea {
  // 容器态：类落在 antd 外层（show-count 的 div / allowClear 的 wrapper span）⇒ 锚内部 textarea
  :deep(textarea.ant-input) {
    border-radius: var(--border-radius-base, 4px);
  }

  :deep(textarea.ant-input:focus) {
    border-color: var(--primary-color, #0032a0);
    box-shadow: none;
  }
}

// 本体态：allowClear=false 且无 show-count 时，antd 直接把 textarea 作为根渲染 ⇒ 类落在 textarea 自身
textarea.form-textarea {
  border-radius: var(--border-radius-base, 4px);

  &:focus {
    border-color: var(--primary-color, #0032a0);
    box-shadow: none;
  }
}
</style>
