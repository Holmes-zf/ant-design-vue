---
category: Components
type: 业务
title: RichTextEditor
subtitle: 富文本编辑器
---

基于 `wangeditor` 封装的富文本编辑器：工具栏与编辑器异步按需加载、按能力开关裁剪菜单，`v-model:value` 的值始终是「编辑器片段」HTML，空内容统一表达为 `''`。

## 何时使用

- 需要所见即所得富文本输入的场景（公告、邮件正文、详情描述等）。
- 需要展示后端返回的整封 HTML 文档（`<!DOCTYPE html>…<head>…<body>…`）并自动收敛为编辑器可存片段时。

## 注意

> 依赖 `@wangeditor/editor`、`@wangeditor/editor-for-vue`（附件上传还需 `@wangeditor/plugin-upload-attachment`），使用前需确保已安装。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value | 编辑器内容（`v-model:value`）：「编辑器片段」HTML，空内容为 `''`；整封 HTML 文档会自动归一为片段并回写 | string | `''` |  |
| toolbarConfig | 工具栏配置：创建期快照，创建后再改不生效 | object | `{}` |  |
| editorConfig | 编辑器配置：创建期快照；`MENU_CONF` 按 key 与内置项合并，不会整块顶掉上传配置 | object | `{}` |  |
| imgProps | 图片上传的额外参数（`hasImage` 为 true 时生效）；注入模式下由宿主在 `customUpload` 闭包内自行取用 | object | `{}` |  |
| fileProps | 附件上传的额外参数（`hasUpload` 为 true 时生效）；注入模式下由宿主在 `customUpload` 闭包内自行取用 | object | `{}` |  |
| hasUpload | 附件能力开关：工具栏出现「上传附件」菜单 | boolean | `false` |  |
| hasImage | 图片能力开关：工具栏出现「图片」菜单组 | boolean | `false` |  |
| height | 内容区高度：数字按 px，字符串带单位的原样透传 | number \| string | `300` |  |
| disabled | 只读展示：隐藏工具栏且不可编辑（只限制交互，值的写入/回写与正常态一致） | boolean | `false` |  |
| customUpload | 上传实现注入：图片与附件菜单共用；未注入时不上传（`editorConfig` 不带 `customUpload`，对应菜单上传入口不可用） | (file, insertFn) =&gt; Promise&lt;void&gt; | - |  |

> `insertFn` 契约：图片菜单为 `insertFn(url, alt, href)`，附件菜单为 `insertFn(fileName, link)`。

### Expose

| 方法      | 说明                               | 类型         | 版本 |
| --------- | ---------------------------------- | ------------ | ---- |
| getText() | 取纯文本内容                       | () => string |      |
| getHtml() | 取当前编辑器 HTML（空内容为 `''`） | () => string |      |
| focus()   | 聚焦编辑器                         | () => void   |      |
| clear()   | 清空内容                           | () => void   |      |

### 事件

| 事件         | 说明                                            | 回调参数       | 版本 |
| ------------ | ----------------------------------------------- | -------------- | ---- |
| update:value | 内容变化时上抛（唯一值出口），空内容一律为 `''` | (html: string) |      |

### 值契约

> 值是「编辑器片段」HTML，空内容统一表达为 `''`（不是 `<p><br></p>` 占位段落）；是否为空以库的 `isEmpty()` 为准（只有一个空段落），只有图片/表格/分隔线的正文不算空。后端返回的整封 HTML 文档会自动归一为片段（取 `<body>` 内容、丢弃 `<script>/<style>` 等、连续内联节点按 `<br>` 分段包进 `<p>`），片段入参幂等原样保留，可直接丢给 `v-model`。

### customUpload 注入约定

> 组件不内置上传接口：宿主通过 `customUpload` 注入 `(file, insertFn) => Promise` 的上传实现（含接口调用、成功判据、错误提示与 `insertFn` 回填），图片与附件菜单共用同一实现；未注入时不上传，`editorConfig` 不带 `customUpload`，对应菜单的上传入口自然不可用。`imgProps` / `fileProps` 不再被组件消费，仅作为契约保留，供宿主在自己的 `customUpload` 闭包内取用。
