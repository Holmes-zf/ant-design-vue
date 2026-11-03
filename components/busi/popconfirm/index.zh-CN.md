---
category: Components
type: 业务
title: Popconfirm
subtitle: 业务气泡确认框
cover: https://gw.alipayobjects.com/zos/alicdn/fjMCD9xRq/Popconfirm.svg
---

基于 Ant Design [Popconfirm](/components/popconfirm/) 封装的业务气泡确认框。默认不带感叹号图标、气泡固定右下弹出、底部按钮为「确认在左、取消在右」的 `RadiusButton`，并继承 `a-popconfirm` 的透传属性。

## 何时使用

- 行内轻量二次确认（删除、启用/禁用等），不打断当前操作时。
- 需要统一的确认/取消按钮样式与位序，不想每个调用点各写一套按钮时。

## API

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| visible(v-model:visible) | 是否显示；不传时组件自管显隐 | boolean | - |  |
| showCancel | 是否显示「取消」按钮 | boolean | `true` |  |
| okText | 「确认」按钮文案 | string | `确认` |  |
| cancelText | 「取消」按钮文案 | string | `取消` |  |
| title | 确认框描述；也可用 `#title` 插槽 | string \| slot | `提示` |  |
| icon | 自定义气泡图标；也可用 `#icon` 插槽（**默认不显示图标**） | vNode \| slot | - |  |
| placement | 气泡弹出位置（**固定为 `bottomRight`**） | string | `bottomRight` |  |
| overlayClassName | 气泡根类名，组件会与自身类名合并（不会覆盖） | string \| string[] | - |  |
| disabled | 点击触发元素时是否弹出 | boolean | `false` |  |
| okType | 确认按钮类型（**不生效**：按钮改由 `RadiusButton` 渲染） | string | - |  |
| okButtonProps / cancelButtonProps | 按钮属性（**不生效**：同上，避免按钮被压成 24px） | object | - |  |
| 其余属性 | 透传给底层 `a-popconfirm` / `Tooltip`（如 `trigger`、`mouseEnterDelay`） | - | - |  |

### Popconfirm 事件

| 事件名称       | 说明                                   | 回调参数          | 版本 |
| -------------- | -------------------------------------- | ----------------- | ---- |
| confirm        | 点击「确认」后触发（点击时已自动关闭） | function()        |      |
| cancel         | 点击「取消」后触发（点击时已自动关闭） | function()        |      |
| update:visible | 显隐变化（受控写法 `v-model:visible`） | function(visible) |      |
| visibleChange  | 显隐变化                               | function(visible) |      |

### Popconfirm 插槽

| 插槽名称 | 说明                                    | 版本 |
| -------- | --------------------------------------- | ---- |
| default  | 触发元素（需能接受 `click` 等鼠标事件） |      |
| title    | 确认框描述，缺省显示「提示」            |      |
| icon     | 自定义气泡图标；不传则不显示图标        |      |

#### 注意

> 触发元素需能接受 `mouseenter`、`mouseleave`、`focus`、`click` 事件；文字链、`a-button` 等原生可交互元素均可。
