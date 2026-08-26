---
category: Components
type: Busi
title: FormBox
cover: https://gw.alipayobjects.com/zos/alicdn/ORmcdeaoO/Form.svg
---

A form layout component family: `FormRow` (pure CSS equal-width layout), `FormARow` (grid-based layout with column span support), `FormACol` (span-configurable form item container), and `FormBox` (white container). It implements multi-column equal-width layouts with Flex or the 24-column grid, and empty nodes are filtered automatically.

## When To Use

- When you need a quick multi-column equal-width layout in a form.
- When the number of children is dynamic and needs to wrap with equal widths.
- When children need to span multiple columns, use `FormARow` + `FormACol`.
- When you need a unified white card container for form content, use `FormBox`.

## API

### FormRow

A form row component based on Flex layout. `colNum` controls the number of columns per row and children are evenly divided. It supports any child node (usually `a-form-item`).

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| colNum | Number of columns per row | string \| number | `4` |  |

#### FormRow Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Children inside the row, usually `a-form-item`, can be any content |  |

### FormARow

A form row layout based on antd `a-row` / `a-col`. Differences from `FormRow`: column span uses the 24-column grid (`span`), equal-width columns use `flex` (any column count), and spacing uses `gutter`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| colNum | Number of columns per row | string \| number | `4` |  |
| gutter | Column spacing (passed to a-row gutter) | string \| number | `16` |  |

#### Column Span Declaration

Two equivalent ways to declare a column span:

- `FormACol` props: `<FormACol colspan="2">` / `<FormACol span="12">`
- `data-*` attributes on normal children: `<a-form-item data-colspan="2">` / `<a-form-item data-span="12">`

> Note: `colspan` is a relative logical column count (occupies N of `colNum` columns), internally converted to the 24-column grid and clamped to 24; `span` is passed through directly on the 24-column grid.

#### FormARow Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Children inside the row, usually `a-form-item` or `FormACol` |  |

### FormACol

A span-configurable form item container, rendered as `a-form-item` internally. It works with `FormARow`. Other attributes such as `label` / `name` / `rules` / `required` / `labelCol` are passed through to the inner `a-form-item` automatically.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| colspan | Number of logical columns in `colNum` (e.g. colspan=2 with colNum=3 means 2/3 width) | string \| number | `0` |  |
| span | Passed through on the 24-column grid (e.g. span=12 means half row) | string \| number | `0` |  |

#### FormACol Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Form control content (e.g. `a-input`, `FormInput`) |  |

#### FormACol Inherited Props

Inherits all props and slots of [a-form-item](/components/form/) (`label` / `name` / `rules` / `required` / `labelCol` / `wrapperCol` / `colon` / `extra` / `help` / `tooltip`, etc.).

### FormBox

A white background container component for wrapping form content. No props.

#### FormBox Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| default | Container content |  |

> Note: The key priority of children in the components above is VNode `key` > field `name` (arrays are joined with `.`) > index fallback. Empty text and comment nodes are filtered out automatically.
