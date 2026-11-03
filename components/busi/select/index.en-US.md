---
category: Components
type: Busi
title: Select
cover: https://gw.alipayobjects.com/zos/alicdn/_0XzgOis7/Select.svg
---

A business select family built around "dropdown selection" with three components — `FormSelect` (the base select: error state, dictionary, single-option auto-select), `FormSelectDefault` (adds a "set as default" action inside option rows of `FormSelect`, with optional default-value back-filling) and `SelectGroup` (a fixed "label + select" composition). All three share `FormSelect`'s data contract (`options` / `dictCode` / `v-model:value`) and visual spec.

## When To Use

- A dropdown is needed in forms or query bars (`FormSelect`).
- Users should be able to mark an option as default, with the default auto-filled (`FormSelectDefault`).
- A fixed "dimension label + select" combination is needed in query bars (`SelectGroup`).

## Component Selection

| Component | Value / Role | Typical Scenario |
| --- | --- | --- |
| `FormSelect` | `v-model:value`, the base | General form / query dropdown |
| `FormSelectDefault` | `v-model:value` + default actions (`defaultHooks` / `setDefault` event) | Dropdowns that mark a default option and back-fill it |
| `SelectGroup` | `label` + other props forwarded to the inner `FormSelect` | Fixed "label + select" composition (no default slot) |

## API

### FormSelect

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Current selected value | string \| number \| string[] \| number[] | - |  |
| options | Options data source | Array&lt;{value, label, disabled?}> | `[]` |  |
| joinArrayValue | When the option value is an array, join it into a string for display | boolean | `false` |  |
| formType | Form display type, `fail` shows the error state style | `''` \| `fail` | `''` |  |
| heightClass | Extra class name appended to the root node. The default `nowrap` is a legacy extension whose no-wrap multi-select styling has been retired; multi-select now follows the `a-select` default wrapping | string | `nowrap` |  |
| fieldNames | Customize the label and value fields of options | object | `{ label: 'label', value: 'value' }` |  |
| dictCode | Dictionary code (dictionary service is not integrated in this business component version, pass data via `options` instead) | string | `''` |  |
| filterValues | Used with dictionary, keeps only options with the given values (not effective currently) | array | `[]` |  |
| showAll | Whether to show all options; when `false`, filters out options with empty-string value (not effective currently) | boolean | `true` |  |
| defaultSelect | When options has only one item and no value is set, select it by default | boolean | `false` |  |
| isClearErrorValue | Whether to clear the value when it does not match any option (default: keep) | boolean | `false` |  |
| getPopupContainer | Container to mount the dropdown into. When not set, the dropdown mounts into the select's own parent node; composite components (`SelectGroup` / `SelectMultiInput`) use it to mount the dropdown one layer above the composed box | function(triggerNode) | - |  |
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

| Slot Name  | Description                       | Version |
| ---------- | --------------------------------- | ------- |
| suffixIcon | Customize the current suffix icon |         |

> Except for `suffixIcon`, other slots (e.g. `option`, `notFoundContent`) are passed through to the underlying `a-select`.

### FormSelectDefault

Adds a "set as default / already default / cancel default" action to every option row of `FormSelect`, and optionally takes over "which value is the default" and default value back-filling. Value, dictionary, error state, popup container and border styling all come from `FormSelect`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Current value; a back-filled default value is pushed back to the parent | string \| number \| array | - |  |
| options | Options data source; used to translate the default value into the second argument of `change` | Array&lt;{value, label, isDefault?}> | `[]` |  |
| allowCancelSet | Whether cancelling the default is allowed; when `true` the default row shows a clickable "cancel default", otherwise a static "already default" | boolean | `false` |  |
| defaultHooks | Extension point for default value and actions (see contract below); when omitted, built-in behaviour is used (`option.isDefault` + events only) | object | - |  |
| valueReady | Whether the authoritative value is ready. Keep `false` while fetching the detail, back-filling waits for `true` | boolean | `true` |  |
| Other props | Inherited from `FormSelect` (`dictCode`, `fieldNames`, `formType`, `showSearch`, `multiple`, ...) | - | - |  |

`defaultHooks` contract:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| isDefault | function(item): boolean \| undefined | Yes | Whether the option is the default one; `undefined` falls back to `option.isDefault` |
| setDefault | function(item): Promise | Yes | Set as default. The row action is disabled while pending, and the option is selected afterwards |
| cancelDefault | function(item): Promise | Yes | Cancel the default flag |
| getDefaultValue | function(): value \| undefined | No | Current default value; without it no back-filling happens |

> Data read inside `defaultHooks` must be reactive (`reactive` / `ref` / `computed`), otherwise default state and back-filling never re-evaluate.

#### FormSelectDefault Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:value | Value changed (including back-fill and auto-select after "set as default") | (value) |  |
| change | Value changed, the second argument is the matched option | function(value, option) |  |
| setDefault | Emitted on "set as default" click when `defaultHooks` is not provided | (item) |  |
| cancelDefault | Emitted on "cancel default" click when `defaultHooks` is not provided | (item) |  |

#### FormSelectDefault Slots

| Slot Name  | Description               | Version |
| ---------- | ------------------------- | ------- |
| suffixIcon | Customize the suffix icon |         |

> Option content is owned by the component (inline action), the `option` slot is not accepted; other slots behave like `FormSelect`.

### SelectGroup

A fixed "label + select" composition: a leading label plus one `FormSelect`. It has no default slot.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| label | Leading label; not rendered when omitted (no dangling colon) | string | - |  |
| Other props | All forwarded to the inner `FormSelect` (`options`, `dictCode`, `v-model:value`, `multiple`, `heightClass`, ...) | - | - |  |

- `class` / `style` land on the root (the outer box), all other props and events go to the inner select only; outer size and spacing are decided by the caller.
- The popup anchor is already moved outside the composed box, so `getPopupContainer` is not needed (and is ignored).
