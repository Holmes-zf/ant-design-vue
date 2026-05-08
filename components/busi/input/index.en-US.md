---
category: Components
type: Busi
title: FormInput
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

A basic widget for getting the user input is a text field. Keyboard and mouse can be used for providing or changing data.

## When To Use

- A user input in a form field is needed.
- A search input is required.

## API

### FormInput

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| addonAfter | The label text displayed after (on the right side of) the input field. | string\|slot |  |  |
| addonBefore | The label text displayed before (on the left side of) the input field. | string\|slot |  |  |
| allowClear | allow to remove input content with clear icon | boolean |  |  |
| bordered | Whether has border style | boolean | true | 4.5.0 |
| defaultValue | The initial input content | string |  |  |
| disabled | Whether the input is disabled. | boolean | false |  |
| id | The ID for input | string |  |  |
| maxlength | max length | number |  | 1.5.0 |
| prefix | The prefix icon for the Input. | string\|slot |  |  |
| showCount | Whether show text count | boolean | false | 3.0 |
| size | The size of the input box. Note: in the context of a form, the `large` size is used. Available: `large` `default` `small` | string | `default` |  |
| suffix | The suffix icon for the Input. | string\|slot |  |  |
| type | The type of input, see: [MDN](https://developer.mozilla.org/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types)(use `<a-textarea />` instead of `type="textarea"`) | string | `text` |  |
| value(v-model) | The input content value | string |  |  |
| autoComplete | The input auto fill | string | off |  |

### FormInput Events

| Events Name | Description | Arguments |  |
| --- | --- | --- | --- |
| change | callback when user input | function(e) |  |
| pressEnter | The callback function that is triggered when Enter key is pressed. | function(e) |  |

> When `FormInput` is used in a `Form.Item` context, if the `Form.Item` has the `id` and `options` props defined then `value`, `defaultValue`, and `id` props of `FormInput` are automatically set.
