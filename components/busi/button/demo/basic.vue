<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

基础的圆角按钮用法，支持 `type`、`width`、`grey` 等属性。

## en-US

Basic rounded button usage, supports `type`, `width`, `grey` and other props.

</docs>
<template>
  <a-space :wrap="true" align="center">
    <RadiusButton type="primary">Primary</RadiusButton>
    <RadiusButton>Default</RadiusButton>
    <RadiusButton type="primary" ghost>Ghost</RadiusButton>
    <RadiusButton type="primary" :width="160">Fixed Width</RadiusButton>
    <RadiusButton grey>Grey</RadiusButton>
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RadiusButton from '../RadiusButton.vue';

export default defineComponent({
  components: { RadiusButton },
});
</script>
