<template>
  <a-radio-button :value="value">
    <slot></slot>
  </a-radio-button>
</template>

<script setup lang="ts">
/**
 * 分段条子项：只声明选中值，零自有样式 —— 外观（尺寸 / 圆角 / 选中态）
 * 全部由 `RadioGroup` 负责，避免两处样式源互相打架。
 *
 * 三条反直觉行为（antd 实现决定，用前必读）：
 * 1. `@change` 挂在本件上静默无效 —— 组内会覆写它；监听变化一律挂 `RadioGroup` 的 `@change`。
 * 2. `@click` 只在鼠标点击 / 空格触发，方向键切换不触发。
 * 3. `class` / `style` / `aria-*` 自动透传到 `<label>`；`disabled` 与组的 disabled 取或。
 */
defineProps({
  /**
   * 选中值，必传且只接 string / number。
   * - 漏传不会"未被选中"：组值初始为 undefined 时该条目会呈现选中，点击还会把组值写成 `"on"`。
   * - 类型刻意窄于 antd：判定是 `===`，需要布尔请映射成 `'1' / '0'`。
   */
  value: {
    type: [String, Number],
  },
});
</script>
