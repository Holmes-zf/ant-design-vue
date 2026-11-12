---
category: Components
type: 业务
title: Upload
subtitle: 上传
cover: https://gw.alipayobjects.com/zos/antfincdn/gPafCfmTDN/upload.svg
---

导入与上传三件套：`ImportButton` 只选文件不真实上传（选中后整批交给业务）、`FormUpload` 上传区 + 文件列表、`FormFileItem` 上传列表中的单条文件行（类型图标 / 文件名 / 工具图标，可内置预览）。

## 何时使用

- 导入 Excel 等业务数据，只需要拿到用户选中的文件、由前端自行解析时（`ImportButton`）。
- 需要把文件上传到服务器并展示已上传列表时（`FormUpload`）。
- 需要自定义文件条目内容或工具（删除、下载、预览）时（`FormFileItem`，可单独使用或经 `FormUpload` 插槽接管）。

## 组件选型

| 组件 | 角色 | 典型场景 |
| --- | --- | --- |
| `ImportButton` | 触发文件选择，`customRequest` 拦截真实上传，微任务收口成批次回调 | Excel 导入等前端解析场景 |
| `FormUpload` | 上传区 + 文件列表（a-upload，list-type=text） | 附件上传、已传列表回填展示 |
| `FormFileItem` | 单条文件行：类型图标 + 文件名 + delete/download/preview 工具 | `FormUpload` 默认条目，也可单独一行使用 |

## API

### ImportButton

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| uploadType | 扩展名白名单，逗号分隔（`.xls` 与 `xls` 等价）；空串不校验格式 | string | `''` |  |
| minWidth | 默认按钮形态下触发按钮的最小宽度 | number | `100` |  |
| maxSize | 单文件大小上限（MB），`0` 表示不校验大小 | string \| number | `0` |  |
| beforeSelect | 业务前置闸门：逐文件调用，返回 falsy 即静默丢弃（组件不提示） | (file: File) => boolean | `() => true` |  |

#### ImportButton 事件

| 事件       | 说明                                    | 回调参数        | 版本 |
| ---------- | --------------------------------------- | --------------- | ---- |
| selectFile | 每个合规文件逐个回调                    | (file: File)    |      |
| select     | 一批文件整体回调（一次拾取 = 一个批次） | (files: File[]) |      |

#### ImportButton 插槽

| 插槽名称 | 说明                                       | 版本 |
| -------- | ------------------------------------------ | ---- |
| content  | 整体替换默认按钮（此时 `minWidth` 不生效） |      |
| default  | 按钮文字，默认「导入数据」                 |      |

> 其余属性（`accept`、`disabled` 等）经 `$attrs` 透传给内部 `a-upload`。

### FormUpload

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| maxSize | 单文件大小上限（MB） | string \| number | `'10'` |  |
| maxCount | 最大上传个数；`1` 为替换式（只保留最后一个，不拦不提示） | number | `10` |  |
| fileList (v-model) | 文件列表 | UploadFileItem[] | `[]` |  |
| uploadType | 扩展名白名单，逗号分隔（`.xls` 与 `xls` 等价）；空串不校验格式 | string | `''` |  |
| fileItemProps | 子件 FormFileItem 的配置集中入口：`{ tools, onCustomDownloads, ... }` | object | `{}` |  |
| btnText | 上传按钮文字，默认「导入数据（支持拖拽）」 | string | `''` |  |
| beforeSelect | 业务前置闸门：返回 falsy 即拦截，优先于格式/大小/数量校验 | (file: File) => boolean | `() => true` |  |
| isListIgnore | 校验不通过时文件是否不进列表（返回 antd 的 LIST_IGNORE） | boolean | `true` |  |

> 其余属性（`action`、`headers`、`accept`、`disabled` 等）经 `$attrs` 透传给内部 `a-upload`；请求头中的 `Token`（取 cookie `tenant_token`）/ `lang` / `timezone` 由组件自建并在每次上传前刷新。

#### FormUpload 事件

| 事件 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| update:fileList | 列表变化（上传归一 / 删除 / 回填） | (fileList: UploadFileItem[]) |  |
| success | 上传成功；兼容 `result==1` 与 `code:200` 两种响应口径 | (data, { options }) |  |
| delete | 删除条目 | (removed) |  |
| beforeUpload | 单文件校验通过后回调 | (file) |  |
| finish | 本批上传收尾（成功或失败） | (fileList: UploadFileItem[]) |  |

#### FormUpload 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| text | 替换上传区提示文字（图标 + 文案） |  |
| tips | 替换大小提示行 |  |
| itemRender | 整条接管列表项（含容器与上传反馈），作用域：`file` / `fileList` / `fileProps` |  |
| fileItem | 只换条目内容（容器与转圈由组件兜住），作用域：`file` / `fileProps` |  |

### FormFileItem

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| file | 文件对象（**必传**）；展示名按 `name → originalFileName → fileName` 取第一个有值 | FileItem | - |  |
| formType | `'fail'` 时行显示失败态（红框红字） | `'' \| 'fail' \| 'checked'` | `''` |  |
| tools | 工具集合 = 渲染顺序，取值 `delete` / `download` / `preview` | FileTool[] | `['delete', 'download']` |  |
| onCustomDownloads | 自定义下载：父级传入回调即由父级接管下载 | (file: FileItem) => void | - |  |

#### FormFileItem 事件

| 事件   | 说明         | 回调参数         | 版本 |
| ------ | ------------ | ---------------- | ---- |
| delete | 点击删除工具 | (file: FileItem) |      |

> 预览内置 `PreviewModal`（需本地引入 `busi/preview` 组件体系），预览源按 `url` / `fileName + storagePlatformType` 交给弹框。
