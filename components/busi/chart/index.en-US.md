---
category: Components
type: Busi
title: PieChart
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

An on-demand echarts pie chart. `PieChart` is a thin shell that loads the real implementation (`impl/PieChartImpl.vue`) via `defineAsyncComponent`, so a static import never pulls echarts into the enclosing chunk.

## When To Use

- When a page needs a pie chart (share, composition, ...) and echarts should be loaded on demand.
- When the pie chart is the only chart type needed.

## API

### PieChart

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| id | The id of the chart container DOM; the implementation initializes the echarts instance by it | string | `mychart` |  |
| options | echarts option object (the argument of `setOption`); deep watched and applied automatically on change | object | `{}` |  |

#### Note

> The shell disables `inheritAttrs`; all unknown attributes (`id` / `class` / `style` ...) are forwarded as-is to the echarts container `div`, whose style is `width: 100%; height: 100%` — give it a size from the outside (or via forwarded class/style).
