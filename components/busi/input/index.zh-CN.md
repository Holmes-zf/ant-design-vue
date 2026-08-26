---
category: Components
type: 业务
title: FormInput
subtitle: 业务表单输入框
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

基于 Ant Design [Input](/components/input/) 封装的业务表单输入框。提供失焦自动去除首尾空格、自动完成控制、错误状态样式，并继承 a-input 的全部属性。

## 何时使用

- 当需要一个失焦时自动去除首尾空格的表单输入框时。
- 当需要控制浏览器自动完成行为时。
- 当需要错误（`fail`）视觉状态时。

## API

### FormInput

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 输入框内容 | string | `''` |  |
| trim | 失焦时是否去除首尾空格 | boolean | `true` |  |
| placeholder | 占位文本（默认为 `请输入`） | string | `''` |  |
| formType | 表单展示类型 | `''` \| `fail` | `''` |  |
| isAutoComplete | 是否启用自动完成（`false` 时为只读） | boolean | `true` |  |
| addonAfter | 带标签的 input，设置后置标签 | string\|slot |  |  |
| addonBefore | 带标签的 input，设置前置标签 | string\|slot |  |  |
| allowClear | 可以点击清除图标删除内容 | boolean |  |  |
| bordered | 是否有边框 | boolean | true |  |
| defaultValue | 输入框默认内容 | string |  |  |
| disabled | 是否禁用状态，默认为 false | boolean | false |  |
| id | 输入框的 id | string |  |  |
| maxlength | 最大长度 | number |  |  |
| prefix | 带有前缀图标的 input | string\|slot |  |  |
| showCount | 是否展示字数 | boolean | false |  |
| size | 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small` | string | `default` |  |
| suffix | 带有后缀图标的 input | string\|slot |  |  |
| type | 声明 input 类型，同原生 input 标签的 type 属性，见：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#属性)(请直接使用 `<a-textarea />` 代替 `type="textarea"`)。 | string | `text` |  |

### FormInput 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| change | 输入框内容变化时的回调 | function(e) |  |
| blur | 输入框失焦时的回调 | function(e) |  |
| update:value | 内容变化时的回调 | (value: string) |  |

### FormInput 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| prefix | 输入框前缀图标 |  |
| suffix | 输入框后缀图标 |  |

> 注意：`value` 通过 `v-model:value` 双向绑定，其他属性通过 `v-bind="$attrs"` 透传给底层 `a-input`。
