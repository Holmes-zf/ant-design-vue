---
category: Components
type: Busi
title: Switch
cover: https://gw.alipayobjects.com/zos/antfincdn/wc6%263gJ0Y8/Space.svg
---

Business switch components: `EyeSwitch` is a "value + eye" cell for sensitive fields (view / hide entry for masked values), `InputSwitch` is an inline "on / off" switch embedded in a text box.

## When To Use

- Displaying masked fields (phone numbers, emails, ...) in tables with an eye toggle to reveal the raw value (`EyeSwitch`).
- When you need an inline "text box + switch" enable/disable control (`InputSwitch`).

## Component Selection

| Component | Summary | Typical Scenario |
| --- | --- | --- |
| `EyeSwitch` | "Value + eye" cell for sensitive fields | View / hide masked values; toggle state hosted on a row-private key |
| `InputSwitch` | Inline "on / off" switch in a text box | One-row enable/disable control, fully controlled with zero internal state |

## API

### EyeSwitch

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| row | Data row (**required**, must be reactive); the toggle state is hosted by the component at `row[field + stateSuffix]` | object | - |  |
| field | Display / request field name (**required**) | string | - |  |
| stateSuffix | Suffix of the toggle state field; key = `field + stateSuffix` | string | `__eye` |  |

#### EyeSwitch Events

| Event Name | Description                           | Callback Parameter |
| ---------- | ------------------------------------- | ------------------ |
| toggle     | Target state after the eye is clicked | `next: boolean`    |

#### EyeSwitch Slots

| Slot Name | Description                                            | Version |
| --------- | ------------------------------------------------------ | ------- |
| icon      | Extra content after the eye button (e.g. action icons) |         |

#### Note

> The state key `row[field + "__eye"]` is component-private state (same nature as vxe's `_X_ROW_KEY`); the component never mutates business fields. Whether to flip back to closed after a failed request is up to the business side by reading/writing that key. Unknown attributes (class / style, ...) fall through to the root `div`.

### InputSwitch

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| checked(v-model:checked) | Controlled switch value | boolean | `false` |  |
| disabled | Disabled: clicks are ignored and the box turns gray | boolean | `false` |  |
| openText | Text for the on state (pass already translated text); falls back to the built-in text when omitted | string | - |  |
| closeText | Text for the off state, same as above; falls back to the built-in text when omitted | string | - |  |

#### InputSwitch Events

| Event Name | Description | Callback Parameter |
| --- | --- | --- |
| update:checked | Switch toggled (user actions only; mutating the prop programmatically does not re-emit) | `next: boolean` |

#### Note

> `checked` is the single source of truth and the component has zero internal state; unknown attributes (class / style, ...) land on the root `div` and never reach the input.
