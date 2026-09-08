---
category: Components
type: 业务
title: Preview
subtitle: 多格式预览
cover: https://gw.alipayobjects.com/zos/antfincdn/D1dXz9PZqa/image.svg
---

多格式文件预览组件群：预览弹框 `PreviewModal` 负责文件分发与多文件翻页，六个格式预览器 `PDFPreview`、`ImgPreview`、`ExcelPreview`、`WordPreview`、`TextPreview`、`EmptyPreview` 负责具体格式的渲染，并统一提供文件标题栏与下载/打印工具栏。

## 何时使用

- 需要在浏览器内直接预览 pdf、图片、excel/csv、doc/docx、文本类文件时。
- 需要一次预览多个文件，并支持上一份/下一份切换时。
- 需要统一的下载/打印工具栏时。

## API

### PreviewModal

基于 `a-modal` 封装，属性通过 `$attrs` 透传。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| previewList | 预览文件列表，项结构见 [PreviewItem](#previewitem) | array | `[]` |  |
| tools | 工具栏能力声明，可选 `print`、`download`，实际渲染为各格式支持能力的交集 | string[] | `['download']` |  |
| percentage | PDF 打开时滚动定位的百分比（0 ~ 1） | number | `0` |  |
| visible(v-model) | 对话框是否可见（透传 `a-modal`） | boolean | `false` |  |
| title | 标题（**固定为 `预览`**） | string \| slot | `预览` |  |
| width | 宽度（**固定为 `80vw`**） | string \| number | `80vw` |  |
| maskClosable | 点击蒙层是否允许关闭（**固定为 `false`**） | boolean | `false` |  |
| afterClose | Modal 完全关闭后的回调（继承自 `a-modal`） | function | 无 |  |
| bodyStyle | Modal body 样式（继承自 `a-modal`） | object | `{}` |  |
| centered | 垂直居中展示（继承自 `a-modal`） | boolean | `false` |  |
| closable | 是否显示右上角的关闭按钮（继承自 `a-modal`） | boolean | `true` |  |
| closeIcon | 自定义关闭图标（继承自 `a-modal`） | VNode \| slot | - |  |
| destroyOnClose | 关闭时销毁 Modal 里的子元素（继承自 `a-modal`） | boolean | `false` |  |
| dialogClass | 可用于设置浮层的类名（继承自 `a-modal`） | string | - |  |
| dialogStyle | 可用于设置浮层的样式（继承自 `a-modal`） | object | - |  |
| forceRender | 强制渲染 Modal（继承自 `a-modal`） | boolean | `false` |  |
| getContainer | 指定 Modal 挂载的 HTML 节点（继承自 `a-modal`） | (instance): HTMLElement | `() => document.body` |  |
| mask | 是否展示遮罩（继承自 `a-modal`） | boolean | `true` |  |
| maskStyle | 遮罩样式（继承自 `a-modal`） | object | - |  |
| wrapClassName | 对话框外层容器的类名（继承自 `a-modal`） | string | - |  |
| zIndex | 设置 Modal 的 `z-index`（继承自 `a-modal`） | number | `1000` |  |

### PreviewModal 事件

| 事件名称       | 说明                     | 回调参数           | 版本 |
| -------------- | ------------------------ | ------------------ | ---- |
| update:visible | 对话框可见性变化时的回调 | (visible: boolean) |      |
| closeCallback  | 弹框关闭时的回调         | -                  |      |

### PreviewModal 插槽

| 插槽名称  | 说明                                                  | 版本 |
| --------- | ----------------------------------------------------- | ---- |
| default   | 弹框主体附加内容                                      |      |
| fileTitle | 自定义文件标题（作用域：`item` 预览项）               |      |
| footer    | 自定义底部内容（覆盖默认翻页按钮）                    |      |
| footerExt | 底部扩展按钮区（作用域：`previewState` 预览内部状态） |      |

### PreviewModal 暴露方法

| 方法             | 说明                                         | 版本 |
| ---------------- | -------------------------------------------- | ---- |
| state            | 预览内部状态（`previewList`、`activeId` 等） |      |
| handlePage(type) | 切换上/下一份，`type` 为 `prev` 或 `next`    |      |

### PreviewItem

| 参数       | 说明                                                | 类型   | 默认值 | 版本 |
| ---------- | --------------------------------------------------- | ------ | ------ | ---- |
| name       | 文件名，用于显示与下载                              | string | -      |      |
| type       | 文件类型/扩展名，决定使用哪个预览器                 | string | -      |      |
| url        | 文件外链地址                                        | string | -      |      |
| fileName   | 存储 key，按此拉取文件流                            | string | -      |      |
| blob       | 调用方已持有的文件流，`url`/`fileName` 均未传时使用 | Blob   | -      |      |
| renameFile | 文件别名，配置后按别名显示与下载                    | string | -      |      |

> 预览项为开放结构，允许携带扩展字段（如 `storagePlatformType`）。

### 格式预览器

六个预览器可单独使用（需自行提供固定高度的容器），共享以下 API：

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| info | 文件信息，结构见 [PreviewItem](#previewitem) | object | `{}` |  |
| source | 预览源，支持 URL / fileName / Blob | string \| Blob | `''` |  |
| tools | 工具栏能力声明 | string[] | `['download']` |  |
| percentage | 仅 `PDFPreview`：打开时滚动定位的百分比（0 ~ 1） | number | `0` |  |

插槽：`fileTitle`（自定义文件标题）。事件：`closeCallback`（关闭回调）。

#### 工具栏能力矩阵

实际渲染的工具为 `tools` 与该格式支持能力的交集：

| 预览器       | print | download |
| ------------ | ----- | -------- |
| PDFPreview   | ✓     | ✓        |
| ImgPreview   | ✓     | ✓        |
| ExcelPreview | -     | ✓        |
| WordPreview  | -     | ✓        |
| TextPreview  | -     | ✓        |
| EmptyPreview | -     | ✓        |

#### 支持格式

| 格式 | 预览器 |
| --- | --- |
| pdf | PDFPreview |
| png / jpg / jpeg | ImgPreview |
| xls / xlsx / xlsm / xlsb / xla / xlw / csv | ExcelPreview |
| doc / docx | WordPreview |
| txt / lrc / md / json / yaml / yml / xml / js / ts / tsx / vue / html / css / py / go / rs / sql / sh | TextPreview |
| 其他 | EmptyPreview（兜底，仅支持下载） |

> `docx` 由前端渲染；`doc` 原系统依赖服务端转换为 docx 后预览，当前仅支持直接拉取原文预览。

> 仅 `type` 为 `json` 的文件会自动格式化缩进；`txt` 等纯文本按原文展示，如需换行展示请在调用方传入正确的 `type`。
