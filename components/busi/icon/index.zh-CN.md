---
category: Components
type: 业务
title: SvgIcon
subtitle: SVG 图标
cover: https://gw.alipayobjects.com/zos/alicdn/wwvDvhBgO/Icon.svg
---

基于 SVG `<use>` 元素的图标组件，通过 ID 引用 SVG sprite 中的图标。支持自定义图标大小。

## 何时使用

- 当需要通过符号 ID 引用 SVG sprite 图标时。
- 当需要在应用中保持统一的图标尺寸时。

## API

### SvgIcon

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 图标 ID（引用 SVG sprite 中的 `#icon-id`） | string | - |
| size | 图标尺寸 | string \| number | `'14px'` |
