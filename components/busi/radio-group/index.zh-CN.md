---
category: Components
type: 业务
title: RadioGroup
subtitle: 分段式单选条
cover: https://gw.alipayobjects.com/zos/alicdn/8cYb5seNB/Radio.svg
---

基于 Ant Design [Radio](/components/radio/) 的分段式单选条（`a-radio-group` 的外观封装）。值、事件与其余属性全部原样透传给内部 `a-radio-group`，与直接写 `<a-radio-group>` 的行为完全一致；外观由 `variant` 选皮肤。

## 何时使用

- 查询条件或页头需要「分段切换」（按天/按周/按月、状态切换）时。
- 需要统一样式的圆角药丸单选条，且不想逐项调样式时。

## 组件选型

| 组件 | 角色 | 典型场景 |
| --- | --- | --- |
| `RadioGroup` | 容器：值通道 / 事件全透传 `a-radio-group`，`variant` 选皮肤 | 查询条件、页头的分段切换 |
| `RadioGroupItem` | 子项：只声明 `value`，零自有样式 | 与 `RadioGroup` 搭配（也可用 `a-radio-button`） |

## API

### RadioGroup

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| variant | 外观皮肤：`radius` 圆角药丸 / `native` antd 原生形态（零皮肤） | `'radius'` \| `'native'` | `'radius'` |  |
| buttonStyle | 选中态样式（antd 的 `buttonStyle`）；显式传值优先，不传时 `radius` 推导为 `solid`、`native` 交给 antd（`outline`） | string | - |  |
| value(v-model:value) | 当前选中值，透传内部 `a-radio-group` | string \| number \| boolean | - |  |
| disabled | 是否禁用整组，透传内部 | boolean | `false` |  |
| size | 尺寸，透传内部 | `'large'` \| `'small'` \| `'default'` | `default` |  |
| name | 原生 `name`，透传内部 | string | - |  |
| 其余属性 | 透传给内部 `a-radio-group` | - | - |  |

#### RadioGroup 事件

| 事件名称 | 说明       | 回调参数                      | 版本 |
| -------- | ---------- | ----------------------------- | ---- |
| change   | 选中项变化 | function(e: RadioChangeEvent) |      |

#### RadioGroup 插槽

| 插槽名称 | 说明                                                         | 版本 |
| -------- | ------------------------------------------------------------ | ---- |
| default  | 子项：`RadioGroupItem` 或原生 `a-radio-button`，两者外观一致 |      |

#### 注意

> `change` 拿到的 `e.target.value` 会被字符串化（数字 `1` 会变成 `'1'`）；需要原始类型时在业务侧回映射，不要直接当数值使用。

### RadioGroupItem

分段条子项，只声明选中值、零自有样式；外观全部由 `RadioGroup` 决定。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value | 选中值，**必传**；只接 `string` / `number`（判定为严格相等，需要布尔请映射成 `'1'` / `'0'`） | string \| number | - |  |
| 其余属性 | 透传给内部 `a-radio-button`（`class`、`style`、`disabled` 等） | - | - |  |

#### RadioGroupItem 插槽

| 插槽名称 | 说明     | 版本 |
| -------- | -------- | ---- |
| default  | 子项文案 |      |

#### 注意

> 单项的 `@change`、`@click` 不可靠（组内会覆写或仅响应鼠标/空格触发）；监听变化一律挂在 `RadioGroup` 的 `@change` 上。
