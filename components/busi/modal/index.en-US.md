---
category: Components
type: Busi
title: Modal
cover: https://gw.alipayobjects.com/zos/alicdn/3StSdUlSH/Modal.svg
---

A custom modal dialog based on Ant Design [Modal](/components/modal/). Provides standardized footer buttons with `RadiusButton`, loading state management, dark mask styling, and Chinese defaults.

## When To Use

- When you need a modal with consistent business styling (dark mask, rounded buttons).
- When you need loading state control to prevent duplicate submissions.
- When you want standardized confirm/cancel button layout.

## API

### Modal

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| visible(v-model) | Whether the modal dialog is visible or not | boolean | `false` |  |
| loading | Loading state for action buttons | boolean | `false` |  |
| afterClose | Specify a function that will be called when modal is closed completely | function | - |  |
| bodyStyle | Body style for modal body element. Such as height, padding etc. | object | `{}` |  |
| cancelButtonProps | The cancel button props | [ButtonProps](/components/button/#API) | - |  |
| cancelText | Text of the cancel button | string \| slot | `取消` |  |
| centered | Centered Modal | boolean | `false` |  |
| closable | Whether a close (x) button is visible on top right of the modal dialog or not | boolean | `true` |  |
| closeIcon | custom close icon | VNode \| slot | - |  |
| confirmLoading | Whether to apply loading visual effect for OK button or not | boolean | `false` |  |
| destroyOnClose | Whether to unmount child components on onClose | boolean | `false` |  |
| dialogClass | className of floating layer | string | - |  |
| dialogStyle | Style of floating layer, typically used at least for adjusting the position | object | - |  |
| forceRender | Force render Modal | boolean | `false` |  |
| getContainer | Return the mount node for Modal | (instance): HTMLElement | `() => document.body` |  |
| mask | Whether show mask or not | boolean | `true` |  |
| maskClosable | Whether to close the modal dialog when the mask is clicked (**fixed to `false`**) | boolean | `false` |  |
| maskStyle | Style for modal's mask element (uses a business dark theme by default) | object | `{ background: 'rgba(0, 13, 22, 0.7200)', backdropFilter: 'blur(1px)' }` |  |
| okButtonProps | The ok button props | [ButtonProps](/components/button/#API) | - |  |
| okText | Text of the confirm button | string \| slot | `确认` |  |
| okType | Button `type` of the OK button | string | `primary` |  |
| onCancel | Custom cancel callback | Function | - |  |
| title | The modal dialog's title | string \| slot | - |  |
| width | Width of the modal dialog | string \| number | `520` |  |
| wrapClassName | The class name of the container of the modal dialog | string | - |  |
| zIndex | The `z-index` of the Modal | number | `1000` |  |

### events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| cancel | Triggered when a user clicks mask, close button or Cancel button | function(e) |  |
| ok | Triggered when the confirm button is clicked | - |  |
| update:visible | Triggered when visibility changes | (visible: boolean) |  |

### Modal Slots

| Slot Name  | Description                                               | Version |
| ---------- | --------------------------------------------------------- | ------- |
| default    | Modal body content                                        |         |
| footer     | Custom footer (overrides the default RadiusButton footer) |         |
| okText     | Custom confirm button text                                |         |
| cancelText | Custom cancel button text                                 |         |

> **Note**: The default `footer` is rendered internally with `RadiusButton` components. Use the `footer` slot for custom content.

### ConfirmModal

A confirmation dialog variant with status icon. The shell reuses this library's `Modal` (mask, footer buttons, visibility and close semantics, attribute forwarding are all provided by `Modal`); this component only owns the confirmation body with the status icon. It therefore also inherits from [a-modal](/components/modal/#API) with the following customizations:

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| visible(v-model) | Whether the modal dialog is visible or not | boolean | `false` |  |
| loading | Loading state for action buttons | boolean | `false` |  |
| content | Main content text (the row is not rendered when empty) | string | - |  |
| tips | Additional tip text below content | string | - |  |
| afterClose | Specify a function that will be called when modal is closed completely | function | - |  |
| bodyStyle | Body style for modal body element | object | `{}` |  |
| cancelButtonProps | The cancel button props | [ButtonProps](/components/button/#API) | - |  |
| cancelText | Text of the cancel button | string \| slot | `取消` |  |
| centered | Centered Modal | boolean | `false` |  |
| closable | Whether a close (x) button is visible on top right of the modal dialog or not | boolean | `true` |  |
| closeIcon | custom close icon | VNode \| slot | - |  |
| confirmLoading | Whether to apply loading visual effect for OK button or not | boolean | `false` |  |
| destroyOnClose | Whether to unmount child components on onClose | boolean | `false` |  |
| dialogClass | className of floating layer | string | - |  |
| dialogStyle | Style of floating layer, typically used at least for adjusting the position | object | - |  |
| forceRender | Force render Modal | boolean | `false` |  |
| getContainer | Return the mount node for Modal | (instance): HTMLElement | `() => document.body` |  |
| mask | Whether show mask or not | boolean | `true` |  |
| maskClosable | Whether to close the modal dialog when the mask is clicked (**fixed to `false`**) | boolean | `false` |  |
| maskStyle | Style for modal's mask element (uses a business dark theme by default) | object | `{ background: 'rgba(0, 13, 22, 0.7200)', backdropFilter: 'blur(1px)' }` |  |
| okButtonProps | The ok button props | [ButtonProps](/components/button/#API) | - |  |
| okText | Text of the confirm button | string \| slot | `确认` |  |
| okType | Button `type` of the OK button | string | `primary` |  |
| onCancel | Custom cancel callback | Function | - |  |
| type | Status type for the icon (falls back to `warning` when unmatched) | `success` \| `warning` \| `error` | `warning` |  |
| title | The modal dialog's title (**fixed to `操作确认`**) | string \| slot | `操作确认` |  |
| width | Width of the modal dialog (**fixed to `700px`**) | string \| number | `700` |  |
| wrapClassName | The class name of the container of the modal dialog | string | - |  |
| zIndex | The `z-index` of the Modal | number | `1000` |  |

### ConfirmModal Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| cancel | Triggered when a user clicks mask, close button or Cancel button | function(e) |  |
| ok | Triggered when the confirm button is clicked | - |  |
| update:visible | Triggered when visibility changes | (visible: boolean) |  |

### ConfirmModal Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Custom body content (replaces the `content` + `tips` text rows, the status icon is kept) |  |
| footer | Custom footer (overrides the `Modal` default button area) |  |
| okText | Custom confirm button text |  |
| cancelText | Custom cancel button text |  |

> Named slots are forwarded downward only when provided; otherwise the `Modal` shell's own default button area and text fallbacks are used. `default` is the single landing point of the body and is never forwarded as the shell's default slot.

#### Note

> The state of Modal will be preserved at its component lifecycle by default, if you wish to open it with a brand new state every time, set `destroyOnClose` on it.
