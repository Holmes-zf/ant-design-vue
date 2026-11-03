---
category: Components
type: 业务
title: Select
subtitle: 选择组件群
cover: https://gw.alipayobjects.com/zos/alicdn/_0XzgOis7/Select.svg
---

业务选择组件群：围绕「下拉选择」的三个组件 —— `FormSelect`（主选择器：错误态、字典、单条自动选中）、`FormSelectDefault`（在 `FormSelect` 的选项行内加「设为默认」动作，可接管默认值回填）、`SelectGroup`（「标签 + 下拉」的定式组合）。三个组件共用 `FormSelect` 的数据契约（`options` / `dictCode` / `v-model:value`）与外观规范。

## 何时使用

- 表单或查询条件里需要下拉选择时（`FormSelect`）。
- 下拉里需要「把某项设为默认」并自动回填默认值时（`FormSelectDefault`）。
- 查询条件里需要「维度标签 + 下拉」的固定组合时（`SelectGroup`）。

## 组件选型

| 组件 | 值形态 / 角色 | 典型场景 |
| --- | --- | --- |
| `FormSelect` | `v-model:value`，基座 | 通用表单 / 查询下拉 |
| `FormSelectDefault` | `v-model:value` + 默认值动作（`defaultHooks` / `setDefault` 事件） | 需要圈定默认项并自动回填的下拉 |
| `SelectGroup` | `label` + 其余属性透传内部 `FormSelect` | 「标签 + 下拉」定式组合（无默认插槽） |

## API

### FormSelect

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 指定当前选中的条目 | string \| number \| string[] \| number[] | - |  |
| options | 下拉选项数据源 | Array&lt;{value, label, disabled?}> | `[]` |  |
| joinArrayValue | options 的 value 为数组时，合并拼接为字符串用于下拉展示 | boolean | `false` |  |
| formType | 表单展示类型，`fail` 时展示错误状态样式 | `''` \| `fail` | `''` |  |
| heightClass | 追加到根节点的扩展类名。默认值 `nowrap` 为历史扩展，其「多选不换行」样式已停用，现归还 `a-select` 默认换行展示 | string | `nowrap` |  |
| fieldNames | 自定义节点 label、value 的字段 | object | `{ label: 'label', value: 'value' }` |  |
| dictCode | 字典编码（当前业务组件版本未接入字典服务，暂不生效，请通过 `options` 传入数据） | string | `''` |  |
| filterValues | 配合字典使用，仅保留指定 value 的选项（当前暂不生效） | array | `[]` |  |
| showAll | 是否显示全部，为 `false` 时过滤掉 value 为空字符串的选项（当前暂不生效） | boolean | `true` |  |
| defaultSelect | options 只有一条数据且当前无值时，是否默认选中该条 | boolean | `false` |  |
| isClearErrorValue | 值不符合 options 时，是否清除错误值（默认不清除） | boolean | `false` |  |
| getPopupContainer | 弹层挂载容器。不传时挂到下拉自身的父节点；组合件（`SelectGroup` / `SelectMultiInput`）用它把弹层挂到合成框的上一层 | function(triggerNode) | - |  |
| allowClear | 支持清除 | boolean | `true` |  |
| disabled | 是否禁用 | boolean | `false` |  |
| loading | 是否加载中 | boolean | `false` |  |
| maxTagCount | 最多显示多少个 tag（多选） | number | - |  |
| mode | 设置 Select 的模式为多选或标签（也可直接透传 `multiple` 属性） | `'multiple'` \| `'tags'` | - |  |
| placeholder | 选择框默认文字（默认为 `请选择`） | string \| slot | `请选择` |  |
| showSearch | 配置是否可搜索 | boolean | `false` |  |
| size | 选择框大小，可选 `large` `small` | string | `default` |  |
| suffixIcon | 自定义的选择框后缀图标 | VNode \| slot | - |  |

> 说明：`value` 通过 `v-model:value` 双向绑定；其余属性通过 `v-bind="$attrs"` 透传给底层 `a-select`，支持 `a-select` 的全部属性（如 `showSearch`、`filterOption`、`maxTagCount` 等）。

### FormSelect 事件

| 事件名称     | 说明               | 回调参数                           | 版本 |
| ------------ | ------------------ | ---------------------------------- | ---- |
| change       | 选中 option 时调用 | function(value, option:Option)     |      |
| update:value | 选中值变化时的回调 | (value: string \| number \| Array) |      |

### FormSelect 插槽

| 插槽名称   | 说明                   | 版本 |
| ---------- | ---------------------- | ---- |
| suffixIcon | 自定义的选择框后缀图标 |      |

> 除 `suffixIcon` 外，其余插槽（如 `option`、`notFoundContent` 等）透传给底层 `a-select`。

### FormSelectDefault

在 `FormSelect` 的每个选项行内追加「设为默认 / 已为默认 / 取消默认」动作，并可按需接管「谁是默认值」与「默认值回填」。值、字典、错误态、弹层容器与边框外观全部沿用 `FormSelect`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 当前选中值；回填默认值时会推回父级 | string \| number \| array | - |  |
| options | 选项数据源；开启默认值回填时用于把默认值翻译成 `change` 的第二个参数 | Array&lt;{value, label, isDefault?}> | `[]` |  |
| allowCancelSet | 是否允许取消默认：开启后「已默认」项显示可点的「取消默认」，否则只显示「已为默认」 | boolean | `false` |  |
| defaultHooks | 默认值数据与动作的扩展点，见下方契约；不传时走内置行为（读 `option.isDefault`、动作只抛事件） | object | - |  |
| valueReady | 外部权威值是否已就绪。详情请求期间置 `false`，回填会等它变 `true` 再判断 | boolean | `true` |  |
| 其余属性 | 继承 `FormSelect`（`dictCode`、`fieldNames`、`formType`、`showSearch`、`multiple` 等） | - | - |  |

`defaultHooks` 契约：

| 成员 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| isDefault | function(item): boolean \| undefined | 是 | 判断某选项是否为默认项；返回 `undefined` 时回退 `option.isDefault` |
| setDefault | function(item): Promise | 是 | 设为默认。组件在等待期间禁用该行动作，并在完成后自动选中该项 |
| cancelDefault | function(item): Promise | 是 | 取消默认 |
| getDefaultValue | function(): value \| undefined | 否 | 当前默认值；不提供则组件不做任何回填 |

> `defaultHooks` 内部读取的数据必须是响应式的（`reactive` / `ref` / `computed`），否则默认态与回填不会随数据变化重算。

#### FormSelectDefault 事件

| 事件名称      | 说明                                         | 回调参数                | 版本 |
| ------------- | -------------------------------------------- | ----------------------- | ---- |
| update:value  | 值变化（含默认值回填与设为默认后的自动选中） | (value)                 |      |
| change        | 值变化，第二个参数为对应选项                 | function(value, option) |      |
| setDefault    | 未传 `defaultHooks` 时，点击「设为默认」抛出 | (item)                  |      |
| cancelDefault | 未传 `defaultHooks` 时，点击「取消默认」抛出 | (item)                  |      |

#### FormSelectDefault 插槽

| 插槽名称   | 说明           | 版本 |
| ---------- | -------------- | ---- |
| suffixIcon | 自定义后缀图标 |      |

> 选项内容由组件接管（行内动作），不接受 `option` 插槽；其余插槽用法与 `FormSelect` 一致。

### SelectGroup

「标签 + 下拉」的定式组合：左侧前缀标签，右侧固定渲染一个 `FormSelect`，不提供默认插槽。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| label | 左侧前缀标签；不传则不渲染（不留孤立冒号） | string | - |  |
| 其余属性 | 全部透传给内部 `FormSelect`（`options`、`dictCode`、`v-model:value`、`multiple`、`heightClass` 等） | - | - |  |

- `class` / `style` 落在组件根（外框），其余属性与事件只投给内部下拉；外框尺寸与留白由使用方决定。
- 弹层锚点已挂到合成框外层，**无需再传 `getPopupContainer`**（传了也不生效）。
