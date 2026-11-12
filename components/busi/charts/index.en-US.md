---
category: Components
type: Busi
title: Charts
subtitle: Chart Components
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

Business chart components: statistical charts built on echarts with on-demand registration. The pie chart is the only type for now; future chart types will join this same group.

## When To Use

- When a page needs composition / share charts (`PieChart`).
- When the chart should re-render automatically from options without managing an echarts instance yourself.

## Component Selection

| Component | Summary | Typical Scenario |
| --- | --- | --- |
| `PieChart` | echarts pie chart (option-driven, manages its own instance) | Share / composition display; `setOption` runs automatically on `options` change |

## API

### PieChart

A pie chart wrapper with on-demand echarts registration (`echarts/core` + `PieChart` + `CanvasRenderer` + `LabelLayout`): the component initializes and reuses the echarts instance internally; `options` is deep-watched and applied via `setOption` on change.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| id | The id of the chart container DOM; used internally to initialize the echarts instance (pass a unique id per instance) | string | `mychart` |  |
| options | echarts option object (the argument of `setOption`); deep watched and applied automatically on change | object | `{}` |  |

#### Note

> `inheritAttrs` is disabled, so all unknown attributes (`class` / `style` ...) are forwarded as-is to the echarts container `div`, whose style is `width: 100%; height: 100%` — give it a size from the outside (or via forwarded class/style). Without an explicit `id` it defaults to `mychart`, so multiple instances on one page must each pass a unique id.
