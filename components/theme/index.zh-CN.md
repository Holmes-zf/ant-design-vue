---
category: Components
type: 主题
title: Theme
subtitle: 主题变量
cover: https://gw.alipayobjects.com/zos/alicdn/kegYxl1wj/ConfigProvider.svg
---

主题变量色板展示（源自 kats-tenement 业务系统 `src/style` 主题体系）。以 CSS 变量 `var(--xxx)` 为唯一引用形态，覆盖品牌色、功能色、扩展状态色、中性色、背景色、表格与标签、边框与分隔、排版、上传/滚动条/节点告警以及 vxe-table 等全部色板。

变量定义由各主题 `themes/{light,dark}/vars.less` 提供（`:root` 字面量全集，唯一数据源），运行时切换主题即全站生效。

## 何时使用

- 需要查阅/复用 kats-tenement 主题色板时，以「全部主题变量」demo 为速查手册。
- 需要在业务样式中引用主题颜色时，统一使用 `var(--xxx)`，勿直接写色值。
- 需要新增颜色变量时，遵循「各主题 vars.less 登记字面量 → 引用处 var()」两步约定。

## 使用说明

「全部主题变量」demo 内置亮色 / 暗色两套变量值，右上角可切换主题，所有色块以 `var(--xxx)` 实时渲染并跟随切换。点击任意色块可复制变量名。

## 变量一览

颜色类变量两主题通用（dark 不重写时即快照自 light）；以下为亮色（light）默认值，`dark 值` 列标注「同」表示与 light 一致。

### 品牌色

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--primary-color` | `#0032a0` | `#1668dc` | 全局主色（antd `@primary-color`） |
| `--dark-primary-color` | `#49bac9` | 同 | antd dark 主题官方变量名（预留兼容） |
| `--primary-color-light` | `#a0d9e2` | `#124f9e` | 浅色主色 |
| `--link-color` | `#0032a0` | `#1668dc` | 链接色（与主色同值） |

### 功能色（状态语义）

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--success-color` | `#52c41a` | 同 | 成功色 |
| `--warning-color` | `#faad14` | 同 | 警告色 |
| `--error-color` | `#f6530f` | 同 | 错误色（表单报错/告警） |
| `--danger-color` | `#f5222d` | 同 | 危险色（删除/高危操作） |

### 扩展状态色

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--purple-color` | `#722ed1` | 同 | 紫色（status-dot 等通用状态标识） |
| `--cyan-color` | `#13c2c2` | 同 | 青色 |
| `--blue-color` | `#1890ff` | 同 | 蓝色 |
| `--gray-color` | `#999` | 同 | 灰色 |

### 中性色

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--text-color` | `rgba(0, 0, 0, 0.65)` | `rgba(255, 255, 255, 0.85)` | 主文本色 |
| `--text-color-secondary` | `rgba(0, 0, 0, 0.45)` | `rgba(255, 255, 255, 0.45)` | 次文本色 |
| `--heading-color` | `rgba(0, 0, 0, 0.85)` | `rgba(255, 255, 255, 0.85)` | 标题色 |
| `--disabled-color` | `#999999` | `rgba(255, 255, 255, 0.3)` | 失效文字色 |
| `--text-color-deep` | `#122d41` | `rgba(255, 255, 255, 0.9)` | 深色正文 |

### 背景色

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--bg-color-white` | `#fff` | `#1f1f1f` | 通用白色背景（卡片/表格/弹窗） |
| `--busi-bg-color` | `#f0f0f7` | `#161616` | 业务区底色 |
| `--select-bg-color` | `#f5f7fa` | `#262626` | 选中/悬浮背景色 |
| `--modal-mask-bg` | `rgba(0, 13, 22, 0.72)` | `rgba(0, 0, 0, 0.6)` | 弹窗遮罩背景色 |
| `--page-bg` | `#f2f4f8` | `#141414` | 页面背景（body 锚点） |
| `--disabled-bg-color` | `#eceeed` | `rgba(255, 255, 255, 0.08)` | 禁用态背景 |
| `--layout-mini-btn-color` | `#999` | `rgba(255, 255, 255, 0.45)` | 布局迷你按钮图标色 |

### 表格与标签

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--table-header-bg` | `#f5f6f7` | `#1f1f1f` | 表头背景 |
| `--table-header-color` | `#132043` | `rgba(255, 255, 255, 0.65)` | 表头文字 |
| `--table-expand-row-bg` | `#f2feff` | `#1b1f2b` | 展开行表头背景 |
| `--des-label-bg` | `#f0f7fc` | `#1a2430` | 详情标签底色 |
| `--order-tag-bg` | `#eb8730` | 同 | 平台标签底色 |

### 边框与分隔

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--border-color-base` | `#f0f0f0` | `#424242` | 组件默认边框 |
| `--border-color-line` | `#d9d9d9` | `#303030` | 线条边框 |
| `--divider-color` | `#eeeeee` | `#303030` | 分隔线 |
| `--border-radius-base` | `4px` | 同 | 组件/浮层圆角（尺寸类） |
| `--box-shadow-base` | `0 2px 8px rgba(0, 0, 0, 0.15)` | 同 | 浮层阴影（尺寸类） |

### 排版

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--font-size-base` | `14px` | 同 | 主字号（尺寸类） |

### 上传 / 滚动条 / 节点告警

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--upload-tip-color` | `#9ba7af` | `rgba(255, 255, 255, 0.35)` | 上传提示文字 |
| `--scrollbar-bg` | `#f1f1f1` | `#1f1f1f` | 滚动条轨道 |
| `--scrollbar-thumb-bg` | `#c9c9c9` | `#595959` | 滚动条滑块 |
| `--node-alert-error-color` | `#ff0000` | 同 | 节点告警-错误 |
| `--node-alert-success-color` | `#3d97eb` | 同 | 节点告警-成功 |
| `--node-alert-gray-color` | `#c0c4cc` | 同 | 节点告警-灰色 |

### vxe-table

| 变量 | light 值 | dark 值 | 说明 |
| --- | --- | --- | --- |
| `--vxe-btn-hover-color` | `#0032a0` | `#1668dc` | 按钮 hover 色（与主色同值） |
| `--vxe-sort-btn-color` | `#c0c4cc` | `rgba(255, 255, 255, 0.35)` | 排序箭头默认色 |
| `--vxe-table-border-color` | `#e8eaec` | `#303030` | 单元格边框色 |
| `--air-cell-bg` | `#fffff0` | `#3a3a26` | 空运单元格底色 |
| `--box-cell-bg` | `#f8fff8` | `#1f3322` | 箱单单元格底色 |
| `--pack-cell-bg` | `#fff7f1` | `#3a2f26` | 拼箱单元格底色 |
| `--vxe-font-color` | `#132043` | `rgba(255, 255, 255, 0.85)` | vxe 正文色（SCSS 桥接） |
| `--vxe-success-color` | `#3fac46` | 同 | vxe 成功色 |
| `--vxe-info-color` | `#909399` | 同 | vxe 信息色 |
| `--vxe-danger-color` | `#df443b` | 同 | vxe 危险色 |
| `--vxe-striped-bg` | `#f5f5f5` | `rgba(255, 255, 255, 0.03)` | 斑马纹背景 |
