---
category: Components
type: 业务
title: RadiusButton
subtitle: 圆角按钮
cover: https://gw.alipayobjects.com/zos/alicdn/fNUKzY1sk/Button.svg
---

基于 Ant Design [Button](/components/button/) 封装的圆角按钮组件。支持自定义最小宽度和灰色禁用样式。

## 何时使用

- 当需要在应用中统一使用 4px 圆角按钮时。
- 当需要灰色禁用或次要状态的按钮样式时。
- 当需要强制按钮最小宽度时。

## API

### RadiusButton

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| width | 按钮的最小宽度 | string \| number | - |  |
| grey | 是否启用灰色禁用样式 | boolean | `false` |  |
| block | 将按钮宽度调整为其父宽度的选项 | boolean | `false` |  |
| danger | 设置危险按钮 | boolean | `false` |  |
| disabled | 禁用状态 | boolean | `false` |  |
| ghost | 幽灵属性，使按钮背景透明 | boolean | `false` |  |
| href | 点击跳转的地址，指定此属性 button 的行为和 a 链接一致 | string | - |  |
| htmlType | 设置 `button` 原生的 `type` 值，可选值请参考 [HTML 标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string | `button` |  |
| icon | 设置按钮的图标组件 | v-slot | - |  |
| loading | 设置按钮载入状态 | boolean \| { delay: number } | `false` |  |
| shape | 设置按钮形状 | `default` \| `circle` \| `round` | `default` |  |
| size | 设置按钮大小 | `large` \| `middle` \| `small` | `middle` |  |
| target | 相当于 a 链接的 target 属性，href 存在时生效 | string | - |  |
| type | 设置按钮类型 | `primary` \| `ghost` \| `dashed` \| `link` \| `text` \| `default` | `default` |  |

### 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| click | 点击按钮时的回调 | (event) => void |  |

支持原生 button 的其他所有属性。

### 方法

| 名称 | 说明 | 版本 |
| --- | --- | --- |
| blur() | 移除焦点 |  |
| focus() | 获取焦点 |  |
