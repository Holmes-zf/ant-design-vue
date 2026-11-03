---
category: Components
type: Busi
title: ScrollBox
cover: https://gw.alipayobjects.com/zos/antfincdn/%24C9tmj978R/Carousel.svg
---

A horizontal scroll container with arrows on both ends and smooth scrolling. Arrows appear only when content overflows, and arrow slots always keep their width so content never jumps.

## When To Use

- A single row of tabs, tags or cards does not fit a narrow container and scrollbars are unwanted.
- When you want paging by half a viewport, or to turn a vertical wheel into horizontal scrolling.

## API

### ScrollBox

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| step | Scroll step of the arrows: `half` = half the visible width, a number = pixels | `'half'` \| number | `'half'` |  |
| veil | Fade masks at both ends, gradually blending content into the container background | boolean | `false` |  |
| wheel | Turn a vertical wheel into horizontal scrolling; only takes over while content overflows, returns scrolling at the edges | boolean | `false` |  |

#### ScrollBox Events

| Events Name | Description                    | Arguments                    | Version |
| ----------- | ------------------------------ | ---------------------------- | ------- |
| scroll      | Triggered on horizontal scroll | function(scrollLeft: number) |         |

#### ScrollBox Slots

| Slot Name | Description                                                               | Version |
| --------- | ------------------------------------------------------------------------- | ------- |
| default   | Scroll content (width is driven by content, not clamped by the container) |         |
| prev      | Replace the left arrow                                                    |         |
| next      | Replace the right arrow                                                   |         |

#### ScrollBox Instance Methods

| Method | Description | Type |
| --- | --- | --- |
| prev | Scroll left by one step | () => void |
| next | Scroll right by one step | () => void |
| scrollTo | Scroll to a position (clamped to range, `smooth` defaults to `true`) | (left: number, smooth?: boolean) => void |
| scrollIntoView | Scroll the target into view; no-op when already fully visible | (target: Element \| ComponentPublicInstance, smooth?: boolean) => void |
| refresh | Re-measure the scrollable distance (call it after size changes) | () => void |

#### Note

> Container and content sizes are tracked by `ResizeObserver`; after inserting nodes without a size change (e.g. virtual scrolling), call `refresh()` manually. Arrows are hidden rather than removed when content does not overflow, so the layout never jumps.
