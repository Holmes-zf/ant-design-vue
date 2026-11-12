---
category: Components
type: Busi
title: Upload
cover: https://gw.alipayobjects.com/zos/antfincdn/gPafCfmTDN/upload.svg
---

An import & upload suite: `ImportButton` picks files without really uploading (files are handed to the caller in batches), `FormUpload` is the upload zone with a file list, and `FormFileItem` is one row in that list (type icon / file name / tool icons, with built-in preview).

## When To Use

- Parsing business data (e.g. Excel) in the frontend while only needing the selected files (`ImportButton`).
- Uploading files to a server and showing the uploaded list (`FormUpload`).
- Customizing file row content or tools (delete / download / preview) (`FormFileItem`, standalone or via `FormUpload` slots).

## Component Selection

| Component | Role | Typical Scenario |
| --- | --- | --- |
| `ImportButton` | Triggers file picking, intercepts real upload via `customRequest`, batches files in a microtask | Frontend-parsed imports (Excel etc.) |
| `FormUpload` | Upload zone + file list (a-upload, list-type=text) | Attachment upload and backfill display |
| `FormFileItem` | One file row: type icon + file name + delete/download/preview tools | Default item of `FormUpload`, or standalone |

## API

### ImportButton

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| uploadType | Extension whitelist, comma separated (`.xls` equals `xls`); empty string skips format check | string | `''` |  |
| minWidth | Min width of the default trigger button | number | `100` |  |
| maxSize | Per-file size limit (MB); `0` means no size check | string \| number | `0` |  |
| beforeSelect | Business gate: called per file, returning falsy silently drops the file | (file: File) => boolean | `() => true` |  |

#### ImportButton Events

| Event      | Description                                  | Arguments       | Version |
| ---------- | -------------------------------------------- | --------------- | ------- |
| selectFile | Called per accepted file                     | (file: File)    |         |
| select     | Called once per batch (one pick = one batch) | (files: File[]) |         |

#### ImportButton Slots

| Slot Name | Description                                                         | Version |
| --------- | ------------------------------------------------------------------- | ------- |
| content   | Replaces the default button entirely (`minWidth` no longer applies) |         |
| default   | Button text, default "导入数据"                                     |         |

> Other attributes (`accept`, `disabled`, ...) fall through to the inner `a-upload` via `$attrs`.

### FormUpload

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| maxSize | Per-file size limit (MB) | string \| number | `'10'` |  |
| maxCount | Max file count; `1` means replace-mode (keep the last one, no block, no toast) | number | `10` |  |
| fileList (v-model) | File list | UploadFileItem[] | `[]` |  |
| uploadType | Extension whitelist, comma separated; empty string skips format check | string | `''` |  |
| fileItemProps | Centralized config for the FormFileItem child: `{ tools, onCustomDownloads, ... }` | object | `{}` |  |
| btnText | Upload button text, default "导入数据（支持拖拽）" | string | `''` |  |
| beforeSelect | Business gate: returning falsy blocks the file before built-in checks | (file: File) => boolean | `() => true` |  |
| isListIgnore | Whether rejected files are kept out of the list (antd LIST_IGNORE) | boolean | `true` |  |

> Other attributes (`action`, `headers`, `accept`, `disabled`, ...) fall through to the inner `a-upload`; the `Token` (cookie `tenant_token`) / `lang` / `timezone` headers are built by the component and refreshed before every upload.

#### FormUpload Events

| Event | Description | Arguments | Version |
| --- | --- | --- | --- |
| update:fileList | List changed (normalized upload / removal / backfill) | (fileList: UploadFileItem[]) |  |
| success | Upload succeeded; supports both `result==1` and `code:200` response shapes | (data, { options }) |  |
| delete | An item was removed | (removed) |  |
| beforeUpload | Called after per-file validation passed | (file) |  |
| finish | Batch finished (success or failure) | (fileList: UploadFileItem[]) |  |

#### FormUpload Slots

| Slot Name | Description | Version |
| --- | --- | --- |
| text | Replaces the upload zone hint (icon + text) |  |
| tips | Replaces the size hint line |  |
| itemRender | Takes over the whole list item (container + upload feedback); scope: `file` / `fileList` / `fileProps` |  |
| fileItem | Replaces item content only (container and spinner kept by the component); scope: `file` / `fileProps` |  |

### FormFileItem

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| file | File object (**required**); display name = first non-empty of `name → originalFileName → fileName` | FileItem | - |  |
| formType | `'fail'` renders the failure state (red border and text) | `'' \| 'fail' \| 'checked'` | `''` |  |
| tools | Tool set = render order; values `delete` / `download` / `preview` | FileTool[] | `['delete', 'download']` |  |
| onCustomDownloads | Custom download: when provided, the parent takes over downloading | (file: FileItem) => void | - |  |

#### FormFileItem Events

| Event  | Description         | Arguments        | Version |
| ------ | ------------------- | ---------------- | ------- |
| delete | Delete tool clicked | (file: FileItem) |         |

> Preview uses the built-in `PreviewModal` (requires the local `busi/preview` suite); the preview source is passed as `url` or `fileName + storagePlatformType`.
