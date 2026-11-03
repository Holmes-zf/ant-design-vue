---
category: Components
type: Busi
title: Steps
cover: https://gw.alipayobjects.com/zos/antfincdn/UZYqMizXHaj/Steps.svg
---

A node style step bar: `StepsBox` lays the node list out horizontally, connects nodes with three dots, shows a completed icon on the current node and sequence numbers on the others. Content comes from `steps` only; there is no slot.

## When To Use

- Showing the flow nodes of a document/task (reached, current) with a title and a subtitle such as time.
- When lighting specific nodes explicitly (skipped nodes, partially walked flows).

## Component Selection

| Component | Role | Typical Scenario |
| --- | --- | --- |
| `StepsBox` | Container: node list + lighting control (`value` / `current`) | Document / task flow nodes |
| `Step` | Single node: icon + title + subtitle (internal) | Rendered by `StepsBox` |
| `StepIcon` | Circular icon shell: primary color when lit (internal) | Rendered by `Step` |
| `StepSpotIcon` | Three-dot connector between nodes, decorative (internal) | Rendered by `StepsBox` |

## API

### StepsBox

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| steps | Node list, each `{ title, description }` | Array&lt;{title, description}> | `[]` |  |
| value | Explicit lighting: matched indexes are lit (`[]` = none); **when provided it wins over `current`** | number[] | - |  |
| current | Sequential lighting: `0..current` are lit; only used when `value` is absent | number | - |  |

- Out-of-range and non-integer indexes are dropped (the bar never silently goes dark).
- The current node is the largest lit index; no completed icon when nothing is lit.
- Node width is fixed, so put it inside a horizontally scrollable container (e.g. `ScrollBox`) when there are many nodes.

### Step

A single node (internal, rendered by `StepsBox`; rarely used on its own).

| Property    | Description                            | Type             | Default | Version |
| ----------- | -------------------------------------- | ---------------- | ------- | ------- |
| title       | Title                                  | string           | -       |         |
| description | Subtitle (e.g. node time)              | string           | -       |         |
| text        | Default icon content (sequence number) | string \| number | -       |         |
| active      | Whether the node is lit                | boolean          | `false` |         |

#### Step Slots

| Slot Name | Description                                                           | Version |
| --------- | --------------------------------------------------------------------- | ------- |
| default   | Icon content, overrides `text` (`StepsBox` passes the completed icon) |         |

### StepIcon

Circular icon shell (internal, rendered by `Step`).

| Property | Description                                             | Type    | Default | Version |
| -------- | ------------------------------------------------------- | ------- | ------- | ------- |
| active   | Whether lit (lit = primary background + primary shadow) | boolean | `false` |         |

#### StepIcon Slots

| Slot Name | Description                               | Version |
| --------- | ----------------------------------------- | ------- |
| default   | Circle content (number or completed icon) |         |

### StepSpotIcon

Three-dot connector between nodes (internal, decorative, `aria-hidden`, rendered by `StepsBox`).

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| current | Current node index; `-1` means nothing is lit | number | - |  |
| value | Own index (the connector sits before the node with this index) | number | - |  |

> Lighting rule is `current >= value`: the connector strictly follows the node it points to, with no "one step early" state.
