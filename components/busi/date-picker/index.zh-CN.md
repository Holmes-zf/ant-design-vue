---
category: Components
type: 业务
title: DatePicker
subtitle: 时间组件群
cover: https://gw.alipayobjects.com/zos/alicdn/sfuBfXbDZh/DatePicker.svg
---

业务时间组件群：围绕「日期 / 日期时间」的单值与区间输入，提供七个组件，统一字符串值契约（字符串进 / 字符串出）、统一的范围限制语义（方向 `curLimit` + 跨度 `span` + 偏移 `pointTime`）与统一的视觉规范（聚焦主色边框、无外发光）。

## 何时使用

- 需要输入单个日期或日期时间时（`FormDatePicker` / `FormUTCDatePicker`）。
- 需要输入一段日期或日期时间范围，且要求跨度可控、不选未来时（`RangePicker` / `FormRangePicker` / `DateTimeRangePicker`）。
- 需要「维度 + 时间」组合筛选（如仓库 + 月份）时（`DatePickerGroup` / `RangePickerGroup`）。

## 组件选型

| 组件 | 值形态 | 典型场景 | 说明 |
| --- | --- | --- | --- |
| `FormDatePicker` | `v-model:value`（字符串） | 单个日期/日期时间 | 全家族的外壳基座，带 fail 校验态与粘贴同步 |
| `FormUTCDatePicker` | `v-model:value`（字符串） | 口岸时区限时窗口 | 外壳 + 限时窗口：日期/时分秒列禁用 + 「确定」越界灰显 |
| `RangePicker` | `v-model:start` / `v-model:end`（字符串） | 日期区间 | 跨度置灰 + 落笔自动修正另一端 |
| `FormRangePicker` | `v-model:start` / `v-model:end`（字符串） | 表单里的日期区间 | `RangePicker` 加固定宽度外壳（默认禁未来） |
| `DateTimeRangePicker` | `v-model:start` / `v-model:end`（字符串） | 日期时间区间 | 自绘双月面板 + 日期/时间四格切换 + 全局确定 |
| `DatePickerGroup` | `v-model:selected` + `v-model:dateValue` | 维度 + 单日期 | 左侧下拉（`FormSelect`）+ 右侧单日期 |
| `RangePickerGroup` | `v-model:selected` + `v-model:start` / `v-model:end` | 维度 + 日期区间 | 左侧下拉（`FormSelect`）+ 右侧区间 |

> 全家族默认「禁未来」（包装组件 `curLimit` 隐式为 `max`）；`RangePicker` 默认 `no` 不限制。 `span` 默认 30 天是全系统硬要求（含头含尾最多 30 天），传 `0` 才放开。

## API

通用约定（全家族生效）：

- 值通道恒为 `props.format` 的字符串；显示通道跟随语言格式表（`YYYY-MM-DD` ↔ `MM-DD-YYYY` 等双语映射）。
- 范围限制三参数：`curLimit`（`max` 禁未来 / `min` 禁过去 / `no` 不限制）、`span`（跨度上限天数，含头含尾）、`pointTime`（限制边界相对当天偏移的天数）。
- 超跨度落笔时另一端自动拉到边界（按自然日、含头含尾，两端最大天数差 = span - 1）。
- 未在文档中列出的属性经 `$attrs` 透传给底层 `a-date-picker` / `a-range-picker`。

### FormDatePicker

基于 `a-date-picker` 封装，属性通过 `$attrs` 透传。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 选中值（`props.format` 格式的字符串） | string | `''` |  |
| format | 值格式（回显按显示格式表双语映射） | string | `YYYY-MM-DD HH:mm` |  |
| showTime | 是否展示时间面板：不传则按 format 推导（含 H/h 即时间面板），传了以传入值为准 | boolean \| object | - |  |
| formType | 表单展示类型，`fail` 时展示错误状态样式 | `''` \| `fail` \| `checked` | `''` |  |
| disabledDate | 不可选择的日期（继承自 `a-date-picker`，粘贴同步同样受其约束） | (current: Dayjs) => boolean | - |  |
| placeholder | 选择框默认文字（**固定为 `请选择`**） | string | `请选择` |  |
| disabled | 是否禁用（继承自 `a-date-picker`） | boolean | `false` |  |
| allowClear | 是否显示清除按钮（继承自 `a-date-picker`） | boolean | `true` |  |
| size | 输入框大小（继承自 `a-date-picker`） | `large` \| `middle` \| `small` | - |  |

#### FormDatePicker 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| update:value | 值变化（面板确认、粘贴同步、format 变化重算）时触发 | (value: string) |  |
| change | 面板确认 / 粘贴同步时触发 | (value: string) |  |
| ok | 带时间面板点击「确定」时触发 | (value: string) |  |
| input | 输入框原生输入事件（包装层 `FormUTCDatePicker` 候选值判定依赖） | (e: InputEvent) |  |

#### FormDatePicker 插槽

| 插槽名称          | 说明                           | 版本 |
| ----------------- | ------------------------------ | ---- |
| suffixIcon        | 自定义后缀图标（默认时间图标） |      |
| renderExtraFooter | 面板底部扩展区                 |      |

### FormUTCDatePicker

`FormDatePicker`（外壳）+ 限时窗口层。值与事件契约同 `FormDatePicker`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value(v-model:value) | 选中值（`props.format` 格式的字符串） | string | `''` |  |
| format | 值格式 | string | `YYYY-MM-DD HH:mm` |  |
| showTime | 是否展示时间面板（透传外壳） | boolean \| object | - |  |
| timeLimit | 限时窗口（小时）：口岸时区「此刻」往前 timeLimit 小时内可选；falsy = 不限时 | number | - |  |
| timeZone | 限时窗口使用的时区（如 `UTC+8`） | string | - |  |
| disabledDate | 不可选择的日期（与限时窗口**取并集**生效） | (current: Dayjs) => boolean | - |  |
| disabledTime | 不可选择的时间（时·分·秒列与限时窗口**逐列取并集**） | (current: Dayjs) => object | - |  |

> 候选值（输入框完整文本 ＞ 面板点选值 ＞ 当前值）越界时「确定」按钮灰显不可点。 `@openChange` / `@focus` 等未声明事件经 `$attrs` 直通 antd 原生事件。

### RangePicker

基于 `a-range-picker` 封装，属性通过 `$attrs` 透传。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| start(v-model:start) | 起始值（`props.format` 格式的字符串） | string | - |  |
| end(v-model:end) | 结束值（`props.format` 格式的字符串） | string | - |  |
| format | 值格式 | string | `YYYY-MM-DD` |  |
| span | 跨度上限（天），含头含尾最多可选 span 天，30 为全系统规格；`0` 不限制 | number | `30` |  |
| pointTime | 限制边界相对当天偏移的天数 | number | `0` |  |
| curLimit | 方向限制：`max` 禁未来 / `min` 禁过去 / `no` 不限制 | string | `no` |  |
| disabled | 是否禁用（继承自 `a-range-picker`） | boolean | `false` |  |
| allowClear | 是否显示清除按钮（继承自 `a-range-picker`） | boolean | `true` |  |
| separator | 分隔符（继承自 `a-range-picker`） | string | `~` |  |

#### RangePicker 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| update:start / update:end | 区间两端值变化时触发 | (value: string) |  |
| change | 区间确认时触发（两端格式化字符串数组） | (value: string[]) |  |
| openChange | 面板开合回调 | (open: boolean) |  |
| calendarChange | 面板内落笔回调（候选值，另一端自动修正后） | (values: Dayjs[]) |  |
| focus | 聚焦回调 | (e: FocusEvent) |  |

### FormRangePicker

`RangePicker` 加固定宽度外壳，隐式 `curLimit="max"`（禁未来），其余属性经 `$attrs` 透传给 `RangePicker`。事件同 `RangePicker`。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| start(v-model:start) | 起始值 | string | - |  |
| end(v-model:end) | 结束值 | string | - |  |
| width | 外壳宽度（数字按 px；CSS 表达式透传） | string \| number | `320` |  |
| span | 跨度上限（天），透传 `RangePicker` | number | `30` |  |
| pointTime | 限制边界偏移天数，透传 `RangePicker` | number | `0` |  |
| curLimit | 方向限制（**默认覆盖为 `max`**，传入可覆盖） | string | `max` |  |

### DateTimeRangePicker

触发框复用 `a-range-picker`，面板由 `panelRender` 整体接管（自绘双月 + 日期/时间四格 + 全局确定）。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| start(v-model:start) | 起始值（`props.format` 格式的字符串） | string | - |  |
| end(v-model:end) | 结束值（`props.format` 格式的字符串） | string | - |  |
| format | 值格式（决定输入框展示） | string | `YYYY-MM-DD HH:mm:ss` |  |
| showTime | 时间配置：`false` 选满两侧自动确认；`true` 带时间；对象 `{ format, defaultValue }` 自定义时间列格式与默认时间（单值两端共用或 `[start, end]`，支持 `"HH:mm[:ss]"` 或 Dayjs） | boolean \| object | `true` |  |
| span | 跨度上限（天），`0` 不限制；超限落笔另一端自动拉到边界 | number | `0` |  |
| pointTime | 限制边界相对当天偏移的天数 | number | `0` |  |
| curLimit | 方向限制：`max` 禁未来 / `min` 禁过去 / `no` 不限制 | string | `max` |  |

#### DateTimeRangePicker 事件

| 事件名称                  | 说明                           | 回调参数          | 版本 |
| ------------------------- | ------------------------------ | ----------------- | ---- |
| update:start / update:end | 区间两端值变化时触发           | (value: string)   |      |
| change                    | 区间确认时触发                 | (value: string[]) |      |
| ok                        | 点击「确定」确认完整区间时触发 | (value: string[]) |      |
| openChange                | 面板开合回调                   | (open: boolean)   |      |
| focus                     | 聚焦回调                       | (e: FocusEvent)   |      |

#### DateTimeRangePicker 暴露方法

| 方法    | 说明       | 版本 |
| ------- | ---------- | ---- |
| focus() | 聚焦触发框 |      |

### DatePickerGroup

「下拉 + 单日期」组合。左半区为 `FormSelect`（无边框），右半区为 `FormDatePicker`（无边框），外层容器统一边框与聚焦反馈。`class` / `style` 落在外壳容器，其余属性转发给日期框。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | 下拉选中值 | string \| number \| array | - |  |
| options | 下拉选项数据源（`FormSelect`） | array | `[]` |  |
| dictCode | 字典编码（当前业务组件版本未接入字典服务，暂不生效） | string | `''` |  |
| showSearch | 下拉是否可搜索 | boolean | `false` |  |
| dateValue(v-model:dateValue) | 日期值 | string | - |  |

#### DatePickerGroup 事件

| 事件名称         | 说明           | 回调参数        | 版本 |
| ---------------- | -------------- | --------------- | ---- |
| update:selected  | 下拉选中值变化 | (value)         |      |
| selectChange     | 下拉选中回调   | (value, option) |      |
| update:dateValue | 日期值变化     | (value: string) |      |
| dateChange       | 日期确认回调   | (value: string) |      |

### RangePickerGroup

「下拉 + 日期区间」组合。左半区为 `FormSelect`（无边框），右半区为 `RangePicker`（无边框，隐式 `curLimit="max"`）。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | 下拉选中值（`joinArrayValue` 开启时出口恒为数组） | string \| number \| array | - |  |
| options | 下拉选项数据源 | array | `[]` |  |
| dictCode | 字典编码（当前未接入字典服务，暂不生效） | string | `''` |  |
| showSearch | 下拉是否可搜索 | boolean | `false` |  |
| filterValues | 配合字典使用，仅保留指定 value 的选项（当前暂不生效） | array | `[]` |  |
| joinArrayValue | 开启后下拉选中值以数组为出口契约（逗号串入口兼容） | boolean | `false` |  |
| start(v-model:start) | 起始值 | string | - |  |
| end(v-model:end) | 结束值 | string | - |  |
| span | 跨度上限（天），透传 `RangePicker` | number | `30` |  |
| curLimit | 方向限制（**默认覆盖为 `max`**，传入可覆盖） | string | `max` |  |

#### RangePickerGroup 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| update:selected | 下拉选中值变化（`joinArrayValue` 开启时为数组） | (value) |  |
| changeSelect | 下拉选中回调（同上转换规则） | (value) |  |
| update:start / update:end | 区间两端值变化时触发 | (value: string) |  |
| change | 区间确认时触发 | (value: string[]) |  |
