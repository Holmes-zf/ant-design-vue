<docs>
---
order: 2
title:
  zh-CN: 框架图标基本用法
  en-US: Framework Icons Basic Usage
---

## zh-CN

框架图标库（`icon-core-*` 前缀，44 个）与业务图标库并存于同一页面，通过 `icon` 属性引用 `icon-core-xxx` 图标 ID。使用前需引入框架图标资源（见"图标资源"章节）。

## en-US

The framework icon library (`icon-core-*` prefix, 44 icons) coexists with the business icon library on the same page. Reference `icon-core-xxx` IDs via the `icon` prop. Import the framework icon assets first (see "Icon Assets" section).

</docs>
<template>
  <a-space align="center" :wrap="true">
    <SvgIcon icon="icon-core-search" :size="24" />
    <SvgIcon icon="icon-core-download" :size="32" />
    <SvgIcon icon="icon-core-upload" :size="48" />
    <SvgIcon icon="icon-core-user" :size="14" />
    <SvgIcon icon="icon-core-print" :size="20" />
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// 引入框架图标资源：脚本执行时定义 window._iconfont_svg_string_5228714 并自动将 SVG sprite 注入页面
import '../assets/iconfont-core/iconfont.js';
import SvgIcon from '../SvgIcon.vue';

export default defineComponent({
  components: { SvgIcon },
});
</script>
