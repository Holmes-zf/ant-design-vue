---
category: Components
type: 业务
title: ScrollBox
subtitle: 横向滚动容器
cover: https://gw.alipayobjects.com/zos/antfincdn/%24C9tmj978R/Carousel.svg
---

横向滚动容器：两侧箭头 + 平滑滚动，内容溢出时才出现箭头，箭头槽恒定占位（有无箭头都不会引起内容跳动）。适合承载一行放不下的标签、页签、卡片流。

## 何时使用

- 一行内容（页签、标签、卡片）在窄容器里放不下，又不想出现滚动条时。
- 需要「按半个可视宽度」翻页浏览，或把纵向滚轮转成横向滚动时。

## API

### ScrollBox

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| step | 点击箭头的滚动步长：`half` = 半个可视宽度，数字 = 像素 | `'half'` \| number | `'half'` |  |
| veil | 两端渐隐遮罩：内容到边缘逐渐淡出容器底色 | boolean | `false` |  |
| wheel | 纵向滚轮转横向滚动；仅内容溢出时接管，到边交还页面滚动 | boolean | `false` |  |

#### ScrollBox 事件

| 事件名称 | 说明           | 回调参数                     | 版本 |
| -------- | -------------- | ---------------------------- | ---- |
| scroll   | 横向滚动时触发 | function(scrollLeft: number) |      |

#### ScrollBox 插槽

| 插槽名称 | 说明                                     | 版本 |
| -------- | ---------------------------------------- | ---- |
| default  | 滚动内容（宽度由内容决定，不被容器钳制） |      |
| prev     | 替换左箭头                               |      |
| next     | 替换右箭头                               |      |

#### ScrollBox 实例方法

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| prev | 向左滚动一个步长 | () => void |
| next | 向右滚动一个步长 | () => void |
| scrollTo | 滚动到指定位置（超出范围自动收边，`smooth` 默认 `true`） | (left: number, smooth?: boolean) => void |
| scrollIntoView | 把目标元素滚进可视区；已完整可见则不动 | (target: Element \| ComponentPublicInstance, smooth?: boolean) => void |
| refresh | 重新测量可滚距离（容器/内容尺寸变化后手动调用） | () => void |

#### 注意

> 容器宽度与内容宽度由 `ResizeObserver` 自动跟踪，但**虚拟滚动、异步插入节点后若尺寸未变**仍建议调 `refresh()`。内容为空或未溢出时箭头只隐藏、不移除，布局不抖动。
