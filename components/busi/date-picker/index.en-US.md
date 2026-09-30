---
category: Components
type: Business
title: DatePicker
subtitle: Date & Time Family
cover: https://gw.alipayobjects.com/zos/alicdn/sfuBfXbDZh/DatePicker.svg
---

Business date & time component family: single-value and range inputs for dates and datetimes. All seven components share a string value contract (string in / string out), a unified range-limit semantics (`curLimit` direction + `span` limit + `pointTime` offset) and a unified visual spec (primary-color focus border, no glow).

## When To Use

- To input a single date or datetime (`FormDatePicker` / `FormUTCDatePicker`).
- To input a date or datetime range with controllable span and future dates disallowed (`RangePicker` / `FormRangePicker` / `DateTimeRangePicker`).
- To combine a dimension select with time input, e.g. warehouse + month (`DatePickerGroup` / `RangePickerGroup`).

## Component Selection

| Component | Value shape | Typical use case | Notes |
| --- | --- | --- | --- |
| `FormDatePicker` | `v-model:value` (string) | Single date/datetime | Shell base of the whole family, with `fail` state and paste sync |
| `FormUTCDatePicker` | `v-model:value` (string) | Time-zone limited window | Shell + time window: disabled cells/columns + disabled OK when out of window |
| `RangePicker` | `v-model:start` / `v-model:end` (string) | Date range | Span graying + auto-correction of the other side |
| `FormRangePicker` | `v-model:start` / `v-model:end` (string) | Date range in forms | `RangePicker` with fixed-width shell (future disallowed by default) |
| `DateTimeRangePicker` | `v-model:start` / `v-model:end` (string) | Datetime range | Custom dual-month panel + date/time tabs + global OK |
| `DatePickerGroup` | `v-model:selected` + `v-model:dateValue` | Dimension + single date | Select (`FormSelect`) on the left + date picker on the right |
| `RangePickerGroup` | `v-model:selected` + `v-model:start` / `v-model:end` | Dimension + date range | Select (`FormSelect`) on the left + range picker on the right |

> Wrapper components implicitly set `curLimit="max"` (future disallowed); `RangePicker` defaults to `no`. The default `span` of 30 days (inclusive, max 30 days) is a system-wide requirement; pass `0` to lift it.

## API

Common conventions (applies to the whole family):

- The value channel always uses `props.format` strings; the display channel follows the locale format table (`YYYY-MM-DD` ↔ `MM-DD-YYYY` etc.).
- Range limits: `curLimit` (`max` disallow future / `min` disallow past / `no` unlimited), `span` (max days, inclusive), `pointTime` (days offset from today).
- When a selection exceeds the span, the other side is automatically clamped to the boundary (natural days, inclusive; max day diff = span - 1).
- Props not listed are passed through to the underlying `a-date-picker` / `a-range-picker` via `$attrs`.

### FormDatePicker

Wrapped from `a-date-picker`; extra props are passed through via `$attrs`.

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Selected value (string in `props.format`) | string | `''` |  |
| format | Value format (display follows the locale format table) | string | `YYYY-MM-DD HH:mm` |  |
| showTime | Show time panel: derived from format when omitted (contains H/h), explicit value wins | boolean \| object | - |  |
| formType | Form display type; `fail` shows error state | `''` \| `fail` \| `checked` | `''` |  |
| disabledDate | Disabled dates (inherited from `a-date-picker`, also applied to paste sync) | (current: Dayjs) => boolean | - |  |
| placeholder | Placeholder (**fixed to `请选择`**) | string | `请选择` |  |
| disabled | Disabled (inherited from `a-date-picker`) | boolean | `false` |  |
| allowClear | Show clear button (inherited from `a-date-picker`) | boolean | `true` |  |
| size | Input size (inherited from `a-date-picker`) | `large` \| `middle` \| `small` | - |  |

#### FormDatePicker Events

| Event | Description | Callback | Version |
| --- | --- | --- | --- |
| update:value | Fired on value change (panel confirm, paste sync, format change) | (value: string) |  |
| change | Fired on panel confirm / paste sync | (value: string) |  |
| ok | Fired when OK is clicked in the time panel | (value: string) |  |
| input | Native input event of the textbox (used by `FormUTCDatePicker` candidate tracking) | (e: InputEvent) |  |

#### FormDatePicker Slots

| Slot              | Description                            | Version |
| ----------------- | -------------------------------------- | ------- |
| suffixIcon        | Custom suffix icon (default time icon) |         |
| renderExtraFooter | Extra footer of the panel              |         |

### FormUTCDatePicker

`FormDatePicker` (shell) + limited time window layer. Value/event contract is the same as `FormDatePicker`.

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Selected value (string in `props.format`) | string | `''` |  |
| format | Value format | string | `YYYY-MM-DD HH:mm` |  |
| showTime | Show time panel (passed to the shell) | boolean \| object | - |  |
| timeLimit | Time window in hours: only times within `timeLimit` hours before "now" in the port time zone are selectable; falsy = unlimited | number | - |  |
| timeZone | Time zone of the window (e.g. `UTC+8`) | string | - |  |
| disabledDate | Disabled dates (merged with the window by OR) | (current: Dayjs) => boolean | - |  |
| disabledTime | Disabled times (hour/minute/second columns merged per column) | (current: Dayjs) => object | - |  |

> When a candidate value (complete textbox text > last panel pick > current value) is out of the window, the OK button is disabled.

### RangePicker

Wrapped from `a-range-picker`; extra props are passed through via `$attrs`.

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| start(v-model:start) | Start value (string in `props.format`) | string | - |  |
| end(v-model:end) | End value (string in `props.format`) | string | - |  |
| format | Value format | string | `YYYY-MM-DD` |  |
| span | Span limit in days (inclusive); 30 is the system-wide spec; `0` = unlimited | number | `30` |  |
| pointTime | Days offset of the limit boundary from today | number | `0` |  |
| curLimit | Direction limit: `max` disallow future / `min` disallow past / `no` unlimited | string | `no` |  |
| disabled | Disabled (inherited from `a-range-picker`) | boolean | `false` |  |
| allowClear | Show clear button (inherited from `a-range-picker`) | boolean | `true` |  |
| separator | Separator (inherited from `a-range-picker`) | string | `~` |  |

#### RangePicker Events

| Event | Description | Callback | Version |
| --- | --- | --- | --- |
| update:start / update:end | Fired when either side changes | (value: string) |  |
| change | Fired on range confirm (array of formatted strings) | (value: string[]) |  |
| openChange | Panel open/close callback | (open: boolean) |  |
| calendarChange | Fired on in-panel pick (candidate values, after auto-correction) | (values: Dayjs[]) |  |
| focus | Focus callback | (e: FocusEvent) |  |

### FormRangePicker

`RangePicker` with a fixed-width shell; implicitly sets `curLimit="max"`. Other props are passed through to `RangePicker` via `$attrs`. Events are the same as `RangePicker`.

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| start(v-model:start) | Start value | string | - |  |
| end(v-model:end) | End value | string | - |  |
| width | Shell width (numbers as px; CSS expressions passed through) | string \| number | `320` |  |
| span | Span limit in days (passed to `RangePicker`) | number | `30` |  |
| pointTime | Boundary offset days (passed to `RangePicker`) | number | `0` |  |
| curLimit | Direction limit (**default overridden to `max`**, can be overridden) | string | `max` |  |

### DateTimeRangePicker

The trigger box reuses `a-range-picker`; the panel is fully taken over by `panelRender` (custom dual-month + date/time tabs + global OK).

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| start(v-model:start) | Start value (string in `props.format`) | string | - |  |
| end(v-model:end) | End value (string in `props.format`) | string | - |  |
| format | Value format (decides the textbox display) | string | `YYYY-MM-DD HH:mm:ss` |  |
| showTime | Time config: `false` auto-confirms when both sides are picked; `true` with time; object `{ format, defaultValue }` customizes the time column format and default times (single value shared or `[start, end]`, `"HH:mm[:ss]"` or Dayjs) | boolean \| object | `true` |  |
| span | Span limit in days, `0` = unlimited; the other side is auto-clamped when exceeded | number | `0` |  |
| pointTime | Days offset of the limit boundary from today | number | `0` |  |
| curLimit | Direction limit: `max` / `min` / `no` | string | `max` |  |

#### DateTimeRangePicker Events

| Event | Description | Callback | Version |
| --- | --- | --- | --- |
| update:start / update:end | Fired when either side changes | (value: string) |  |
| change | Fired on range confirm | (value: string[]) |  |
| ok | Fired when OK confirms a complete range | (value: string[]) |  |
| openChange | Panel open/close callback | (open: boolean) |  |
| focus | Focus callback | (e: FocusEvent) |  |

#### DateTimeRangePicker Methods

| Method  | Description           | Version |
| ------- | --------------------- | ------- |
| focus() | Focus the trigger box |         |

### DatePickerGroup

"Select + single date" combo. The left half is `FormSelect` (borderless), the right half is `FormDatePicker` (borderless); the outer container owns the border and focus feedback. `class` / `style` land on the shell, other props go to the date picker.

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | Selected value of the select | string \| number \| array | - |  |
| options | Data source of the select (`FormSelect`) | array | `[]` |  |
| dictCode | Dict code (dict service not wired in this business build, no effect yet) | string | `''` |  |
| showSearch | Whether the select is searchable | boolean | `false` |  |
| dateValue(v-model:dateValue) | Date value | string | - |  |

#### DatePickerGroup Events

| Event            | Description            | Callback        | Version |
| ---------------- | ---------------------- | --------------- | ------- |
| update:selected  | Select value change    | (value)         |         |
| selectChange     | Select change callback | (value, option) |         |
| update:dateValue | Date value change      | (value: string) |         |
| dateChange       | Date confirm callback  | (value: string) |         |

### RangePickerGroup

"Select + date range" combo. The left half is `FormSelect` (borderless), the right half is `RangePicker` (borderless, implicit `curLimit="max"`).

| Prop | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | Selected value of the select (array when `joinArrayValue` is on) | string \| number \| array | - |  |
| options | Data source of the select | array | `[]` |  |
| dictCode | Dict code (no effect yet) | string | `''` |  |
| showSearch | Whether the select is searchable | boolean | `false` |  |
| filterValues | Keep only given values with dict (no effect yet) | array | `[]` |  |
| joinArrayValue | When on, the select value contract is an array (comma string accepted as input) | boolean | `false` |  |
| start(v-model:start) | Start value | string | - |  |
| end(v-model:end) | End value | string | - |  |
| span | Span limit in days (passed to `RangePicker`) | number | `30` |  |
| curLimit | Direction limit (**default overridden to `max`**, can be overridden) | string | `max` |  |

#### RangePickerGroup Events

| Event | Description | Callback | Version |
| --- | --- | --- | --- |
| update:selected | Select value change (array when `joinArrayValue` is on) | (value) |  |
| changeSelect | Select change callback (same conversion) | (value) |  |
| update:start / update:end | Fired when either side changes | (value: string) |  |
| change | Fired on range confirm | (value: string[]) |  |
