---
category: Components
type: 业务
title: FormSelect
subtitle: 业务表单选择器
cover: https://gw.alipayobjects.com/zos/alicdn/_0XzgOis7/Select.svg
---

基于 Ant Design [Select](/components/select/) 封装的业务表单选择器。提供错误（`fail`）状态样式、多选时不换行展示、默认自动选中单条数据等能力，并继承 `a-select` 的全部属性。

## 何时使用

- 当需要一个带业务样式（错误状态、多选不换行）的表单下拉选择器时。
- 当需要数据源为字典（`dictCode`）、单条数据自动选中（`defaultSelect`）等表单场景能力时。

## API

### FormSelect

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 指定当前选中的条目 | string \| number \| string[] \| number[] | - |  |
| options | 下拉选项数据源 | Array&lt;{value, label, disabled?}> | `[]` |  |
| joinArrayValue | options 的 value 为数组时，合并拼接为字符串用于下拉展示 | boolean | `false` |  |
| formType | 表单展示类型，`fail` 时展示错误状态样式 | `''` \| `fail` | `''` |  |
| heightClass | 高度/展示扩展类名，`nowrap` 表示多选时选项不换行 | string | `nowrap` |  |
| fieldNames | 自定义节点 label、value 的字段 | object | `{ label: 'label', value: 'value' }` |  |
| dictCode | 字典编码（当前业务组件版本未接入字典服务，暂不生效，请通过 `options` 传入数据） | string | `''` |  |
| filterValues | 配合字典使用，仅保留指定 value 的选项（当前暂不生效） | array | `[]` |  |
| showAll | 是否显示全部，为 `false` 时过滤掉 value 为空字符串的选项（当前暂不生效） | boolean | `true` |  |
| defaultSelect | options 只有一条数据且当前无值时，是否默认选中该条 | boolean | `false` |  |
| isClearErrorValue | 值不符合 options 时，是否清除错误值（默认不清除） | boolean | `false` |  |
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

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| change | 选中 option 时调用 | function(value, option:Option) |  |
| update:value | 选中值变化时的回调 | (value: string \| number \| Array) |  |

### FormSelect 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| suffixIcon | 自定义的选择框后缀图标 |  |

> 除 `suffixIcon` 外，其余插槽（如 `option`、`notFoundContent` 等）透传给底层 `a-select`。
