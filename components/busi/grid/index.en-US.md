---
category: Components
type: Busi
title: Grid
---

Companion business components for tables: pager statistics bar, action-column smart folding, query/reset button pair, column config modal and dynamic query condition bar. They pair with `vxe-grid` (or any object exposing `commitProxy`). No i18n service is used — texts are Simplified Chinese; external storage / API capabilities are injected via props and persisted by the host.

## When To Use

- Showing summary data next to the pager: use `PagerStatistics`.
- Needing a horizontal container for toolbars / button groups (fixed 8px gap, alignable): use `ActionBody`.
- Folding overflow action buttons into a "more" panel: use `GridAction`.
- Adding a query/reset button pair wired to `grid.commitProxy('_init')`: use `GridQryBtn`.
- Letting users customize column visibility and order: use `ColumnsConfig`.
- Building an add/remove dynamic query condition bar with collapse and field memory: use `DcGridQryForm`.

## Component Selection

| Component | Summary | Typical Scenario |
| --- | --- | --- |
| `PagerStatistics` | Pager statistics bar (display only) | Summary data from backend next to the pager |
| `ActionBody` | Horizontal action container (flex + 8px gap) | Table toolbar, modal footer button groups |
| `GridAction` | Smart action-column folding | Inline buttons beyond `max` fold into a "more" panel, popups reconciled |
| `GridQryBtn` | Query / reset button pair | Table toolbar, query wired to `grid.commitProxy('_init')` |
| `ColumnsConfig` | Column config modal | User-defined column visibility and order (checkbox + drag sort) |
| `DcGridQryForm` | Dynamic query condition bar | Add/remove condition chips, collapse, field memory (menuCode cache) |

## API

### PagerStatistics

Statistics items come from the data layer; this component only renders. **`name` is rendered as-is** — the original implementation translated it via `$t`; in this repo the host passes already-translated text.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| statistics | Item list, each `{ name?, value?, unit? }`; items without `name` degrade to "value unit" | `{ name?: string; value?: string \| number; unit?: string }[]` | `[]` |  |

### GridAction

Shows at most `max` buttons inline, folding the rest into a hover "more" panel. Popup visibility of `Popconfirm` / `Popover` / dropdowns inside the folded area is reconciled automatically (the panel stays open while a popup is open). Constraints: always use `v-if` for visibility (`v-show` still consumes quota); do not control popup visibility externally inside the folded area.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| max | Inline button limit; empty string / null / non-numeric values all fall back to 3 (string `max="2"` accepted) | number \| string | `3` |  |
| moreText | Optional text for the "more" trigger (originally a `$t` result; pass plain Chinese here). Icon-only when empty | string | `''` |  |
| align | Horizontal alignment of inline buttons | `'left' \| 'center' \| 'right'` | `'left'` |  |

#### GridAction Slots

| Slot Name | Description                                         | Version |
| --------- | --------------------------------------------------- | ------- |
| default   | Action buttons of one row, one node per action      |         |
| more      | Custom "more" trigger (only the first node is used) |         |

### GridQryBtn

Query/reset button pair: query emits `beforeQueryCallback` → calls `grid.commitProxy('_init')` → emits `queryCallback`; reset only emits `resetCallback`. The original counter-refresh side effect was removed; hosts handle it via these callbacks.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| grid | vxe-grid instance (or any object with a `commitProxy` method); invoked only when `isFunction(grid.commitProxy)` | object | `{}` |  |

#### GridQryBtn Events

| Event Name          | Description  | Arguments | Version |
| ------------------- | ------------ | --------- | ------- |
| beforeQueryCallback | Before query | -         |         |
| queryCallback       | After query  | -         |         |
| resetCallback       | After reset  | -         |         |

### ColumnsConfig

Column config modal: left panel checkbox selection (search / select-all / indeterminate) plus right panel drag & drop ordering; confirm outputs `{ key, sort, checked }[]` for all fields. Column identity is `field` only. Persistence is fully owned by the host: echo via `defaultChecked`, save via `requestSave` or the `confirm` event.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| columns | Full column config (vxe columns); columns without `field` are excluded | array | `[]` |  |
| menuCode | Menu identifier, forwarded to `requestSave` | string | `''` |  |
| defaultChecked | Selected field keys from the host's storage; non-empty means "has saved config" (only those fields checked, order = sort), empty means default-check-all (`visible !== false`) | string[] | `[]` |  |
| requestSave | Optional save API `(menuCode, columns) => Promise`; when provided the original confirm flow runs (loading → save → success toast + close on `code === 200`, else warning); when omitted confirm directly emits `confirm(columns)` | Function | - |  |

#### ColumnsConfig Events

| Event Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| confirm | Confirm finished; carries `columns` (`{ key, sort, checked }[]`) when `requestSave` is omitted, no payload otherwise (same as the original) | - or columns |  |

### DcGridQryForm

Dynamic query condition bar: builds add/remove condition chips from `formConfig.items` (built-in `$select` / `$input` renderers, or named slots), supports collapsing, `fixedFields` ordering (start first / end last) and per-`menuCode` field memory. `mode="grid"` wires query to `grid.commitProxy('_init')`; `mode="standalone"` leaves querying to the host via `queryCallback`. The condition cache is stored in localStorage (key `busi-grid-cond-${menuCode}`) with try/catch degradation.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| formConfig | Pass `gridOptions.formConfig` directly; `items` drive the field list (`field` / `title` / `itemRender` / `slots.default` / `className` / `contentClassName` / `contentStyle` supported) | object | `{ items: [] }` |  |
| queryParams | Query params object (restored in place to the initial snapshot on reset) | object | `{}` |  |
| grid | vxe-grid instance (or object with `commitProxy` / `getProxyInfo`), used in `mode="grid"` | object | `{}` |  |
| menuCode | Menu identifier for the localStorage condition cache, no caching when omitted | string | `''` |  |
| defaultSelectedFields | Default selected fields (fallback when cache misses) | string[] | `[]` |  |
| dynamicFields | Dynamically injected fields: auto-selected and excluded from cache | string[] | `[]` |  |
| showAddBtn | Whether to show the "add condition" button | boolean | `true` |  |
| mode | Mode | `'grid' \| 'standalone'` | `'grid'` |  |
| fixedFields | Fixed ordering `{ start: string[], end: string[] }` | object | `{ start: [], end: [] }` |  |

#### DcGridQryForm Events

| Event Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:queryParams | `v-model:queryParams` (reset restores in place and does not emit this) | - |  |
| beforeQueryCallback | Before query | - |  |
| queryCallback | After query | - |  |
| resetCallback | After reset | - |  |
| removeField | A condition field was removed | field |  |

#### DcGridQryForm Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| item.slots.default or item.field | Fields without a built-in renderer use named slots with scope `{ data, field }` (`data` is the internal form object) |  |

### ActionBody

A flex-based horizontal action container (the former standalone `table` category is merged into this family): children are spaced 8px apart, never wrapped; `align` controls alignment. The container itself has no background or border — place it directly in table toolbars, card action areas, etc.

| Property | Description                                       | Type   | Default | Version |
| -------- | ------------------------------------------------- | ------ | ------- | ------- |
| align    | Content alignment, one of `left` `center` `right` | string | `left`  |         |

#### ActionBody Slots

| Slot Name | Description                                              | Version |
| --------- | -------------------------------------------------------- | ------- |
| default   | Action item content, any child node (usually `a-button`) |         |
