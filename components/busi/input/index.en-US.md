---
category: Components
type: Busi
title: FormInput
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

A business form input based on Ant Design [Input](/components/input/). Provides trim-on-blur, auto-complete control, error state styling, and inherits all a-input props.

## When To Use

- When you need a form input with automatic trim on blur.
- When you need to control browser auto-complete behavior.
- When you need an error (`fail`) visual state.

## API

### FormInput

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | The input content value | string | `''` |  |
| trim | Whether to trim whitespace on blur | boolean | `true` |  |
| placeholder | The placeholder text (defaults to `请输入`) | string | `''` |  |
| formType | Form display type | `''` \| `fail` | `''` |  |
| isAutoComplete | Whether to enable auto-complete (readonly when `false`) | boolean | `true` |  |
| addonAfter | The label text displayed after (on the right side of) the input field. | string\|slot |  |  |
| addonBefore | The label text displayed before (on the left side of) the input field. | string\|slot |  |  |
| allowClear | allow to remove input content with clear icon | boolean |  |  |
| bordered | Whether has border style | boolean | true |  |
| defaultValue | The initial input content | string |  |  |
| disabled | Whether the input is disabled. | boolean | false |  |
| id | The ID for input | string |  |  |
| maxlength | max length | number |  |  |
| prefix | The prefix icon for the Input. | string\|slot |  |  |
| showCount | Whether show text count | boolean | false |  |
| size | The size of the input box. Note: in the context of a form, the `large` size is used. Available: `large` `default` `small` | string | `default` |  |
| suffix | The suffix icon for the Input. | string\|slot |  |  |
| type | The type of input, see: [MDN](https://developer.mozilla.org/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types)(use `<a-textarea />` instead of `type="textarea"`) | string | `text` |  |

### FormInput Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| change | callback when user input | function(e) |  |
| blur | callback when input loses focus | function(e) |  |
| update:value | callback when value changes | (value: string) |  |

### FormInput Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| prefix | The prefix icon for the Input |  |
| suffix | The suffix icon for the Input |  |

> Note: `value` is two-way bound via `v-model:value`. Other props are passed through to the underlying `a-input` via `v-bind="$attrs"`.
