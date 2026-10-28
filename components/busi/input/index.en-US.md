---
category: Components
type: Busi
title: Input
cover: https://gw.alipayobjects.com/zos/alicdn/xS9YEJhfe/Input.svg
---

A business input family around text entry: `FormInput` (single-line input with trim-on-blur and an error state), `FormTextarea` (pass-through wrapper of the multi-line textarea), `SelectMultiInput` (select on the left, text on the right, plus a batch entry), `SelectTextarea` (select on the left, multi-line text on the right) and `MultiInputModal` (batch entry dialog that normalizes text into an array of items). All five share the same look contract: focus uses the primary color without antd's halo, the error state is owned by the outer form item or by the container, and the normal border stays with antd.

## When To Use

- A form needs single-line text input that trims leading and trailing spaces on blur (`FormInput`).
- You need multi-line text, a character counter, or just a consistent radius and focus ring (`FormTextarea`).
- A query condition needs a "dimension + value" pair and several values at once (`SelectMultiInput`).
- A query condition needs a "dimension + multi-line values" pair for large amounts of values (`SelectTextarea`).
- You need to enter and review a large batch of values in a dialog (`MultiInputModal`, already built into the batch entry of `SelectMultiInput`).

## Component Selection

| Component | Value shape | Item semantics | Typical usage |
| --- | --- | --- | --- |
| `FormInput` | `v-model:value` (string) | Single value | Regular form input |
| `FormTextarea` | `v-model:value` (string, passed via `$attrs`) | Single value (multi-line) | Remarks, descriptions |
| `SelectMultiInput` | `v-model:selected` + `v-model:value` | Multiple items (split by `separators`, written back joined with commas) | Batch order / code queries |
| `SelectTextarea` | `v-model:selected` + `v-model:value` | Multiple items (counted with the built-in rule, cleared when over the limit) | Large batch order queries |
| `MultiInputModal` | `v-model:visible` + `confirm(items)` | Multiple items (one per line) | Batch entry |

## API

Conventions for the whole family:

- **"Text" and "items" are two layers**: `value` is always the raw string; the item array only exists as an intermediate form for splitting, limit checking and batch back-fill, and is never exposed.
- **Separator rule**: the built-in rule is newline / whitespace / plus sign / comma / semicolon (both half-width and full-width). A custom rule **must match newlines**, because folding replaces separators with newlines — a rule without newlines cannot split the folded text back.
- **Over-limit handling**: exceeding `limitCount` shows a warning and **clears** the current value (local validation uses `warning`; the red `error` is reserved for API failures).
- **Three visual states**: for `SelectMultiInput` / `SelectTextarea` the outer frame, focus (`:focus-within`) and error (`.ant-form-item-has-error`) are owned by the container, and inner children always use `bordered=false`; do not add borders back to children — that would suppress both the focus feedback and the error frame.
- **`dictCode`**: the current business build has no dictionary service connected, so `options` is the source of truth (same as `FormSelect`).

### FormInput

Built on `a-input`; props not listed below are passed through via `$attrs`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | The input content | string | `''` |  |
| trim | Whether to trim leading and trailing spaces on blur | boolean | `true` |  |
| placeholder | Placeholder (defaults to `请输入`) | string | `''` |  |
| formType | Form display type | `''` \| `fail` | `''` |  |
| isAutoComplete | Whether to enable autocomplete (`false` makes it read-only until the mouse enters) | boolean | `true` |  |
| addonAfter | Labeled input, sets the trailing label | string \| slot |  |  |
| addonBefore | Labeled input, sets the leading label | string \| slot |  |  |
| allowClear | Allow clearing the content with a clear icon | boolean |  |  |
| bordered | Whether to show the border | boolean | true |  |
| defaultValue | Default content | string |  |  |
| disabled | Disabled state | boolean | false |  |
| id | The input id | string |  |  |
| maxlength | Maximum length | number |  |  |
| prefix | Input with a prefix icon | string \| slot |  |  |
| showCount | Whether to show the character count | boolean | false |  |
| size | Control size; inside a standard form it is limited to `large`. Options: `large` `default` `small` | string | `default` |  |
| suffix | Input with a suffix icon | string \| slot |  |  |
| type | Native input type (use `<a-textarea />` instead of `type="textarea"`) | string | `text` |  |

#### FormInput Events

| Event        | Description                      | Arguments       | Version |
| ------------ | -------------------------------- | --------------- | ------- |
| change       | Fired when the content changes   | function(e)     |         |
| blur         | Fired when the input loses focus | function(e)     |         |
| update:value | Fired when the content changes   | (value: string) |         |

#### FormInput Slots

| Slot   | Description              | Version |
| ------ | ------------------------ | ------- |
| prefix | Prefix icon of the input |         |
| suffix | Suffix icon of the input |         |

> `value` is two-way bound through `v-model:value`; every other prop is passed down to `a-input` via `v-bind="$attrs"`.

### FormTextarea

A pass-through wrapper of `a-textarea`. It **does not declare a `value` prop** (declaring it would cut the pass-through chain and break two-way binding); props not listed below reach `a-textarea` via `$attrs`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value(v-model:value) | Text content (passed via `$attrs`, not a declared prop) | string | - |  |
| placeholder | Placeholder (defaults to `请输入`) | string | `''` |  |
| allowClear | Allow clearing the content (**on by default**, pass `false` to override) | boolean | `true` |  |
| autoSize | Auto height, optionally `{ minRows, maxRows }` (inherited from `a-textarea`) | boolean \| object | `false` |  |
| showCount | Whether to show the character count (inherited from `a-textarea`) | boolean | `false` |  |
| rows | Number of rows (inherited from `a-textarea`) | number | - |  |
| maxlength | Maximum length (inherited from `a-textarea`) | number | - |  |

> The `form-textarea` class is the stable anchor for style overrides and is used by `SelectTextarea` for layout — do not rename it.

### SelectMultiInput

A three-in-one "select + text + batch entry" control for "dimension + multiple values" query conditions. The container owns the frame / focus / error states; `class` / `style` go to the container and the remaining attributes go to the input.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | Selected value of the left select | string \| number | - |  |
| value(v-model:value) | Raw text (multiple items joined with `,`) | string | - |  |
| options | Options of the left select (rendered only with ≥2 items; a single item degrades into an input prefix label) | Array&lt;{ label, value, disabled }&gt; | `[]` |  |
| dictCode | Dictionary code (no dictionary service in this build, `options` wins) | string | `''` |  |
| isShowModal | Whether to show the batch entry (one item per line in the dialog, back-filled on confirm) | boolean | `false` |  |
| limitCount | Item limit; exceeding it shows a warning and clears the value | number | `1000` |  |
| separators | Splitting rule: omit for the built-in rule, pass a rule to customize (e.g. `/[\n]+/` splits by newline only), pass `false` to keep the raw text unsplit | RegExp \| string \| string[] \| `false` | built-in rule |  |
| isShowLabel | Whether to use the single option's `label` as the input prefix | boolean | `true` |  |
| validateList | Field names that should trigger validation of the surrounding `a-form-item` immediately | `('selected' \| 'value')[]` | `[]` |  |
| placeholder / disabled / maxlength … | Remaining attributes are passed to the input | - | - |  |

#### SelectMultiInput Events

| Event | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:selected | Selected value changed | (value: string \| number) |  |
| changeSelect | Fired on select | (value: string \| number) |  |
| update:value | Text changed (typing, pasting, batch back-fill) | (value: string) |  |
| changeInput | Fired on typing | (value: string) |  |

> Known trait: while `separators` applies, a separator typed at the very end is normalized away (`a,` → `a`) and the next keystroke continues that character. This is the price of "write back first, then emit"; use the batch dialog for multi-value entry.
>
> An `a-form-item` cannot provide `label[for]` for two controls; pass `validateList` explicitly when instant validation is required.

### SelectTextarea

A "select + multi-line text" composite; its height comes from `rows` of the textarea (the select stretches along). The container owns the frame / focus / error states as well.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| selected(v-model:selected) | Selected value of the left select | string \| number | - |  |
| value(v-model:value) | Raw multi-line text | string | - |  |
| options | Options of the left select (rendered only with ≥2 items) | Array&lt;{ label, value, disabled }&gt; | `[]` |  |
| dictCode | Dictionary code (no dictionary service in this build, `options` wins) | string | `''` |  |
| placeholder | Placeholder | string | `多个内容请用换行、空格或逗号分隔` |  |
| rows | Number of rows (the height source; do not set an inline `height` instead) | number | `2` |  |
| limitCount | Item limit; exceeding it shows a warning and clears the value | number | `50` |  |
| showCount | Show "items / limit"; passing an object treats it as a custom `formatter` | boolean \| object | - |  |
| disabled / maxlength / @keydown … | Remaining attributes are passed to the textarea | - | - |  |

#### SelectTextarea Events

| Event           | Description                    | Arguments                 | Version |
| --------------- | ------------------------------ | ------------------------- | ------- |
| update:selected | Selected value changed         | (value: string \| number) |         |
| changeSelect    | Fired on select                | (value: string \| number) |         |
| update:value    | Text changed (typing, pasting) | (value: string)           |         |
| changeInput     | Fired on typing                | (value: string)           |         |

> `showCount` counts **items** (the number of segments after splitting with the built-in rule), not characters.

### MultiInputModal

The batch entry dialog: the shell reuses this library's `Modal` (mask, rounded buttons, visibility semantics and prop pass-through), while this component only handles "one item per line" folding and separator normalization.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| visible(v-model:visible) | Whether the dialog is visible | boolean | `false` |  |
| value | Initial text loaded on open (an initial value only, not a `v-model`; the draft is cleared on close) | string | - |  |
| separators | Folding and splitting rule (built-in when omitted; a custom rule **must match newlines**) | RegExp \| string \| string[] | built-in rule |  |
| title | Title (**defaults to `批量录入`**, overridable) | string | `批量录入` |  |
| width | Width (**defaults to `600`**, overridable) | string \| number | `600` |  |
| centered | Vertically centered (**defaults to `true`**, overridable) | boolean | `true` |  |
| maskClosable | Whether clicking the mask closes the dialog (**defaults to `true`**, overridable) | boolean | `true` |  |
| Other props | Passed through to `Modal` via `$attrs` | - | - |  |

#### MultiInputModal Events

| Event | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:visible | Visibility changed (confirm / cancel / close icon all use this signal) | (visible: boolean) |  |
| confirm | Clicked OK; returns the deduplicated item array | (items: string[]) |  |

> Typing folds separators into newlines while keeping the caret in place (editing an item in the middle does not move it); IME composition periods are handled naturally, so Chinese input works normally.
