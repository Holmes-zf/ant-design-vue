---
category: Components
type: 业务
title: Input
subtitle: 输入组件群
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

业务输入组件群：围绕「文本录入」的五个组件 —— `FormInput`（单行输入，失焦 trim + 错误态）、`FormTextarea`（多行文本透传壳）、`SelectMultiInput`（左下拉 + 右文本 + 批量入口）、`SelectTextarea`（左下拉 + 右多行文本）、`MultiInputModal`（批量录入弹窗，按分隔符拆成条目数组）。五个组件共用同一套外观契约：聚焦走主色且去掉 antd 光晕、错误态由外层或容器统一承担、常态边框交还 antd。

## 何时使用

- 表单里需要单行文本输入，且希望失焦自动去掉首尾空格时（`FormInput`）。
- 需要多行文本、字数统计，或只想统一多行文本的圆角与聚焦态时（`FormTextarea`）。
- 查询条件里需要「维度 + 值」组合，一次录入多个值时（`SelectMultiInput`）。
- 查询条件里需要「维度 + 多行值」（数量多、需要换行核对）时（`SelectTextarea`）。
- 需要在弹窗里批量录入、核对大量值时（`MultiInputModal`，已由 `SelectMultiInput` 的批量入口内置）。

## 组件选型

| 组件 | 值形态 | 条目语义 | 典型场景 |
| --- | --- | --- | --- |
| `FormInput` | `v-model:value`（string） | 单值 | 普通表单输入 |
| `FormTextarea` | `v-model:value`（string，经 `$attrs` 透传） | 单值（多行） | 备注、描述 |
| `SelectMultiInput` | `v-model:selected` + `v-model:value` | 多条目（按 `separators` 拆分，逗号拼串回写） | 批量单号 / 编码查询 |
| `SelectTextarea` | `v-model:selected` + `v-model:value` | 多条目（按内置规则计数，超限清空） | 大批量单号查询 |
| `MultiInputModal` | `v-model:visible` + `confirm(条目数组)` | 多条目（一项一行） | 批量录入 |

## API

通用约定（全家族生效）：

- **「文本」与「条目」是两层**：`value` 始终是字符串原文；条目数组只在拆分、上限校验、批量回填时作为中间形态，不对外暴露。
- **分隔符规则**：内置规则 = 换行 / 空白 / 加号 / 逗号 / 分号（半角与全角）。自定义规则**必须能匹配换行** —— 折行会把分隔符换成换行，规则不含换行就拆不回来。
- **超限处理**：超过 `limitCount` 时提示并**清空**当前值（本地校验用 `warning`，红色 error 留给接口失败）。
- **外观三态**：`SelectMultiInput` / `SelectTextarea` 的外框、聚焦（`:focus-within`）、错误（`.ant-form-item-has-error`）由容器统一负责，内部子件一律 `bordered=false`；不要再给子件补边框，补了会压掉聚焦反馈与错误红框。
- **`dictCode`**：当前业务组件版本未接入字典服务，数据以 `options` 为准（与 `FormSelect` 一致）。

### FormInput

基于 `a-input` 封装，未列出的属性经 `$attrs` 透传。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 输入框内容 | string | `''` |  |
| trim | 失焦时是否去除首尾空格 | boolean | `true` |  |
| placeholder | 占位文本（默认为 `请输入`） | string | `''` |  |
| formType | 表单展示类型 | `''` \| `fail` | `''` |  |
| isAutoComplete | 是否启用自动完成（`false` 时为只读，鼠标移入后恢复） | boolean | `true` |  |
| addonAfter | 带标签的 input，设置后置标签 | string \| slot |  |  |
| addonBefore | 带标签的 input，设置前置标签 | string \| slot |  |  |
| allowClear | 可以点击清除图标删除内容 | boolean |  |  |
| bordered | 是否有边框 | boolean | true |  |
| defaultValue | 输入框默认内容 | string |  |  |
| disabled | 是否禁用状态，默认为 false | boolean | false |  |
| id | 输入框的 id | string |  |  |
| maxlength | 最大长度 | number |  |  |
| prefix | 带有前缀图标的 input | string \| slot |  |  |
| showCount | 是否展示字数 | boolean | false |  |
| size | 控件大小。注：标准表单内的输入框大小限制为 `large`。可选 `large` `default` `small` | string | `default` |  |
| suffix | 带有后缀图标的 input | string \| slot |  |  |
| type | 声明 input 类型，同原生 input 标签的 type 属性，见：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#属性)(请直接使用 `<a-textarea />` 代替 `type="textarea"`)。 | string | `text` |  |

#### FormInput 事件

| 事件名称     | 说明                   | 回调参数        | 版本 |
| ------------ | ---------------------- | --------------- | ---- |
| change       | 输入框内容变化时的回调 | function(e)     |      |
| blur         | 输入框失焦时的回调     | function(e)     |      |
| update:value | 内容变化时的回调       | (value: string) |      |

#### FormInput 插槽

| 插槽名称 | 说明           | 版本 |
| -------- | -------------- | ---- |
| prefix   | 输入框前缀图标 |      |
| suffix   | 输入框后缀图标 |      |

> `value` 通过 `v-model:value` 双向绑定，其他属性通过 `v-bind="$attrs"` 透传给底层 `a-input`。

### FormTextarea

基于 `a-textarea` 的透传壳，**不声明 `value` prop**（声明即截断透传链，双向绑定失效），未列出的属性经 `$attrs` 直达 `a-textarea`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 文本内容（经 `$attrs` 透传，不是声明式 prop） | string | - |  |
| placeholder | 占位文本（默认为 `请输入`） | string | `''` |  |
| allowClear | 可以点击清除图标删除内容（**默认开启**，可传 `false` 覆盖） | boolean | `true` |  |
| autoSize | 自适应内容高度，可设置 `{ minRows, maxRows }`（继承自 `a-textarea`） | boolean \| object | `false` |  |
| showCount | 是否展示字数（继承自 `a-textarea`） | boolean | `false` |  |
| rows | 文本域行数（继承自 `a-textarea`） | number | - |  |
| maxlength | 最大长度（继承自 `a-textarea`） | number | - |  |

> 类名 `form-textarea` 是外部样式覆盖的稳定锚点，`SelectTextarea` 也按它做布局，请勿改名。

### SelectMultiInput

「左下拉 + 右文本 + 批量入口」三合一，用于「维度 + 多个值」的查询条件。外框 / 聚焦 / 错误三态由容器承担，`class` / `style` 归容器，其余属性透传给右侧输入框。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | 左侧下拉选中值 | string \| number | - |  |
| value(v-model:value) | 右侧文本原文（多条目以 `,` 拼串） | string | - |  |
| options | 左侧下拉数据源（≥2 条才渲染下拉；恰好 1 条时退化为输入框前缀标签） | Array&lt;{ label, value, disabled }&gt; | `[]` |  |
| dictCode | 字典编码（当前版本未接入字典服务，以 `options` 为准） | string | `''` |  |
| isShowModal | 是否显示批量录入入口（弹窗内一项一行、可回填） | boolean | `false` |  |
| limitCount | 条目上限，超出提示并清空 | number | `1000` |  |
| separators | 拆分规则：不传按内置规则拆；传规则自定义（如 `/[\n]+/` 只按换行）；传 `false` 不拆分、原文进出 | RegExp \| string \| string[] \| `false` | 内置规则 |  |
| isShowLabel | 下拉只有一条时，是否把该条 `label` 作为输入框前缀 | boolean | `true` |  |
| validateList | 需要即时触发所在 `a-form-item` 校验的字段名 | `('selected' \| 'value')[]` | `[]` |  |
| placeholder / disabled / maxlength … | 其余属性透传给右侧输入框 | - | - |  |

#### SelectMultiInput 事件

| 事件名称        | 说明                                   | 回调参数                  | 版本 |
| --------------- | -------------------------------------- | ------------------------- | ---- |
| update:selected | 下拉选中值变化                         | (value: string \| number) |      |
| changeSelect    | 下拉选择回调                           | (value: string \| number) |      |
| update:value    | 文本值变化（手输、粘贴、批量回填共用） | (value: string)           |      |
| changeInput     | 文本输入回调                           | (value: string)           |      |

> 已知特征：`separators` 生效时，结尾刚敲的分隔符会被归一化抹掉（`a,` → `a`），紧接着的输入会接到该字符后面。这是「先写回原文再 emit」的代价，多值录入请走批量弹窗。
>
> `a-form-item` 无法为两个控件分别提供 `label[for]`，需要即时校验时请显式传 `validateList`。

### SelectTextarea

「左下拉 + 右多行文本」合成框，高度由文本域的 `rows` 决定（左下拉 `stretch` 跟随）。外框 / 聚焦 / 错误三态同样由容器承担。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | 左侧下拉选中值 | string \| number | - |  |
| value(v-model:value) | 右侧多行文本原文 | string | - |  |
| options | 左侧下拉数据源（≥2 条才渲染下拉） | Array&lt;{ label, value, disabled }&gt; | `[]` |  |
| dictCode | 字典编码（当前版本未接入字典服务，以 `options` 为准） | string | `''` |  |
| placeholder | 占位文本 | string | `多个内容请用换行、空格或逗号分隔` |  |
| rows | 文本域行数（高度来源，不要再用内联 `height` 定高） | number | `2` |  |
| limitCount | 条目上限，超出提示并清空 | number | `50` |  |
| showCount | 是否展示「条目数 / 上限」；传对象视为自定义 `formatter` 原样透传 | boolean \| object | - |  |
| disabled / maxlength / @keydown … | 其余属性透传给右侧文本域 | - | - |  |

#### SelectTextarea 事件

| 事件名称        | 说明                         | 回调参数                  | 版本 |
| --------------- | ---------------------------- | ------------------------- | ---- |
| update:selected | 下拉选中值变化               | (value: string \| number) |      |
| changeSelect    | 下拉选择回调                 | (value: string \| number) |      |
| update:value    | 文本值变化（手输、粘贴共用） | (value: string)           |      |
| changeInput     | 文本输入回调                 | (value: string)           |      |

> `showCount` 统计的是**条目数**（按内置分隔符拆分后的数量），不是字符数。

### MultiInputModal

批量录入弹窗：外壳复用本库 `Modal`（遮罩、圆角按钮、可见性语义与属性透传均由它提供），本组件只负责「一项一行折行 + 分隔符归一」。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| visible(v-model:visible) | 是否可见 | boolean | `false` |  |
| value | 打开时灌入的初始文本（只作初值，不是 `v-model`；关闭时清草稿） | string | - |  |
| separators | 折行与拆分规则（不传用内置规则；自定义规则**必须能匹配换行**） | RegExp \| string \| string[] | 内置规则 |  |
| title | 标题（**默认 `批量录入`**，可覆盖） | string | `批量录入` |  |
| width | 宽度（**默认 `600`**，可覆盖） | string \| number | `600` |  |
| centered | 垂直居中展示（**默认 `true`**，可覆盖） | boolean | `true` |  |
| maskClosable | 点击蒙层是否关闭（**默认 `true`**，可覆盖） | boolean | `true` |  |
| 其余属性 | 经 `$attrs` 透传给 `Modal` | - | - |  |

#### MultiInputModal 事件

| 事件名称       | 说明                                               | 回调参数           | 版本 |
| -------------- | -------------------------------------------------- | ------------------ | ---- |
| update:visible | 可见性变化（确定 / 取消 / 右上角关闭统一走此信号） | (visible: boolean) |      |
| confirm        | 点击确定，回传拆分去重后的条目数组                 | (items: string[])  |      |

> 输入期自动折行、折行后光标跟随（回改中间某一项不会跑位）；中文输入法组合期不做特殊处理，可正常输入。
