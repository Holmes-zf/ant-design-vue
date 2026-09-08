---
category: Components
type: 业务
title: SvgIcon
subtitle: SVG 图标
cover: https://gw.alipayobjects.com/zos/alicdn/rrwbSt3FQ/Icon.svg
---

基于 SVG `<use>` 元素的图标组件，通过 ID 引用 SVG sprite 中的图标。支持自定义图标大小。

内置两套图标库（symbol id 前缀互不相同，可共存于同一页面）：

| 图库     | 前缀         | 数量 | 资源目录                |
| -------- | ------------ | ---- | ----------------------- |
| 框架图标 | `icon-core-` | 44   | `assets/iconfont-core/` |
| 业务图标 | `icon-YT`    | 142  | `assets/iconfont-busi/` |

## 何时使用

- 当需要通过符号 ID 引用 SVG sprite 图标时。
- 当需要在应用中保持统一的图标尺寸时。

## 图标资源

两套图标库的资源目录结构相同，各包含：

| 文件 | 说明 |
| --- | --- |
| iconfont.js | SVG symbol 定义（sprite）。脚本执行时自动注入页面，并暴露 `window._iconfont_svg_string_<项目 ID>` 全局变量 |
| iconfont.css / iconfont.ttf / iconfont.woff / iconfont.woff2 | 字体图标方式（`<i class="iconfont icon-xxx">`），SvgIcon 方案下无需引入 |
| iconfont.json | 图标元数据（名称、unicode 映射等） |

两套库的 sprite 全局变量：

| 图库     | 全局变量                              |
| -------- | ------------------------------------- |
| 框架图标 | `window._iconfont_svg_string_5228714` |
| 业务图标 | `window._iconfont_svg_string_5104230` |

### 引入方式

组件本身不内置 sprite，使用前需引入对应图库的资源（全局引入一次即可；两套库并存时各自引入，symbol id 前缀不同不会冲突）：

```ts
// 入口文件或组件中
import 'components/busi/icon/assets/iconfont-core/iconfont.js'; // 框架图标
import 'components/busi/icon/assets/iconfont-busi/iconfont.js'; // 业务图标
```

引入后即可通过 `icon` 属性引用图标：

```html
<template>
  <SvgIcon icon="icon-core-search" :size="24" />
  <SvgIcon icon="icon-YTtip" :size="24" />
</template>
```

全部图标 ID 列表可在「全部展示」demo 中查看，也可在运行时解析对应的全局变量获取。

## API

### SvgIcon

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 图标 ID（引用 SVG sprite 中的 `#icon-id`，如 `icon-core-search`、`icon-YTtip`） | string | - |
| size | 图标尺寸 | string \| number | `'14px'` |
