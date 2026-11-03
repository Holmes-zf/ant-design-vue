---
category: Components
type: Busi
title: Popconfirm
cover: https://gw.alipayobjects.com/zos/alicdn/fjMCD9xRq/Popconfirm.svg
---

A business popconfirm based on Ant Design [Popconfirm](/components/popconfirm/). No exclamation icon by default, bubbles always open at bottom right, footer buttons are `RadiusButton` with "confirm left, cancel right", and all `a-popconfirm` pass-through props are supported.

## When To Use

- Lightweight inline confirmation (delete, enable/disable) that should not interrupt the current flow.
- When you need consistent confirm/cancel button styling and order without rewriting buttons at every call site.

## API

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| visible(v-model:visible) | Whether the bubble is visible; self-managed when omitted | boolean | - |  |
| showCancel | Whether to show the "cancel" button | boolean | `true` |  |
| okText | Text of the "confirm" button | string | `确认` |  |
| cancelText | Text of the "cancel" button | string | `取消` |  |
| title | Bubble description; the `#title` slot also works | string \| slot | `提示` |  |
| icon | Custom bubble icon; the `#icon` slot also works (**no icon by default**) | vNode \| slot | - |  |
| placement | Bubble placement (**fixed to `bottomRight`**) | string | `bottomRight` |  |
| overlayClassName | Root class of the bubble; merged with the component's own class (not overridden) | string \| string[] | - |  |
| disabled | Whether the bubble opens on click | boolean | `false` |  |
| okType | Confirm button type (**not effective**: the button is rendered by `RadiusButton`) | string | - |  |
| okButtonProps / cancelButtonProps | Button props (**not effective**: same reason, keeps buttons from shrinking to 24px) | object | - |  |
| Other props | Forwarded to the underlying `a-popconfirm` / `Tooltip` (e.g. `trigger`, `mouseEnterDelay`) | - | - |  |

### Popconfirm Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| confirm | Triggered after clicking confirm (bubble is closed at that moment) | function() |  |
| cancel | Triggered after clicking cancel (bubble is closed at that moment) | function() |  |
| update:visible | Visibility changed (used by `v-model:visible`) | function(visible) |  |
| visibleChange | Visibility changed | function(visible) |  |

### Popconfirm Slots

| Slot Name | Description                                                | Version |
| --------- | ---------------------------------------------------------- | ------- |
| default   | Trigger element (must accept mouse events such as `click`) |         |
| title     | Bubble description, defaults to `提示`                     |         |
| icon      | Custom bubble icon; no icon when omitted                   |         |

#### Note

> The trigger element must accept `mouseenter`, `mouseleave`, `focus` and `click` events; text links and `a-button` are fine.
