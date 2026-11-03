---
category: Components
type: 业务
title: Statistics
subtitle: 统计信息条
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

统计信息条：`StatisticsBox` 提供按固定列数的网格排布与可折叠能力，`StatisticsItem` 是「名称：数值」的单条统计项。条目不带尺寸，列宽与行高全部由容器决定。

## 何时使用

- 列表页顶部展示汇总数据（件数、重量、票数等）时。
- 统计项较多、一行放不下，需要「更多 / 收起」折叠时（`collapsible`）。

## 组件选型

| 组件 | 角色 | 典型场景 |
| --- | --- | --- |
| `StatisticsBox` | 容器：固定列数网格 + 可折叠开关 | 列表页顶部统计条 |
| `StatisticsItem` | 单条「名称：数值」（label 超长省略） | 与 `StatisticsBox` 搭配，也可单独一行使用 |

## API

### StatisticsBox

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| collapsible | 是否允许折叠。`false`（默认）不裁剪、全量展开，内容不会被静默截断 | boolean | `false` |  |
| columns | 一行几列；条目按此自动换行成多行，非正数回落 1 | number | `4` |  |

#### StatisticsBox 插槽

| 插槽名称 | 说明                                | 版本 |
| -------- | ----------------------------------- | ---- |
| default  | 统计项，通常放若干 `StatisticsItem` |      |

#### 注意

> 折叠开关只在「允许折叠」且「内容确实超出一行」时出现；恰好一行时不会留一个假按钮。开关只有图标，文案走 `title` / `aria-label`，因此宽度与语言无关。

### StatisticsItem

| 参数  | 说明                                                 | 类型   | 默认值 | 版本 |
| ----- | ---------------------------------------------------- | ------ | ------ | ---- |
| label | 统计项名称（**必传**）；「：」由样式补，不要写进文案 | string | -      |      |

#### StatisticsItem 插槽

| 插槽名称 | 说明                                                    | 版本 |
| -------- | ------------------------------------------------------- | ---- |
| default  | 数值内容；数值建议用等宽数字（组件已设 `tabular-nums`） |      |
