---
category: Components
type: Busi
title: ActionBody
cover: https://gw.alipayobjects.com/zos/alicdn/5rWLU27so/Grid.svg
---

A table auxiliary component. It is a flex-based horizontal action container for holding table toolbar items, modal footer button groups, and other horizontally arranged actions. The `align` prop controls content alignment (`left` / `center` / `right`, default `left`); children are spaced 8px apart and never wrap.

## When To Use

- When you need to arrange action items (add, edit, delete, export buttons, etc.) horizontally in a table toolbar.
- When you need a unified alignment (left / center / right) for an action area.

## API

### ActionBody

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| align | Content alignment, one of `left` `center` `right` | string | `left` |  |

> Note: The container itself does not provide background or border, so it can be placed directly in table toolbars, card action areas, and similar scenarios.

### ActionBody Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Action item content, any child node (usually `a-button`) |  |
