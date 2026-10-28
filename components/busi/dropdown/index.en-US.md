---
category: Components
type: 业务
title: Dropdown
cover: https://gw.alipayobjects.com/zos/alicdn/eedWN59yJ/Dropdown.svg
---

A business dropdown menu built on Ant Design [Dropdown](/components/dropdown/). The component only **forwards slots**: it declares no props or events of its own, so `trigger` / `placement` / `v-model:visible` / `@visibleChange` and everything else are inherited by the root node and passed through to `a-dropdown`; the `default` (trigger element) and `overlay` (menu content) slots are forwarded as-is.

## When To Use

- A group of actions should be collapsed under a trigger element.
- The menu is organized with `a-menu` and needs hover / click / context-menu triggering.
- For the "primary button + arrow" `Dropdown.Button` form, use `a-dropdown-button` directly (this component does not proxy the button form).

## API

Props and events are inherited from `a-dropdown` (no extra props are added). Common ones:

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| trigger | Behavior that triggers the dropdown (`hover` is not supported on mobile) | Array&lt;`click` \| `hover` \| `contextmenu`&gt; | `['hover']` |  |
| placement | Placement of the popup menu | `bottomLeft` \| `bottom` \| `bottomRight` \| `topLeft` \| `top` \| `topRight` | `bottomLeft` |  |
| visible(v-model:visible) | Whether the menu is visible | boolean | - |  |
| overlay(v-slot) | Menu content, usually an `a-menu` | [Menu](/components/menu/) | - |  |
| overlayClassName | Class name of the dropdown root | string | - |  |
| overlayStyle | Style of the dropdown root | object | - |  |
| disabled | Whether the menu is disabled | boolean | - |  |
| destroyPopupOnHide | Whether to destroy the dropdown after it closes | boolean | `false` |  |
| getPopupContainer | Mount node of the menu (defaults to `document.body`); switch to the scrolling area when positioning breaks | Function(triggerNode) | `() => document.body` |  |

### Events

| Event | Description | Arguments | Version |
| --- | --- | --- | --- |
| visibleChange | Fired when the menu visibility changes (not fired when a menu item closes it) | function(visible) |  |

### Slots

| Slot    | Description                           | Version |
| ------- | ------------------------------------- | ------- |
| default | Trigger element (an `a-button`, etc.) |         |
| overlay | Menu content (`a-menu`)               |         |

> Menu items live inside `a-menu` and every `a-menu-item` needs a unique `key`; menus inside a Dropdown are not selectable by default — add `selectable` to `a-menu` when selection is needed.
