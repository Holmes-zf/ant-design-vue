---
category: Components
type: 业务
title: Charts
subtitle: 图表组件群
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

业务图表组件群：基于 echarts 按需注册封装的统计图表，目前提供饼图一种类型；后续新增图表类型统一并入本组件群。

## 何时使用

- 页面需要展示占比、构成等统计图表时（`PieChart`）。
- 需要图表随配置项变化自动重绘、且不想自行管理 echarts 实例时。

## 组件选型

| 组件 | 一句话定位 | 典型场景 |
| --- | --- | --- |
| `PieChart` | echarts 饼图（配置项驱动，实例自管） | 占比 / 构成展示，`options` 变化自动 `setOption` |

## API

### PieChart

基于 echarts 按需注册（`echarts/core` + `PieChart` + `CanvasRenderer` + `LabelLayout`）的饼图封装：组件内部自行初始化与复用 echarts 实例，`options` 深度监听、变化后自动 `setOption`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| id | 图表容器 DOM 的 id，组件内部靠它初始化 echarts 实例（**多层实例请各自传唯一 id**） | string | `mychart` |  |
| options | echarts 配置项（`setOption` 的入参），深度监听、变化后自动更新 | object | `{}` |  |

#### 注意

> 组件关闭了 `inheritAttrs`，所有未知属性（`class` / `style` …）原样透传到 echarts 容器 `div` 上；容器样式为 `width: 100%; height: 100%`，因此需要外层（或透传的 class/style）给定尺寸。`id` 未显式传入时默认 `mychart`，同页多实例必须分别指定唯一 id，否则会抢同一个容器。
