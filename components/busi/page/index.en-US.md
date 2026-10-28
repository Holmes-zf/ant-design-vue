---
category: Components
type: Busi
title: Page
cover: https://gw.alipayobjects.com/zos/alicdn/6bKE0Cq0R/PageHeader.svg
---

A family of page-shell containers built around the page skeleton: `PageBody` (body container with an optional header bar), `PageBodyHeader` (the header bar), `DetailPage` (page-level shell: header row + content + page footer), `DetailHeader` (header row: back + title on the left, tools on the right), and `DetailContainer` (block-level container with its own footer). All five only handle layout and height distribution — no business styling and no awareness of business state: header content, body and footer are decided entirely by slots.

## When To Use

- When you need a main area with an optional header plus content, use `PageBody` (whether `#header` is passed decides whether the header is rendered).
- When a detail or form page needs a full-page shell of "back header + content + page footer", use `DetailPage`.
- When the header should read "back + title + subtitle + tags on the left, page tools on the right", use `DetailHeader`.
- When one page contains several blocks and each block needs its own action bar, use `DetailContainer`.

## Component Selection

| Component | Role | Footer | Typical usage |
| --- | --- | --- | --- |
| `PageBody` | Body container: header + content, size configurable | No | Content area inside a tab panel or a card |
| `PageBodyHeader` | Header bar (white / 60px / 10px horizontal padding / 12px bottom gap) | No | Placed into `PageBody`'s `#header` slot; also usable standalone when the header is a single toolbar |
| `DetailPage` | Page-level shell: header row + content + page footer | Yes (`#footer`, pinned to bottom) | Detail pages, form pages |
| `DetailHeader` | Header row: "back + title + subtitle + tags" left, tools right | No | Already used inside `DetailPage`; usable standalone for a custom header |
| `DetailContainer` | Block-level container: content + this block's footer | Yes (`#footer`, `flow` / `fixed`) | Splitting a page into blocks, each with its own action bar |

## API

Conventions for the whole family:

- **Height context adapts automatically, no switch needed**: when the host has a definite height (tab panel, modal body, fixed-height card, page shell with a height), the content area scrolls by itself and the footer stays at the bottom of the column; when the host grows with its content, it degrades to whole-page scrolling and the footer follows the content.
- **The footer exists only if the slot does**: put `v-if` on `<template #footer v-if="…">` for conditional action bars — no slot means no empty space, and containers never inspect business state.
- **Size handling**: `width` / `height` accept numbers and numeric strings (treated as `px`); values with units or CSS keywords (`100%`, `auto`, `inherit`…) are passed through as-is.
- **Theme variables**: background, shadow, z-index and footer height come from business CSS variables (`--bg-color-white`, `--form-footer-shadow`, `--z-index-fixed-footer`, `--form-footer-height`), with light baselines as fallbacks when no business theme is installed.
- **Overriding styles**: target the inner class together with an ancestor class (plus `:deep()`), instead of competing with the container's own rule at the same specificity.

### PageBody

Body container: an optional header bar plus a flexible content area that fills the remaining height.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| width | Width; numbers / numeric strings are treated as `px` | string \| number | `100%` |  |
| height | Height; fills the parent by default, pass `'auto'` to grow with content | string \| number | `100%` |  |

#### PageBody Slots

| Slot | Description | Version |
| --- | --- | --- |
| header | Header bar content (rendered inside `PageBodyHeader`); the whole header is skipped when not provided |  |
| default | Content area |  |

### PageBodyHeader

The header bar. It only provides a default spec and a default slot, with no props. Default spec: white background, min-height 60px, 10px horizontal padding, 12px gap to the content below, contents laid out with wrapping `flex` and vertically centered. For other looks (grey background, compact height, …), override with an ancestor class plus `.page-body-header`.

#### PageBodyHeader Slots

| Slot    | Description                                             | Version |
| ------- | ------------------------------------------------------- | ------- |
| default | Header content (title, tags, buttons — freely arranged) |         |

### DetailPage

Page-level shell: header row + content + page footer (one footer per page). It declares no height and grows with content; write `.detail-content { height: … }` on the page side when a fixed height is needed.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| showHeader | Whether to render the header row | boolean | `true` |  |
| title | Title | string | - |  |
| subTitle | Subtitle | string | - |  |
| back | Click handler of the back button; falls back to router / browser history when omitted | function | - |  |

> The back button is always rendered (`a-page-header` decides by the presence of the handler); `back` only changes the click behavior.

#### DetailPage Slots

| Slot | Description | Version |
| --- | --- | --- |
| tags | Tags rendered in the title row |  |
| headerRight | Tools on the right side of the header |  |
| default | Page content |  |
| footer | Page-level footer (pinned to the bottom, usually a `FormFooter`); not rendered when omitted |  |

### DetailHeader

Header row: "back + title + subtitle + tags" on the left, "tools" on the right. This component is the only child of the header bar — the left/right split comes from its own flex — while background, height and paddings belong to the host (`DetailPage` already adapts them).

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| title | Title | string | - |  |
| subTitle | Subtitle | string | - |  |
| back | Click handler of the back button; falls back to router / browser history when omitted | function | - |  |

#### DetailHeader Slots

| Slot        | Description                    | Version |
| ----------- | ------------------------------ | ------- |
| tags        | Tags rendered in the title row |         |
| headerRight | Tools on the right side        |         |

### DetailContainer

Block-level container: content plus this block's own footer. It only handles vertical layout — no background, radius, or spacing.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| footer | Footer form of this block: `flow` stays in the column end (pinned when the host has a height, otherwise follows the content) / `fixed` floats above the page | `flow` \| `fixed` | `flow` |  |

#### DetailContainer Slots

| Slot    | Description                                     | Version |
| ------- | ----------------------------------------------- | ------- |
| default | Block content                                   |         |
| footer  | Footer of this block; not rendered when omitted |         |

#### Note

> `footer="fixed"` is meant to pair with the `fixed` form of `FormFooter`; the container reserves the floating footer's height for its content. The floating footer is anchored to a page ancestor, so **only one `fixed` container per page**. When several blocks each need a footer, use the default `flow`.
