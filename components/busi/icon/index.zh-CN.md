---
category: Components
type: 业务
title: SvgIcon
subtitle: SVG 图标
cover: https://gw.alipayobjects.com/zos/alicdn/rrwbSt3FQ/Icon.svg
---

基于 SVG `<use>` 元素的图标组件，通过 ID 引用 SVG sprite 中的图标。支持自定义图标大小。

内置 **142** 个业务图标（源自 kats-tenement 业务系统的 iconfont 资源），资源文件位于 `assets/iconfont/` 目录。

## 何时使用

- 当需要通过符号 ID 引用 SVG sprite 图标时。
- 当需要在应用中保持统一的图标尺寸时。

## 图标资源

图标资源位于 `components/busi/icon/assets/iconfont/`，包含：

| 文件 | 说明 |
| --- | --- |
| iconfont.js | SVG symbol 定义（sprite），共 142 个图标。脚本执行时自动注入页面，并暴露 `window._iconfont_svg_string_5104230` 全局变量 |
| iconfont.css / iconfont.ttf / iconfont.woff / iconfont.woff2 | 字体图标方式（`<i class="iconfont icon-xxx">`） |
| iconfont.json | 图标元数据（名称、unicode 映射等） |

### 引入方式

组件本身不内置 sprite，使用前需引入图标资源（全局引入一次即可）：

```ts
// 入口文件或组件中
import 'components/busi/icon/assets/iconfont/iconfont.js';
```

引入后即可通过 `icon` 属性引用图标：

```vue
<template>
  <SvgIcon icon="icon-YTtip" :size="24" />
</template>
```

全部图标 ID 列表可在「全部图标」demo 中查看，也可在运行时解析 `window._iconfont_svg_string_5104230` 获取。

## API

### SvgIcon

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 图标 ID（引用 SVG sprite 中的 `#icon-id`，如 `icon-YTtip`） | string | - |
| size | 图标尺寸 | string \| number | `'14px'` |
