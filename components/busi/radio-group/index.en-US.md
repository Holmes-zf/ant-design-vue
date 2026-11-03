---
category: Components
type: Busi
title: RadioGroup
cover: https://gw.alipayobjects.com/zos/alicdn/8cYb5seNB/Radio.svg
---

A segmented radio bar based on Ant Design [Radio](/components/radio/) (a skin for `a-radio-group`). Value, events and all other props are forwarded to the inner `a-radio-group`, so behaviour is identical to writing `<a-radio-group>` directly; the skin is selected by `variant`.

## When To Use

- Segmented switching in query bars or page headers (by day/week/month, status switching).
- When you need a consistent pill-shaped radio bar without styling every item.

## Component Selection

| Component | Role | Typical Scenario |
| --- | --- | --- |
| `RadioGroup` | Container: value/events fully forwarded to `a-radio-group`, skin via `variant` | Segmented switching in query bars or page headers |
| `RadioGroupItem` | Item: declares only `value`, no styles of its own | Paired with `RadioGroup` (or use `a-radio-button`) |

## API

### RadioGroup

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| variant | Skin: `radius` pill style / `native` plain antd form (no skin) | `'radius'` \| `'native'` | `'radius'` |  |
| buttonStyle | Selected style (antd `buttonStyle`); explicit value wins, otherwise `radius` derives `solid` and `native` leaves it to antd (`outline`) | string | - |  |
| value(v-model:value) | Current value, forwarded to the inner `a-radio-group` | string \| number \| boolean | - |  |
| disabled | Disable the whole group, forwarded | boolean | `false` |  |
| size | Size, forwarded | `'large'` \| `'small'` \| `'default'` | `default` |  |
| name | Native `name`, forwarded | string | - |  |
| Other props | Forwarded to the inner `a-radio-group` | - | - |  |

#### RadioGroup Events

| Events Name | Description            | Arguments                     | Version |
| ----------- | ---------------------- | ----------------------------- | ------- |
| change      | Selected value changed | function(e: RadioChangeEvent) |         |

#### RadioGroup Slots

| Slot Name | Description                                                            | Version |
| --------- | ---------------------------------------------------------------------- | ------- |
| default   | Items: `RadioGroupItem` or native `a-radio-button`, both look the same |         |

#### Note

> `e.target.value` from `change` is stringified (number `1` becomes `'1'`); map it back on the business side instead of using it as a number.

### RadioGroupItem

A segmented item: declares only its value and carries no styles of its own; appearance comes from `RadioGroup`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value | Selected value, **required**; only `string` / `number` (comparison is strict, map booleans to `'1'` / `'0'`) | string \| number | - |  |
| Other props | Forwarded to the inner `a-radio-button` (`class`, `style`, `disabled`, ...) | - | - |  |

#### RadioGroupItem Slots

| Slot Name | Description | Version |
| --------- | ----------- | ------- |
| default   | Item label  |         |

#### Note

> Per-item `@change` / `@click` are not reliable (the group overrides them or they only react to mouse/space); always listen on `RadioGroup`'s `@change`.
