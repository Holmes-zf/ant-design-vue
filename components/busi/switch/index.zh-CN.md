---
category: Components
type: 业务
title: Switch
subtitle: 业务开关
cover: https://gw.alipayobjects.com/zos/antfincdn/wc6%263gJ0Y8/Space.svg
---

业务开关类组件：`EyeSwitch` 是敏感字段「值 + 眼睛」单元格（掩码字段的查看 / 隐藏入口），`InputSwitch` 是文本框内嵌「开 / 关」的一行式开关。

## 何时使用

- 表格中展示掩码字段（手机号、邮箱等），需要点击眼睛临时显示原文时（`EyeSwitch`）。
- 需要一个「文本框 + 开关」的一行式启停控件时（`InputSwitch`）。

## 组件选型

| 组件          | 一句话定位                  | 典型场景                                        |
| ------------- | --------------------------- | ----------------------------------------------- |
| `EyeSwitch`   | 敏感字段「值 + 眼睛」单元格 | 掩码字段的查看 / 隐藏，开关状态托管在行私有键上 |
| `InputSwitch` | 文本框内嵌「开 / 关」开关   | 一行式启停控件，受控零内部状态                  |

## API

### EyeSwitch

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| row | 数据行（**必传**，须为响应式对象）；开关状态由组件托管在 `row[field + stateSuffix]` 上 | object | - |  |
| field | 展示与请求字段名（**必传**） | string | - |  |
| stateSuffix | 开关状态字段后缀，键名 = `field + stateSuffix` | string | `__eye` |  |

#### EyeSwitch 事件

| 事件名称 | 说明               | 回调参数        |
| -------- | ------------------ | --------------- |
| toggle   | 点击眼睛后的目标态 | `next: boolean` |

#### EyeSwitch 插槽

| 插槽名称 | 说明                                 | 版本 |
| -------- | ------------------------------------ | ---- |
| icon     | 眼睛按钮之后的附加内容（如操作图标） |      |

#### 注意

> 状态键 `row[field + "__eye"]` 属组件私有状态（与 vxe 的 `_X_ROW_KEY` 同性质），组件不改任何业务字段；接口失败后是否弹回闭眼由业务侧读写该键决定。未知属性（class / style 等）透传到根 `div`。

### InputSwitch

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| checked(v-model:checked) | 受控开关值 | boolean | `false` |  |
| disabled | 禁用：点击无响应、框体置灰 | boolean | `false` |  |
| openText | 开启态文案（调用方传已翻译好的文本），不传回落内置「启用」 | string | - |  |
| closeText | 关闭态文案，同上，不传回落内置「禁用」 | string | - |  |

#### InputSwitch 事件

| 事件名称       | 说明                                                | 回调参数        |
| -------------- | --------------------------------------------------- | --------------- |
| update:checked | 开关切换（只由用户操作触发，程序改 props 不会回抛） | `next: boolean` |

#### 注意

> `checked` 是唯一值源，组件零内部状态；未知属性（class / style 等）落根 `div`，不会进输入框。
