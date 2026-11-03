<template>
  <a-radio-group
    :class="['radio-group', `radio-group--${variant}`]"
    :button-style="resolvedButtonStyle"
  >
    <slot></slot>
  </a-radio-group>
</template>

<script setup lang="ts">
/**
 * 分段式单选条 —— 只负责外观，行为与 antd 完全一致。
 *
 * 契约：
 * 1. 值通道 / 事件 / 其余属性全部原样透传给内部 `a-radio-group`：`v-model:value`、
 *    `@change`、`disabled`、`name`、`size` 等与直接写 `<a-radio-group>` 等效。
 * 2. 外观由 `variant` 选皮肤，子项既可以继续用 `<a-radio-button>`，也可以换成
 *    `<RadioGroupItem>`，外观一致（样式锚在 `.ant-radio-button-wrapper` 上）。
 *    - `radius`（默认）：圆角药丸（外框 + 选中实底圆角块），`button-style` 默认 `solid`；
 *    - `native`：零皮肤，完全等同 antd 原生 `a-radio-group`，`button-style` 走 antd 默认 `outline`。
 * 3. antd 的 `change` 只给原生事件对象，且数字 value 会被字符串化 ⇒ 需要原始类型值时
 *    必须在业务侧回映射，不能把 `e.target.value` 直接当数值用。
 */
import { computed } from 'vue';

const props = defineProps({
  /** 外观皮肤：radius（默认，圆角药丸）/ native（antd 原生形态，零皮肤） */
  variant: {
    type: String,
    default: 'radius',
    validator: (value: string) => ['radius', 'native'].includes(value),
  },
  /** 选中态样式（antd 的 buttonStyle）：显式传值优先；不传时按 variant 推导 */
  buttonStyle: {
    type: String,
  },
});

const resolvedButtonStyle = computed(
  () => props.buttonStyle ?? (props.variant === 'native' ? undefined : 'solid'),
);
</script>

<style lang="less" scoped>
/* 只有 radius 皮肤写样式；native 皮肤下本组件对 DOM 零样式影响（类名保留仅作锚点）。
   换/加皮肤 = 加一个 variant 枚举值 + 一段 .radio-group--xxx 样式，不动模板与契约。 */

.ant-radio-group.radio-group--radius {
  /* inline-flex 而非 flex：保留「随内容收缩」，否则在页头条里会撑满整行 */
  display: inline-flex;
  align-items: center;
  /* 横 3px = 原条目首尾 margin 收编至此；纵 2px ⇒ 条目 32 + 4 + 边框 2 = 38px */
  padding: 2px 3px;
  /* 底色用字面量：#fff 是 antd 条目底色的编译值，条目不跟主题；
     容器若改走 var(--bg-color-white)，dark 下会变成「深色外框 + 白色条目」的撕裂。 */
  background: #fff;
  border: 1px solid var(--border-color-line, #d9d9d9);
  border-radius: var(--border-radius-base, 4px);
  /* 高度由内容决定：不写 height，避免与 antd 条目 32px / size 档位打架 */

  :deep(.ant-radio-button-wrapper) {
    min-width: 119px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    /* 只抹边框颜色、不抹宽度：保留 antd 的边框占位，其高度 / line-height / size 档位才成立 */
    border-color: transparent;
    /* 每项四角全圆 = 选中态独立药丸 */
    border-radius: var(--border-radius-base, 4px);
  }
}
</style>
