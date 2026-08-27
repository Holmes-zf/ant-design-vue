---
category: Components
type: 业务
title: ActionBody
subtitle: 表格操作区容器
cover: https://gw.alipayobjects.com/zos/alicdn/5rWLU27so/Grid.svg
---

表格附属组件，基于 Flex 的横向操作区容器，用于承载表格工具栏、弹窗底部按钮组等横向排列的操作项。通过 `align` 控制内容对齐方式（`left` / `center` / `right`），默认左对齐；子项间距固定 8px，且不换行。

## 何时使用

- 当需要在表格工具条中横向排列操作项（新增、编辑、删除、导出等按钮）时。
- 当需要统一操作区对齐方式（左 / 中 / 右）时。

## API

### ActionBody

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| align | 内容对齐方式，可选 `left` `center` `right` | string | `left` |  |

> 说明：容器本身不处理背景与边框，可直接置于表格工具条、卡片操作区等场景中使用。

### ActionBody 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 操作项内容，任意子节点（通常为 `a-button`） |  |
