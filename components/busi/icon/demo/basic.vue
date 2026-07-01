<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

通过 `icon` 属性指定 SVG sprite 中的图标 ID，`size` 调整尺寸。

## en-US

Specify the icon ID in SVG sprite via `icon` prop, adjust size via `size` prop.

</docs>
<template>
  <a-space align="center">
    <SvgIcon icon="icon-demo" :size="24" />
    <SvgIcon icon="icon-demo" :size="32" />
    <SvgIcon icon="icon-demo" :size="48" />
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SvgIcon from '../SvgIcon.vue';

export default defineComponent({
  components: { SvgIcon },
});
</script>
