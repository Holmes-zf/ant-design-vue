<docs>
---
order: 0
title:
  zh-CN: 业务图标基本用法
  en-US: Business Icons Basic Usage
---

## zh-CN

业务图标库（`icon-YT*` 前缀，142 个）与框架图标库并存于同一页面，通过 `icon` 属性引用 `icon-YTxxx` 图标 ID。使用前需引入业务图标资源（见"图标资源"章节）。

## en-US

The business icon library (`icon-YT*` prefix, 142 icons) coexists with the framework icon library on the same page. Reference `icon-YTxxx` IDs via the `icon` prop. Import the business icon assets first (see "Icon Assets" section).

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
// 引入业务图标资源：脚本执行时定义 window._iconfont_svg_string_5104230 并自动将 SVG sprite 注入页面
import '../assets/iconfont-busi/iconfont.js';
import SvgIcon from '../SvgIcon.vue';

export default defineComponent({
  components: { SvgIcon },
});
</script>
