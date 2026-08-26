---
category: Components
type: Busi
title: FormSelect
cover: https://gw.alipayobjects.com/zos/alicdn/_0XzgOis7/Select.svg
---

A business form select based on Ant Design [Select](/components/select/). Provides error (`fail`) state styling, no-wrap multi-select display, single-option auto-select, and inherits all `a-select` props.

## When To Use

- When you need a form select with business styling (error state, no-wrap multi-select).
- When you need form scenarios like dictionary data source (`dictCode`) or single-option auto-select (`defaultSelect`).

## API

### FormSelect

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Current selected value | string \| number \| string[] \| number[] | - |  |
| options | Options data source | Array&lt;{value, label, disabled?}> | `[]` |  |
| joinArrayValue | When the option value is an array, join it into a string for display | boolean | `false` |  |
| formType | Form display type, `fail` shows the error state style | `''` \| `fail` | `''` |  |
| heightClass | Height/display extension class name, `nowrap` keeps multi-select options on one line | string | `nowrap` |  |
| fieldNames | Customize the label and value fields of options | object | `{ label: 'label', value: 'value' }` |  |
| dictCode | Dictionary code (dictionary service is not integrated in this business component version, pass data via `options` instead) | string | `''` |  |
| filterValues | Used with dictionary, keeps only options with the given values (not effective currently) | array | `[]` |  |
| showAll | Whether to show all options; when `false`, filters out options with empty-string value (not effective currently) | boolean | `true` |  |
| defaultSelect | When options has only one item and no value is set, select it by default | boolean | `false` |  |
| isClearErrorValue | Whether to clear the value when it does not match any option (default: keep) | boolean | `false` |  |
| allowClear | Allow clearing | boolean | `true` |  |
| disabled | Whether the select is disabled | boolean | `false` |  |
| loading | Whether the select is loading | boolean | `false` |  |
| maxTagCount | Max tag count to show (multiple mode) | number | - |  |
| mode | Set the select mode to multiple or tags (or pass `multiple` directly) | `'multiple'` \| `'tags'` | - |  |
| placeholder | The placeholder text (defaults to `请选择`) | string \| slot | `请选择` |  |
| showSearch | Whether to enable search | boolean | `false` |  |
| size | The size of the select, options: `large` `small` | string | `default` |  |
| suffixIcon | Customize the current suffix icon | VNode \| slot | - |  |

> Note: `value` is two-way bound via `v-model:value`. Other props are passed through to the underlying `a-select` via `v-bind="$attrs"`, supporting all `a-select` props (e.g. `showSearch`, `filterOption`, `maxTagCount`).

### FormSelect Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| change | Called when an option is selected | function(value, option:Option) |  |
| update:value | Callback when the selected value changes | (value: string \| number \| Array) |  |

### FormSelect Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| suffixIcon | Customize the current suffix icon |  |

> Except for `suffixIcon`, other slots (e.g. `option`, `notFoundContent`) are passed through to the underlying `a-select`.
