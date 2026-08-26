---
category: Components
type: 业务
title: Modal
subtitle: 自定义弹窗
cover: https://gw.alipayobjects.com/zos/alicdn/3StSdUlSH/Modal.svg
---

基于 Ant Design [Modal](/components/modal/) 封装的业务弹窗组件。提供标准化的圆角按钮底部栏、加载状态管理、深色遮罩样式和中文本地化默认值。

## 何时使用

- 当需要一个带有统一业务样式（深色遮罩、圆角按钮）的弹窗时。
- 当需要对异步操作进行加载状态控制，防止重复提交时。
- 当需要标准化确认/取消按钮布局时。

## API

### Modal

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| visible(v-model) | 对话框是否可见 | boolean | `false` |  |
| loading | 操作按钮的加载状态 | boolean | `false` |  |
| afterClose | Modal 完全关闭后的回调 | function | 无 |  |
| bodyStyle | Modal body 样式 | object | `{}` |  |
| cancelButtonProps | cancel 按钮 props | [ButtonProps](/components/button/#API) | - |  |
| cancelText | 取消按钮文字 | string \| slot | `取消` |  |
| centered | 垂直居中展示 Modal | boolean | `false` |  |
| closable | 是否显示右上角的关闭按钮 | boolean | `true` |  |
| closeIcon | 自定义关闭图标 | VNode \| slot | - |  |
| confirmLoading | 确定按钮 loading | boolean | `false` |  |
| destroyOnClose | 关闭时销毁 Modal 里的子元素 | boolean | `false` |  |
| dialogClass | 可用于设置浮层的类名 | string | - |  |
| dialogStyle | 可用于设置浮层的样式，调整浮层位置等 | object | - |  |
| forceRender | 强制渲染 Modal | boolean | `false` |  |
| getContainer | 指定 Modal 挂载的 HTML 节点 | (instance): HTMLElement | `() => document.body` |  |
| mask | 是否展示遮罩 | boolean | `true` |  |
| maskClosable | 点击蒙层是否允许关闭（**固定为 `false`**） | boolean | `false` |  |
| maskStyle | 遮罩样式（默认使用业务深色主题） | object | `{ background: 'rgba(0, 13, 22, 0.7200)', backdropFilter: 'blur(1px)' }` |  |
| okButtonProps | ok 按钮 props | [ButtonProps](/components/button/#API) | - |  |
| okText | 确认按钮文字 | string \| slot | `确认` |  |
| okType | 确认按钮类型 | string | `primary` |  |
| onCancel | 自定义取消回调 | Function | - |  |
| title | 标题 | string \| slot | 无 |  |
| width | 宽度 | string \| number | `520` |  |
| wrapClassName | 对话框外层容器的类名 | string | - |  |
| zIndex | 设置 Modal 的 `z-index` | number | `1000` |  |

### 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| cancel | 点击遮罩层或右上角叉或取消按钮的回调 | function(e) |  |
| ok | 点击确认按钮时的回调 | - |  |
| update:visible | 对话框可见性变化时的回调 | (visible: boolean) |  |

### Modal 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 弹窗主体内容 |  |
| footer | 自定义底部内容（覆盖 RadiusButton 默认底部） |  |
| okText | 自定义确认按钮文字 |  |
| cancelText | 自定义取消按钮文字 |  |

> **注意**：默认 `footer` 使用 `RadiusButton` 组件内部渲染。使用 `footer` 插槽可自定义内容。

### ConfirmModal

确认型弹窗，带有状态图标。继承 [a-modal](/components/modal/#API) 属性，并有以下定制：

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| visible(v-model) | 对话框是否可见 | boolean | `false` |  |
| loading | 操作按钮的加载状态 | boolean | `false` |  |
| content | 主要内容文本 | string | `content` |  |
| tips | 内容下方的提示文本 | string | - |  |
| afterClose | Modal 完全关闭后的回调 | function | 无 |  |
| bodyStyle | Modal body 样式 | object | `{}` |  |
| cancelButtonProps | cancel 按钮 props | [ButtonProps](/components/button/#API) | - |  |
| cancelText | 取消按钮文字 | string \| slot | `取消` |  |
| centered | 垂直居中展示 Modal | boolean | `false` |  |
| closable | 是否显示右上角的关闭按钮 | boolean | `true` |  |
| closeIcon | 自定义关闭图标 | VNode \| slot | - |  |
| confirmLoading | 确定按钮 loading | boolean | `false` |  |
| destroyOnClose | 关闭时销毁 Modal 里的子元素 | boolean | `false` |  |
| dialogClass | 可用于设置浮层的类名 | string | - |  |
| dialogStyle | 可用于设置浮层的样式，调整浮层位置等 | object | - |  |
| forceRender | 强制渲染 Modal | boolean | `false` |  |
| getContainer | 指定 Modal 挂载的 HTML 节点 | (instance): HTMLElement | `() => document.body` |  |
| mask | 是否展示遮罩 | boolean | `true` |  |
| maskClosable | 点击蒙层是否允许关闭（**固定为 `false`**） | boolean | `false` |  |
| maskStyle | 遮罩样式（默认使用业务深色主题） | object | `{ background: 'rgba(0, 13, 22, 0.7200)', backdropFilter: 'blur(1px)' }` |  |
| okButtonProps | ok 按钮 props | [ButtonProps](/components/button/#API) | - |  |
| okText | 确认按钮文字 | string \| slot | `确认` |  |
| okType | 确认按钮类型 | string | `primary` |  |
| onCancel | 自定义取消回调 | Function | - |  |
| type | 状态图标类型 | `''` \| `success` \| `warning` \| `error` | `warning` |  |
| title | 标题（**固定为 `操作确认`**） | string \| slot | `操作确认` |  |
| width | 宽度（**固定为 `700px`**） | string \| number | `700` |  |
| wrapClassName | 对话框外层容器的类名 | string | - |  |
| zIndex | 设置 Modal 的 `z-index` | number | `1000` |  |

### ConfirmModal 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| cancel | 点击遮罩层或右上角叉或取消按钮的回调 | function(e) |  |
| ok | 点击确认按钮时的回调 | - |  |
| update:visible | 对话框可见性变化时的回调 | (visible: boolean) |  |

### ConfirmModal 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 自定义主体内容（替代 content + tips + 图标） |  |
| footer | 自定义底部内容（覆盖默认按钮） |  |
| confirm | 自定义确认按钮区域 |  |
| okText | 自定义确认按钮文字 |  |
| cancelText | 自定义取消按钮文字 |  |

#### 注意

> `<Modal />` 默认关闭后状态不会自动清空，如果希望每次打开都是新内容，请设置 `destroyOnClose`。
