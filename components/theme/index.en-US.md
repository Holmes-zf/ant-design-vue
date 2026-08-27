---
category: Components
type: Theme
title: Theme
subtitle: Theme Colors
cover: https://gw.alipayobjects.com/zos/alicdn/kegYxl1wj/ConfigProvider.svg
---

Theme color palette from the kats-tenement business system (`src/style`). All colors are referenced via CSS variables `var(--xxx)` — the only accepted form — covering brand, status, extended status, neutral, background, table & tag, border & divider, typography, upload / scrollbar / node-alert, and vxe-table palettes.

Variable values are defined in each theme's `themes/{light,dark}/vars.less` (`:root` literal set, single source of truth). Switching theme at runtime applies to the whole site.

## When to use

- Need a quick reference for the kats-tenement theme palette — see the "All Theme Variables" demo.
- When referencing theme colors in business styles, always use `var(--xxx)` instead of hard-coded values.
- When adding a new color variable, follow the two-step convention: register the literal in each theme's `vars.less`, then reference it via `var()`.

## Usage

The "All Theme Variables" demo embeds both light and dark variable sets. Switch themes via the toolbar in the top-right corner; all swatches are rendered with `var(--xxx)` and update in real time. Click any swatch to copy its variable name.

## Variable list

Color variables shared by both themes (dark keeps light values unless overridden). Values below are light defaults; "same" in the dark column means identical to light.

### Brand

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--primary-color` | `#0032a0` | `#1668dc` | Global primary color (antd `@primary-color`) |
| `--dark-primary-color` | `#49bac9` | same | Official antd dark-theme variable name (reserved) |
| `--primary-color-light` | `#a0d9e2` | `#124f9e` | Light primary color |
| `--link-color` | `#0032a0` | `#1668dc` | Link color (same as primary) |

### Status

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--success-color` | `#52c41a` | same | Success color |
| `--warning-color` | `#faad14` | same | Warning color |
| `--error-color` | `#f6530f` | same | Error color (form validation / alert) |
| `--danger-color` | `#f5222d` | same | Danger color (delete / high-risk) |

### Extended status

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--purple-color` | `#722ed1` | same | Purple (status-dot etc.) |
| `--cyan-color` | `#13c2c2` | same | Cyan |
| `--blue-color` | `#1890ff` | same | Blue |
| `--gray-color` | `#999` | same | Gray |

### Neutral

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--text-color` | `rgba(0, 0, 0, 0.65)` | `rgba(255, 255, 255, 0.85)` | Primary text color |
| `--text-color-secondary` | `rgba(0, 0, 0, 0.45)` | `rgba(255, 255, 255, 0.45)` | Secondary text color |
| `--heading-color` | `rgba(0, 0, 0, 0.85)` | `rgba(255, 255, 255, 0.85)` | Heading color |
| `--disabled-color` | `#999999` | `rgba(255, 255, 255, 0.3)` | Disabled text color |
| `--text-color-deep` | `#122d41` | `rgba(255, 255, 255, 0.9)` | Deep body text |

### Background

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--bg-color-white` | `#fff` | `#1f1f1f` | Generic white background (card/table/modal) |
| `--busi-bg-color` | `#f0f0f7` | `#161616` | Business area background |
| `--select-bg-color` | `#f5f7fa` | `#262626` | Selected / hover background |
| `--modal-mask-bg` | `rgba(0, 13, 22, 0.72)` | `rgba(0, 0, 0, 0.6)` | Modal mask background |
| `--page-bg` | `#f2f4f8` | `#141414` | Page background |
| `--disabled-bg-color` | `#eceeed` | `rgba(255, 255, 255, 0.08)` | Disabled background |
| `--layout-mini-btn-color` | `#999` | `rgba(255, 255, 255, 0.45)` | Layout mini button icon color |

### Table & tag

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--table-header-bg` | `#f5f6f7` | `#1f1f1f` | Table header background |
| `--table-header-color` | `#132043` | `rgba(255, 255, 255, 0.65)` | Table header text |
| `--table-expand-row-bg` | `#f2feff` | `#1b1f2b` | Expanded row header background |
| `--des-label-bg` | `#f0f7fc` | `#1a2430` | Detail label background |
| `--order-tag-bg` | `#eb8730` | same | Platform tag background |

### Border & divider

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--border-color-base` | `#f0f0f0` | `#424242` | Component default border |
| `--border-color-line` | `#d9d9d9` | `#303030` | Line border |
| `--divider-color` | `#eeeeee` | `#303030` | Divider |
| `--border-radius-base` | `4px` | same | Border radius (size variable) |
| `--box-shadow-base` | `0 2px 8px rgba(0, 0, 0, 0.15)` | same | Popup box shadow (size variable) |

### Typography

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--font-size-base` | `14px` | same | Base font size (size variable) |

### Upload / scrollbar / node alert

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--upload-tip-color` | `#9ba7af` | `rgba(255, 255, 255, 0.35)` | Upload tip text |
| `--scrollbar-bg` | `#f1f1f1` | `#1f1f1f` | Scrollbar track |
| `--scrollbar-thumb-bg` | `#c9c9c9` | `#595959` | Scrollbar thumb |
| `--node-alert-error-color` | `#ff0000` | same | Node alert - error |
| `--node-alert-success-color` | `#3d97eb` | same | Node alert - success |
| `--node-alert-gray-color` | `#c0c4cc` | same | Node alert - gray |

### vxe-table

| Variable | Light | Dark | Description |
| --- | --- | --- | --- |
| `--vxe-btn-hover-color` | `#0032a0` | `#1668dc` | Button hover color (same as primary) |
| `--vxe-sort-btn-color` | `#c0c4cc` | `rgba(255, 255, 255, 0.35)` | Sort arrow default color |
| `--vxe-table-border-color` | `#e8eaec` | `#303030` | Cell border color |
| `--air-cell-bg` | `#fffff0` | `#3a3a26` | Air cell background |
| `--box-cell-bg` | `#f8fff8` | `#1f3322` | Box cell background |
| `--pack-cell-bg` | `#fff7f1` | `#3a2f26` | LCL cell background |
| `--vxe-font-color` | `#132043` | `rgba(255, 255, 255, 0.85)` | vxe body text (SCSS bridge) |
| `--vxe-success-color` | `#3fac46` | same | vxe success color |
| `--vxe-info-color` | `#909399` | same | vxe info color |
| `--vxe-danger-color` | `#df443b` | same | vxe danger color |
| `--vxe-striped-bg` | `#f5f5f5` | `rgba(255, 255, 255, 0.03)` | Striped row background |
