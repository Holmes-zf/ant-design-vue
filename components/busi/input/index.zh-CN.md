---
category: Components
type: 业务
title: FormInput
subtitle: 业务表单输入框
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 何时使用

- 需要用户输入表单域内容时。
- 提供组合型输入框，带搜索的输入框，还可以进行大小选择。

## API

### FormInput

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| addonAfter | 带标签的 input，设置后置标签 | string\|slot |  |  |
| addonBefore | 带标签的 input，设置前置标签 | string\|slot |  |  |
| allowClear | 可以点击清除图标删除内容 | boolean |  |  |
| bordered | 是否有边框 | boolean | true | 3.0 |
| defaultValue | 输入框默认内容 | string |  |  |
| disabled | 是否禁用状态，默认为 false | boolean | false |  |
| id | 输入框的 id | string |  |  |
| maxlength | 最大长度 | number |  | 1.5.0 |
| prefix | 带有前缀图标的 input | string\|slot |  |  |
| showCount | 是否展示字数 | boolean | false | 3.0 |
| size | 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small` | string | `default` |  |
| suffix | 带有后缀图标的 input | string\|slot |  |  |
| type | 声明 input 类型，同原生 input 标签的 type 属性，见：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#属性)(请直接使用 `<a-textarea />` 代替 `type="textarea"`)。 | string | `text` |  |
| value(v-model) | 输入框内容 | string |  |  |
| autoComplete | 自动填充 | string | off |  |

### FormInput 事件

| 事件名称   | 说明                   | 回调参数    |     |
| ---------- | ---------------------- | ----------- | --- |
| change     | 输入框内容变化时的回调 | function(e) |     |
| pressEnter | 按下回车的回调         | function(e) |     |

> 如果 `FormInput` 在 `Form.Item` 内，并且 `Form.Item` 设置了 `id` 和 `options` 属性，则 `value` `defaultValue` 和 `id` 属性会被自动设置。
