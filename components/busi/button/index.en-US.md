---
category: Components
type: Busi
title: RadiusButton
cover: https://gw.alipayobjects.com/zos/alicdn/fNUKzY1sk/Button.svg
---

A rounded corner button wrapper based on Ant Design [Button](/components/button/). Supports custom minimum width and a grey disabled style.

## When To Use

- When you need a button with consistent 4px border-radius across the application.
- When you need a grey-out style for disabled or secondary states.
- When you want to enforce a minimum button width.

## API

### RadiusButton

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| width | Minimum width of the button | string \| number | - |  |
| grey | Enable grey disabled style | boolean | `false` |  |
| block | Option to fit button width to its parent width | boolean | `false` |  |
| danger | Set the danger status of button | boolean | `false` |  |
| disabled | Disabled state of button | boolean | `false` |  |
| ghost | Make background transparent and invert text and border colors | boolean | `false` |  |
| href | Redirect url of link button | string | - |  |
| htmlType | Set the original html `type` of `button`, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string | `button` |  |
| icon | Set the icon of button | v-slot | - |  |
| loading | Set the loading status of button | boolean \| { delay: number } | `false` |  |
| shape | Can be set button shape | `default` \| `circle` \| `round` | `default` |  |
| size | Set the size of button | `large` \| `middle` \| `small` | `middle` |  |
| target | Same as target attribute of a, works when href is specified | string | - |  |
| type | Can be set button type | `primary` \| `ghost` \| `dashed` \| `link` \| `text` \| `default` | `default` |  |

### events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- |
| click | Set the handler to handle `click` event | (event) => void |  |

It accepts all props which native buttons support.

### Methods

| Name | Description | Version |
| --- | --- | --- |
| blur() | Remove focus |  |
| focus() | Get focus |  |
