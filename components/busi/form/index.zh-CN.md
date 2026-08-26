---
category: Components
type: 业务
title: FormBox
subtitle: 表单块
cover: https://gw.alipayobjects.com/zos/alicdn/ORmcdeaoO/Form.svg
---

表单布局组件族：`FormRow`（纯 CSS 等分布局）、`FormARow`（基于栅格的布局，支持跨列）、`FormACol`（跨列表单项容器）、`FormBox`（白色容器）。基于 Flex 或 24 栅格实现多列等分布局，子项自动过滤空节点。

## 何时使用

- 当需要在表单中快速实现多列等分布局时。
- 当子项数量动态变化、需要自动换行且宽度均分时。
- 当子项需要跨列（占多列宽度）时，使用 `FormARow` + `FormACol`。
- 当需要统一白色卡片容器包裹表单内容时，使用 `FormBox`。

## API

### FormRow

基于 Flex 布局的表单行组件，通过 `colNum` 控制每行列数，子项自动等分宽度。支持任意子节点（通常为 `a-form-item`）。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| colNum | 每行列数 | string \| number | `4` |  |

#### FormRow 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 行内子项，通常为 `a-form-item`，也可为任意内容 |  |

### FormARow

基于 antd `a-row` / `a-col` 的表单行布局，与 FormRow 的差异：跨列使用 24 栅格（`span`），等分使用 `flex`（任意列数），间距使用 `gutter`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| colNum | 每行列数 | string \| number | `4` |  |
| gutter | 列间距（透传 a-row gutter） | string \| number | `16` |  |

#### 跨列声明

跨列有两种等价写法：

- `FormACol` 的 props：`<FormACol colspan="2">` / `<FormACol span="12">`
- 普通子项的 `data-*` 属性：`<a-form-item data-colspan="2">` / `<a-form-item data-span="12">`

> 说明：`colspan` 为相对逻辑列（占 `colNum` 中的 N 列），内部换算为 24 栅格并限制最大 24；`span` 为 24 栅格直透。

#### FormARow 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 行内子项，通常为 `a-form-item` 或 `FormACol` |  |

### FormACol

带跨列配置的表单项容器，内部渲染为 `a-form-item`，配套 `FormARow` 使用。`label` / `name` / `rules` / `required` / `labelCol` 等其余属性自动透传给内部 `a-form-item`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| colspan | 占 `colNum` 中的逻辑列数（如 colNum=3 时 colspan=2 → 占 2/3） | string \| number | `0` |  |
| span | 24 栅格直透（如 span=12 → 占半行） | string \| number | `0` |  |

#### FormACol 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 表单项控件内容（如 `a-input`、`FormInput`） |  |

#### FormACol 继承属性

继承 [a-form-item](/components/form/) 全部属性与插槽（`label` / `name` / `rules` / `required` / `labelCol` / `wrapperCol` / `colon` / `extra` / `help` / `tooltip` 等）。

### FormBox

白色背景容器组件，用于包裹表单内容，无 props。

#### FormBox 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| default | 容器内容 |  |

> 说明：以上组件的子项 key 优先级均为 VNode 自带 `key` > 字段 `name`（数组会以 `.` 拼接）> 索引兜底。空文本、空注释等节点会被自动过滤。
