---
category: Components
type: Busi
title: SvgIcon
cover: https://gw.alipayobjects.com/zos/alicdn/rrwbSt3FQ/Icon.svg
---

An SVG sprite icon component using the `<use>` element to reference icons by ID. Supports customizable icon size.

It ships with **142** business icons (from the kats-tenement iconfont assets), located in the `assets/iconfont/` directory.

## When To Use

- When you need to display SVG sprite icons by referencing their symbol ID.
- When you need consistent icon sizing across the application.

## Icon Assets

The icon assets live in `components/busi/icon/assets/iconfont/`:

| File | Description |
| --- | --- |
| iconfont.js | SVG symbol definitions (sprite) with 142 icons. Injects the sprite automatically and exposes `window._iconfont_svg_string_5104230` |
| iconfont.css / iconfont.ttf / iconfont.woff / iconfont.woff2 | Font icon mode (`<i class="iconfont icon-xxx">`) |
| iconfont.json | Icon metadata (names, unicode mappings, etc.) |

### Usage

The component does not embed the sprite itself. Import the icon assets first (once globally):

```ts
// In your entry file or component
import 'components/busi/icon/assets/iconfont/iconfont.js';
```

Then reference icons via the `icon` prop:

```vue
<template>
  <SvgIcon icon="icon-YTtip" :size="24" />
</template>
```

All icon IDs are listed in the "All Icons" demo, or can be extracted at runtime from `window._iconfont_svg_string_5104230`.

## API

### SvgIcon

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| icon | The icon ID (references `#icon-id` in SVG sprite, e.g. `icon-YTtip`) | string | - |
| size | Icon size | string \| number | `'14px'` |
