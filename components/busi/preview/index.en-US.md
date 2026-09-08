---
category: Components
type: Busi
title: Preview
subtitle: Multi-format Preview
cover: https://gw.alipayobjects.com/zos/antfincdn/D1dXz9PZqa/image.svg
---

A multi-format file preview family: `PreviewModal` dispatches files and handles multi-file paging, while six format previewers (`PDFPreview`, `ImgPreview`, `ExcelPreview`, `WordPreview`, `TextPreview`, `EmptyPreview`) render specific formats, all sharing a file title bar and a download/print toolbar.

## When To Use

- When you need to preview pdf, images, excel/csv, doc/docx or text files directly in the browser.
- When you need to preview multiple files at once with prev/next paging.
- When you need a unified download/print toolbar.

## API

### PreviewModal

Wraps `a-modal`, props are passed through via `$attrs`.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| previewList | Files to preview, see [PreviewItem](#previewitem) | array | `[]` |  |
| tools | Toolbar capabilities, `print` / `download`; the rendered tools are the intersection of `tools` and what each format supports | string[] | `['download']` |  |
| percentage | Scroll position percentage (0 ~ 1) of the document height after the PDF first renders, for resume-reading; applies once on mount | number | `0` |  |
| visible(v-model) | Whether the dialog is visible (passed to `a-modal`) | boolean | `false` |  |
| title | Title (**fixed to `预览`**) | string \| slot | `预览` |  |
| width | Width (**fixed to `80vw`**) | string \| number | `80vw` |  |
| maskClosable | Whether to close modal dialog on mask click (**fixed to `false`**) | boolean | `false` |  |
| afterClose | Callback when Modal is completely closed (inherited from `a-modal`) | function | - |  |
| bodyStyle | Body style (inherited from `a-modal`) | object | `{}` |  |
| centered | Vertically centered (inherited from `a-modal`) | boolean | `false` |  |
| closable | Whether a close button is visible (inherited from `a-modal`) | boolean | `true` |  |
| closeIcon | Custom close icon (inherited from `a-modal`) | VNode \| slot | - |  |
| destroyOnClose | Whether to unmount child components on close (inherited from `a-modal`) | boolean | `false` |  |
| dialogClass | Dialog wrapper class name (inherited from `a-modal`) | string | - |  |
| dialogStyle | Dialog wrapper style (inherited from `a-modal`) | object | - |  |
| forceRender | Force render Modal (inherited from `a-modal`) | boolean | `false` |  |
| getContainer | HTML node where Modal is mounted (inherited from `a-modal`) | (instance): HTMLElement | `() => document.body` |  |
| mask | Whether show mask (inherited from `a-modal`) | boolean | `true` |  |
| maskStyle | Mask style (inherited from `a-modal`) | object | - |  |
| wrapClassName | Class name of the container of the dialog (inherited from `a-modal`) | string | - |  |
| zIndex | The `z-index` of Modal (inherited from `a-modal`) | number | `1000` |  |

### PreviewModal Events

| Events Name    | Description                        | Arguments          | Version |
| -------------- | ---------------------------------- | ------------------ | ------- |
| update:visible | Called when the visibility changes | (visible: boolean) |         |
| closeCallback  | Called when the modal closes       | -                  |         |

### PreviewModal Slots

| Slot      | Description                                          | Version |
| --------- | ---------------------------------------------------- | ------- |
| default   | Extra content of the modal body                      |         |
| fileTitle | Custom file title (scope: `item`)                    |         |
| footer    | Custom footer (overrides the default paging buttons) |         |
| footerExt | Extended footer buttons (scope: `previewState`)      |         |

### PreviewModal Exposed

| Method           | Description                                              | Version |
| ---------------- | -------------------------------------------------------- | ------- |
| state            | Internal preview state (`previewList`, `activeId`, etc.) |         |
| handlePage(type) | Switch to prev/next file, `type` is `prev` or `next`     |         |

### PreviewItem

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| name | File name, used for display and download | string | - |  |
| type | File type/extension, decides which previewer to use | string | - |  |
| url | File URL | string | - |  |
| fileName | Storage key, file stream is fetched by it | string | - |  |
| blob | File stream held by the caller, used when neither `url` nor `fileName` is provided | Blob | - |  |
| renameFile | File alias, used for display and download when set | string | - |  |

> Preview items are open structures, extra fields (e.g. `storagePlatformType`) are allowed.

### Format Previewers

The six previewers can be used standalone (provide a fixed-height container yourself). Shared API:

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| info | File info, see [PreviewItem](#previewitem) | object | `{}` |  |
| source | Preview source: URL / fileName / Blob | string \| Blob | `''` |  |
| tools | Toolbar capabilities | string[] | `['download']` |  |
| percentage | `PDFPreview` only: scroll position percentage (0 ~ 1) when opened | number | `0` |  |

Slot: `fileTitle` (custom file title). Event: `closeCallback`.

#### Toolbar Capability Matrix

Rendered tools = `tools` ∩ format capabilities:

| Previewer    | print | download |
| ------------ | ----- | -------- |
| PDFPreview   | ✓     | ✓        |
| ImgPreview   | ✓     | ✓        |
| ExcelPreview | -     | ✓        |
| WordPreview  | -     | ✓        |
| TextPreview  | -     | ✓        |
| EmptyPreview | -     | ✓        |

#### Supported Formats

| Format | Previewer |
| --- | --- |
| pdf | PDFPreview |
| png / jpg / jpeg | ImgPreview |
| xls / xlsx / xlsm / xlsb / xla / xlw / csv | ExcelPreview |
| doc / docx | WordPreview |
| txt / lrc / md / json / yaml / yml / xml / js / ts / tsx / vue / html / css / py / go / rs / sql / sh | TextPreview |
| others | EmptyPreview (fallback, download only) |

> `docx` is rendered in the browser; `doc` relies on a server-side conversion to docx in the origin system, currently only the original file is fetched for preview.

> Only files with `type` `json` are automatically re-indented; plain text such as `txt` is shown as-is, pass the correct `type` at the call site for formatted display.
