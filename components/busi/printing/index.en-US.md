---
category: Components
type: Busi
title: Printing
cover: https://gw.alipayobjects.com/zos/alicdn/MjtG9_FOI/Descriptions.svg
---

A printing container: the default slot content is moved into a standalone iframe and printed there, so only that content is printed instead of the whole page. Paper is A4 with zero margin, and the printout is fully isolated from the rest of the page.

## When To Use

- When only a block of the page (document, label, waybill) should be printed.
- When the printout needs per-page blocks and stable pagination / paper margins.

## API

### PrintingBody

The component has no props; content and timing are controlled by the slot and the instance method.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| printing | Instance method: starts printing after content, images and fonts are ready. Rejects when the print source is unavailable (e.g. not mounted) | () => Promise&lt;void> | - |  |

#### PrintingBody Events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| after-print | Triggered after printing finishes (including user cancellation) | function() |  |

#### PrintingBody Slots

| Slot Name | Description                                                               | Version |
| --------- | ------------------------------------------------------------------------- | ------- |
| default   | Print content; one block per page, add `break-after: page` between blocks |         |

#### Note

- Put printout styles in a `scoped` `<style>` block (the component injects those rules into the iframe); **non-scoped global styles are not injected**, so do not rely on the parent page's positioning or size.
- Theme CSS variables are copied into the iframe, so `var(--xxx)` keeps working.
- The iframe content is cleared after printing, leaving no stale printout behind.
