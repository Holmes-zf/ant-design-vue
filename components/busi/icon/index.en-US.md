---
category: Components
type: Busi
title: SvgIcon
cover: https://gw.alipayobjects.com/zos/alicdn/wwvDvhBgO/Icon.svg
---

An SVG sprite icon component using the `<use>` element to reference icons by ID. Supports customizable icon size.

## When To Use

- When you need to display SVG sprite icons by referencing their symbol ID.
- When you need consistent icon sizing across the application.

## API

### SvgIcon

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| icon | The icon ID (references `#icon-id` in SVG sprite) | string | - |
| size | Icon size | string \| number | `'14px'` |
