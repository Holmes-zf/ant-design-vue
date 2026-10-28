---
category: Components
type: 业务
title: Decoration
cover: https://gw.alipayobjects.com/zos/alicdn/MNbKfLBVb/Empty.svg
---

Decoration components: a small collection that assists business development and only handles "appearance tweaks and layout isolation". They carry no business state or data logic and provide no card-like background, radius or border — they simply converge the default behaviour of the underlying antd components into the project's unified form. Currently `Empty` (business empty state) is included.

## When To Use

- A placeholder for an empty list, table or detail block (`Empty`).
- When the whole app should share one empty illustration and text, with per-place changes only when truly needed.

## API

### Empty

Built on Ant Design [Empty](/components/empty/): it defaults to the **simple illustration** and the "暂无数据" text; its wrapper establishes a BFC (`display: flow-root`) so the vertical margins antd's empty state carries are contained inside the component instead of collapsing into and disturbing the parent layout. Background, radius and border are not its job — the card look belongs to the surrounding container.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| description | Empty state text (**falls back to `暂无数据` when empty**) | string | `''` |  |
| image | Illustration: a string is used as the image URL, or pass `Empty.PRESENTED_IMAGE_SIMPLE` / `Empty.PRESENTED_IMAGE_DEFAULT` (**simple illustration by default**) | string \| object | `Empty.PRESENTED_IMAGE_SIMPLE` |  |

> `class` / `style` land on the `.empty_wrapper` shell; other `a-empty` props such as `imageStyle` are not forwarded — use `a-empty` directly when you need them.
