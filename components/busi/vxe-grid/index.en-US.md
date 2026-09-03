---
category: Components
type: Busi
title: DcVxeGrid
subtitle: 高性能业务表格
cover: https://gw.alipayobjects.com/zos/alicdn/5rWLU27so/Grid.svg
---

A business table component based on `vxe-grid`. All props, events and slots are passed through, with built-in business default configs, empty data display, cell/header double-click copy, column width cache and other standalone methods.

It depends on `vxe-table@4.5.19` and `xe-utils`, which must match the version used by the business system.

## When To Use

- When you need large datasets, virtual scrolling, resizable columns, area selection & copy and other enhanced table capabilities.
- When you need consistent table behavior with the business system.

## Initialization

Register vxe-table modules at the app entry before usage (includes global default params):

```ts
import { createApp } from 'vue';
import { useTable } from 'ant-design-vue/busi/vxe-grid';

const app = createApp(App);
useTable(app); // registers Header/Filter/Edit/Keyboard/Grid/Pager etc. (built-in zh-CN locale)
app.mount('#app');
```

## API

### DcVxeGrid

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| gridTheme | Table theme class appended to `.grid-wrap`, options: `grid--default` `grid--modal` | string | `grid--default` |  |

### Props passed through to vxe-grid (recommended with `setGridOpts('props', {...})`)

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| id | Unique table id for column width cache (required for caching) | string | `''` |  |
| columns | Column configs | any[] | - |  |
| data | Static data (choose one of `proxyConfig`) | any[] | - |  |
| height | Table height, **default `auto`** (parent must have height) | string \| number | `'auto'` |  |
| size | Size, **default `medium`** (fixed by global setup) | string | `'medium'` |  |
| border | Border, **default `border`** | string \| boolean | `'border'` |  |
| stripe | Striped rows, **default `false`** | boolean | `false` |  |
| showHeaderOverflow | Header overflow tooltip, **default `true`** | boolean \| string | `true` |  |
| showOverflow | Body overflow tooltip, **default `true`** | boolean \| string | `true` |  |
| keepSource | Keep source data, **default `true`** | boolean | `true` |  |
| loading | Table loading state | boolean | `false` |  |
| proxyConfig | Data proxy config (query/pagination/form) | object | - |  |
| pagerConfig | Pager config, **default right-aligned, pageSize 50, sizes 20/50/100/200/500** | object | - |  |
| formConfig | Query form config, **default vertical layout** (fixed by global setup) | object | - |  |
| toolbarConfig | Toolbar config | object | - |  |
| rowConfig | Row config, **default `useKey: true`, `isHover: true`, `keyField: 'rowId'`** | object | - |  |
| columnConfig | Column config, **default `useKey: true`, `resizable: true`** | object | - |  |
| sortConfig | Sort config, **default local auto sort** (number/time/string aware, see `columnsSort`) | object | - |  |
| checkboxConfig | Checkbox config, **default `reserve: true`, `highlight: true`, `range: true`** | object | - |  |
| editConfig | Edit config, **default click trigger, row mode, show status** | object | - |  |
| scrollX / scrollY | Virtual scrolling, **default enabled when rows > 20 (`gt: 20`)** | object | - |  |
| mouseConfig | Mouse config (`area: true` enables area selection, requires area plugin) | object | - |  |
| areaConfig | Area selection config | object | - |  |
| keyboardConfig | Keyboard config (`isClip: true` enables Ctrl+C copy of selection) | object | - |  |

> The "**default xxx**" values above come from the shared defaults in `setGridOpts('props', opts)` (`gridComOptions`); explicit props override them. Full props reference: [vxe-grid docs](https://vxetable.cn/v4/#/grid/api).

### Events

Events are passed through to vxe-grid, recommended with `setGridOpts('events', {...})`. Some have default business behaviors (explicit handlers override them):

| Event | Description | Callback Params | Version |
| --- | --- | --- | --- |
| cellDblclick | Double click cell, **default copies cell text** | `{ cell, column, row, ... }` |  |
| headerCellDblclick | Double click header, **default copies the whole column** | `{ column, $grid, ... }` |  |
| keydown | Keydown, **default Enter triggers query** (except inside pager) | `{ event, key, $grid, ... }` |  |
| resizableChange | Column resize end, **default caches column widths** (requires `id`) | `{ $grid, column, ... }` |  |
| formCollapse | Query form collapse | `{ $grid, ... }` |  |
| proxyQuery | Proxy query done | `{ $grid, ... }` |  |
| zoom | Table zoom | `{ $grid, ... }` |  |
| Others | All passed through to vxe-grid, e.g. `checkboxChange` `cellClick` | - |  |

### Slots

| Slot | Description | Version |
| --- | --- | --- |
| empty | Empty data content, **default renders simple Empty (`a-empty` SIMPLE image)** |  |
| pagerLeft | Pager left content, **default empty** (for pager statistics etc.) |  |
| Others | All passed through to vxe-grid, e.g. column `slots.default`, `toolbar` |  |

### Ref Methods

Get the component instance via `ref`; the actual grid instance is exposed as `ref.grid`:

| Method | Description | Version |
| --- | --- | --- |
| grid | vxe-grid instance, supports all its methods (`commitProxy`, `getTableData`, `getColumns`, `loadData`, `refreshColumn`, etc.) |  |

```ts
const gridRef = ref();
gridRef.value.grid.commitProxy('_init'); // trigger query
```

### Standalone Methods

| Method | Description | Type | Version |
| --- | --- | --- | --- |
| useTable(app) | Register all vxe-table modules (global defaults, zh-CN locale, area plugin), safe to call repeatedly | `(app: App) => App` |  |
| setGridOpts(type, opts) | Compose shared configs: `props` / `events` / `busi` | `(type, opts) => object` |  |
| updateQueryParams(queryParams, obj) | Update query params, only keep keys present in obj | `(queryParams, obj) => void` |  |
| updateColumns(menuCode, columns) | Update column configs (width repair + default formatter) | `(menuCode, columns) => any[]` |  |
| columnsSort(data, sortList, columns) | Local auto sort (number/time/string aware, empties at bottom) | `(data, sortList, columns) => any[]` |  |
| storageColumns($grid, id) | Cache column widths | `($grid, id) => void` |  |
| repairColumnWidth(menuCode, item) | Restore cached column widths | `(menuCode, item) => object` |  |
| copyTextToClipboard(text, opts) | Copy text to clipboard | `(text, opts) => boolean` |  |
