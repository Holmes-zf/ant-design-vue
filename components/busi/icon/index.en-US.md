---
category: Components
type: Busi
title: SvgIcon
cover: https://gw.alipayobjects.com/zos/alicdn/rrwbSt3FQ/Icon.svg
---

An SVG sprite icon component using the `<use>` element to reference icons by ID. Supports customizable icon size.

It ships with two icon libraries (with distinct symbol id prefixes, coexisting on the same page):

| Library         | Prefix       | Count | Assets Directory        |
| --------------- | ------------ | ----- | ----------------------- |
| Framework icons | `icon-core-` | 44    | `assets/iconfont-core/` |
| Business icons  | `icon-YT`    | 142   | `assets/iconfont-busi/` |

## When To Use

- When you need to display SVG sprite icons by referencing their symbol ID.
- When you need consistent icon sizing across the application.

## Icon Assets

Both libraries share the same asset directory structure, each containing:

| File | Description |
| --- | --- |
| iconfont.js | SVG symbol definitions (sprite). Injects the sprite automatically and exposes `window._iconfont_svg_string_<project id>` |
| iconfont.css / iconfont.ttf / iconfont.woff / iconfont.woff2 | Font icon mode (`<i class="iconfont icon-xxx">`), not required for the SvgIcon approach |
| iconfont.json | Icon metadata (names, unicode mappings, etc.) |

Sprite global variables of the two libraries:

| Library         | Global Variable                       |
| --------------- | ------------------------------------- |
| Framework icons | `window._iconfont_svg_string_5228714` |
| Business icons  | `window._iconfont_svg_string_5104230` |

### Usage

The component does not embed the sprite itself. Import the assets of the library you need first (once globally; when both libraries coexist, import each of them — their distinct symbol id prefixes never conflict):

```ts
// In your entry file or component
import 'components/busi/icon/assets/iconfont-core/iconfont.js'; // framework icons
import 'components/busi/icon/assets/iconfont-busi/iconfont.js'; // business icons
```

Then reference icons via the `icon` prop:

```html
<template>
  <SvgIcon icon="icon-core-search" :size="24" />
  <SvgIcon icon="icon-YTtip" :size="24" />
</template>
```

All icon IDs are listed in the "All Icons" demos, or can be extracted at runtime from the corresponding global variable.

## API

### SvgIcon

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| icon | The icon ID (references `#icon-id` in SVG sprite, e.g. `icon-core-search`, `icon-YTtip`) | string | - |
| size | Icon size | string \| number | `'14px'` |
