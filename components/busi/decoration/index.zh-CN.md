---
category: Components
type: 业务
title: Decoration
subtitle: 装饰组件
cover: https://gw.alipayobjects.com/zos/alicdn/MNbKfLBVb/Empty.svg
---

装饰组件：辅助业务开发、只负责「外观修饰与布局隔离」的小组件集合。它们不带业务状态与数据逻辑，也不提供卡片式的底色、圆角与边框 —— 只把底层 antd 组件的默认表现收敛成项目统一形态。当前收录 `Empty`（业务空状态）。

## 何时使用

- 列表、表格、详情区块没有数据时的占位（`Empty`）。
- 需要全站统一的空态插画与文案，只在个别位置换图或换文案时。

## API

### Empty

基于 Ant Design [Empty](/components/empty/) 封装：默认使用**简版插画**与「暂无数据」文案；外壳用 BFC（`display: flow-root`）把 antd 空态自带的上下外边距收在组件内部，避免边距折叠出去扰动父级布局。底色、圆角与边框不归本组件负责 —— 卡片感由所在容器提供。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| description | 空状态文案（**为空时回落「暂无数据」**） | string | `''` |  |
| image | 插画：字符串按图片地址使用，也可传 `Empty.PRESENTED_IMAGE_SIMPLE` / `Empty.PRESENTED_IMAGE_DEFAULT`（**默认简版插画**） | string \| object | `Empty.PRESENTED_IMAGE_SIMPLE` |  |

> `class` / `style` 落在组件外壳 `.empty_wrapper` 上；`imageStyle` 等 `a-empty` 的其余属性不透传，需要时请直接使用 `a-empty`。
