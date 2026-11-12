---
category: Components
type: Busi
title: RichTextEditor
---

A rich text editor wrapped around `wangeditor`: the toolbar and editor are loaded on demand, menus are trimmed by capability switches, and the value of `v-model:value` is always editor-fragment HTML with empty content normalized to `''`.

## When To Use

- Scenarios that need WYSIWYG rich text input (announcements, email bodies, detail descriptions, etc.).
- When rendering a full HTML document returned by the backend (`<!DOCTYPE html>…<head>…<body>…`) and normalizing it into an editor-safe fragment.

## Note

> Requires `@wangeditor/editor`, `@wangeditor/editor-for-vue` (and `@wangeditor/plugin-upload-attachment` for attachments). Make sure they are installed.

## API

### Props

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| value | Editor content (`v-model:value`): editor-fragment HTML, empty content is `''`; a full HTML document is normalized into a fragment and written back | string | `''` |  |
| toolbarConfig | Toolbar config: snapshot at creation time, later changes have no effect | object | `{}` |  |
| editorConfig | Editor config: snapshot at creation time; `MENU_CONF` is merged by key with built-in entries, upload config is never wholly overridden | object | `{}` |  |
| imgProps | Extra params for image upload (effective when `hasImage` is true); under the injection mode the host uses them inside its own `customUpload` closure | object | `{}` |  |
| fileProps | Extra params for attachment upload (effective when `hasUpload` is true); under the injection mode the host uses them inside its own `customUpload` closure | object | `{}` |  |
| hasUpload | Attachment switch: shows the "upload attachment" menu in the toolbar | boolean | `false` |  |
| hasImage | Image switch: shows the "image" menu group in the toolbar | boolean | `false` |  |
| height | Content height: number is treated as px, strings with units pass through | number \| string | `300` |  |
| disabled | Read-only display: hides the toolbar and disables editing (only restricts interaction; value writing rules stay the same as the normal state) | boolean | `false` |  |
| customUpload | Injected upload implementation, shared by image and attachment menus; when not injected nothing is uploaded (`editorConfig` carries no `customUpload`, so the upload entries are unavailable) | (file, insertFn) =&gt; Promise&lt;void&gt; | - |  |

> `insertFn` contract: image menu is `insertFn(url, alt, href)`; attachment menu is `insertFn(fileName, link)`.

### Expose

| Method    | Description                                     | Type         | Version |
| --------- | ----------------------------------------------- | ------------ | ------- |
| getText() | Get plain text content                          | () => string |         |
| getHtml() | Get current editor HTML (empty content is `''`) | () => string |         |
| focus()   | Focus the editor                                | () => void   |         |
| clear()   | Clear content                                   | () => void   |         |

### Events

| Event | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:value | Emitted on content change (the only value outlet); empty content is always `''` | (html: string) |  |

### Value Contract

> The value is editor-fragment HTML and empty content is always `''` (not a `<p><br></p>` placeholder); emptiness is decided by the library's `isEmpty()` (exactly one empty paragraph), so content that only contains images/tables/dividers is not empty. A full HTML document is normalized into a fragment automatically (`<body>` content is kept, `<script>/<style>` etc. are dropped, consecutive inline nodes are wrapped into `<p>` split by `<br>`); fragment input is idempotent and kept as-is, so backend responses can be fed to `v-model` directly.

### customUpload Injection

> The component ships no built-in upload API: the host injects `(file, insertFn) => Promise` via `customUpload` (covering the API call, success criteria, error toast and `insertFn` insertion), shared by image and attachment menus. When not injected, nothing is uploaded — `editorConfig` carries no `customUpload` and the corresponding upload entries are unavailable. `imgProps` / `fileProps` are no longer consumed by the component and are kept only as part of the contract, for the host to use inside its own `customUpload` closure.
