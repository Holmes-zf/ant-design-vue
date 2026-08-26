<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

通过 `icon` 属性指定 SVG sprite 中的图标 ID，`size` 调整尺寸。使用前需引入图标资源（见"图标资源"章节）。

## en-US

Specify the icon ID in SVG sprite via `icon` prop, adjust size via `size` prop. Import the icon assets first (see "Icon Assets" section).

</docs>
<template>
  <a-space align="center" :wrap="true">
    <SvgIcon icon="icon-YTtip" :size="24" />
    <SvgIcon icon="icon-YTsearch" :size="32" />
    <SvgIcon icon="icon-YTdownload" :size="48" />
    <SvgIcon icon="icon-YTuser" :size="14" />
    <SvgIcon icon="icon-YTstarFilled" :size="20" />
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// 引入图标资源：自动注入 SVG sprite，供下方 SvgIcon 按 ID 引用
import '../assets/iconfont/iconfont.js';
import SvgIcon from '../SvgIcon.vue';

export default defineComponent({
  components: { SvgIcon },
});
</script>
