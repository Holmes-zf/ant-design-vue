---
category: Components
type: 业务
title: PieChart
subtitle: 饼图
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

按需加载的 echarts 饼图。`PieChart` 是薄壳组件，通过 `defineAsyncComponent` 动态加载真正的实现（`impl/PieChartImpl.vue`），静态引用时不会把 echarts 拽进所在 chunk。

## 何时使用

- 页面需要展示饼图（占比、构成等）且希望 echarts 按需加载时。
- 只需要饼图这一种图表类型时。

## API

### PieChart

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| id | 图表容器 DOM 的 id，实现内部靠它初始化 echarts 实例 | string | `mychart` |  |
| options | echarts 配置项（`setOption` 的入参），深度监听、变化后自动更新 | object | `{}` |  |

#### 注意

> 薄壳关闭了 `inheritAttrs`，所有未知属性（`id` / `class` / `style` …）原样透传到 echarts 容器 `div` 上；容器样式为 `width: 100%; height: 100%`，因此需要外层（或透传的 class/style）给定尺寸。
