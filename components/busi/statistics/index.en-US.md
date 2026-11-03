---
category: Components
type: Busi
title: Statistics
cover: https://gw.alipayobjects.com/zos/antfincdn/rcBNhLBrKbE/Statistic.svg
---

A statistics bar: `StatisticsBox` lays items out in a fixed column grid and can collapse them, `StatisticsItem` renders one "label: value" pair. Items carry no size; column width and row height are decided by the container.

## When To Use

- Showing summary data at the top of a list page (pieces, weight, orders, ...).
- When there are too many items for one row and a "more / collapse" toggle is needed (`collapsible`).

## Component Selection

| Component | Role | Typical Scenario |
| --- | --- | --- |
| `StatisticsBox` | Container: fixed-column grid + collapse toggle | Statistics bar on top of list pages |
| `StatisticsItem` | One "label: value" pair (label ellipsized when long) | Paired with `StatisticsBox`, or standalone in a row |

## API

### StatisticsBox

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| collapsible | Whether collapsing is allowed. `false` (default) means no clipping and full expansion, items are never silently truncated | boolean | `false` |  |
| columns | Items per row; items wrap into multiple rows, non-positive values fall back to 1 | number | `4` |  |

#### StatisticsBox Slots

| Slot Name | Description                                        | Version |
| --------- | -------------------------------------------------- | ------- |
| default   | Statistics items, usually several `StatisticsItem` |         |

#### Note

> The toggle only appears when collapsing is allowed **and** content really overflows one row; a single row never shows a fake button. The toggle is icon-only and its text lives in `title` / `aria-label`, so its width is language independent.

### StatisticsItem

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| label | Item label (**required**); the colon is added by styles, do not include it | string | - |  |

#### StatisticsItem Slots

| Slot Name | Description                                                         | Version |
| --------- | ------------------------------------------------------------------- | ------- |
| default   | Value content; tabular numbers are already applied by the component |         |
