<template>
  <a-dropdown>
    <template v-for="slotName in Object.keys($slots)" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
/**
 * Dropdown —— `a-dropdown` 的业务别名（纯插槽转发壳）
 *
 * 本件**不声明任何 prop / emit**：单根节点下 Vue 的自动继承会把调用方写的属性与事件
 * （`trigger` / `placement` / `v-model:visible` / `@visibleChange` …）直接落到 `a-dropdown` 根元素上；
 * 插槽（`default` 触发元素、`overlay` 菜单）在这里原样转发。
 * 因此不要在下面「补一层 props 转发」—— 只会制造两处默认值与两份维护成本。
 */
</script>
