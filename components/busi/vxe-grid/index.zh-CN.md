---
category: Components
type: 业务
title: DcVxeGrid
subtitle: 高性能业务表格
cover: https://gw.alipayobjects.com/zos/alicdn/5rWLU27so/Grid.svg
---

业务表格组件，基于 `vxe-grid` 封装。所有属性、事件、插槽均透传给 `vxe-grid`，并内置了业务默认配置组合、空数据展示、单元格/表头双击复制、列宽缓存等独立方法。

依赖 `vxe-table@4.5.19` 与 `xe-utils`，需与业务系统使用的版本保持一致。

## 何时使用

- 需要大数据量、虚拟滚动、列宽拖拽、区域选择复制等增强表格能力时。
- 需要与业务系统表格行为保持一致时。

## 初始化

使用前需在应用入口注册 vxe-table 模块（内置全局默认参数）：

```ts
import { createApp } from 'vue';
import { useTable } from 'ant-design-vue/busi/vxe-grid';

const app = createApp(App);
useTable(app); // 注册 Header/Filter/Edit/Keyboard/Grid/Pager 等全部模块（内置中文语言包）
app.mount('#app');
```

## API

### DcVxeGrid

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| gridTheme | 表格主题类名，追加在 `.grid-wrap` 上，可选 `grid--default` `grid--modal` | string | `grid--default` |  |

### 以下属性透传自 vxe-grid（推荐配合 `setGridOpts('props', {...})` 使用）

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| id | 表格唯一标识，用于列宽缓存（必填才能缓存） | string | `''` |  |
| columns | 列配置 | any[] | - |  |
| data | 静态数据（与 proxyConfig 二选一） | any[] | - |  |
| height | 表格高度，**默认 `auto`**（需父容器有高度） | string \| number | `'auto'` |  |
| size | 尺寸，**默认 `medium`**（全局 setup 固定） | string | `'medium'` |  |
| border | 边框，**默认 `border`** | string \| boolean | `'border'` |  |
| stripe | 斑马纹，**默认 `false`** | boolean | `false` |  |
| showHeaderOverflow | 表头内容溢出隐藏，**默认 `true`** | boolean \| string | `true` |  |
| showOverflow | 表体内容溢出隐藏，**默认 `true`** | boolean \| string | `true` |  |
| keepSource | 保持原始数据，**默认 `true`** | boolean | `true` |  |
| loading | 表格加载中 | boolean | `false` |  |
| proxyConfig | 数据代理配置（查询/分页/表单联动） | object | - |  |
| pagerConfig | 分页配置，**默认右对齐、pageSize 50、页码选项 20/50/100/200/500** | object | - |  |
| formConfig | 查询表单配置，**默认垂直布局**（全局 setup 固定） | object | - |  |
| toolbarConfig | 工具栏配置 | object | - |  |
| rowConfig | 行配置，**默认 `useKey: true`、`isHover: true`、`keyField: 'rowId'`** | object | - |  |
| columnConfig | 列配置，**默认 `useKey: true`、`resizable: true`** | object | - |  |
| sortConfig | 排序配置，**默认本地自动排序**（数字/时间/字符串感知排序，见 `columnsSort`） | object | - |  |
| checkboxConfig | 复选框配置，**默认 `reserve: true`、`highlight: true`、`range: true`** | object | - |  |
| editConfig | 编辑配置，**默认点击触发、行编辑、显示状态** | object | - |  |
| scrollX / scrollY | 虚拟滚动配置，**默认 `gt: 20` 超过 20 条启用** | object | - |  |
| mouseConfig | 鼠标配置（`area: true` 时启用区域选择，需 area 插件） | object | - |  |
| areaConfig | 区域选择配置 | object | - |  |
| keyboardConfig | 键盘配置（`isClip: true` 时支持 Ctrl+C 复制选区） | object | - |  |

> 以上「**默认 xxx**」为 `setGridOpts('props', opts)` 组合的通用默认值（`gridComOptions`），显式传入会覆盖默认值。完整属性参考 [vxe-grid 官方文档](https://vxetable.cn/v4/#/grid/api)。

### 事件

以下事件透传自 vxe-grid，推荐配合 `setGridOpts('events', {...})` 使用，部分已有业务默认行为（显式传入会覆盖）：

| 事件名 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| cellDblclick | 双击单元格，**默认复制单元格文本** | `{ cell, column, row, ... }` |  |
| headerCellDblclick | 双击表头，**默认复制整列数据** | `{ column, $grid, ... }` |  |
| keydown | 键盘事件，**默认回车触发查询**（分页器内回车除外） | `{ event, key, $grid, ... }` |  |
| resizableChange | 列宽调整结束，**默认缓存列宽**（需配置 `id`） | `{ $grid, column, ... }` |  |
| formCollapse | 查询表单折叠 | `{ $grid, ... }` |  |
| proxyQuery | 代理查询完成 | `{ $grid, ... }` |  |
| zoom | 表格缩放 | `{ $grid, ... }` |  |
| 其余事件 | 全部透传给 vxe-grid，如 `checkboxChange` `cellClick` 等 | - |  |

### 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| empty | 空数据内容，**默认展示简版 Empty（`a-empty` SIMPLE 图）** |  |
| pagerLeft | 分页左侧内容，**默认为空**（用于分页统计等） |  |
| 其余插槽 | 全部透传给 vxe-grid，如列 `slots.default`、`toolbar` 等 |  |

### Ref 方法

通过 `ref` 获取组件实例，实际 grid 实例暴露在 `ref.grid`：

| 方法 | 说明 | 版本 |
| --- | --- | --- |
| grid | vxe-grid 组件实例，可调用其全部方法（`commitProxy`、`getTableData`、`getColumns`、`loadData`、`refreshColumn` 等） |  |

```ts
const gridRef = ref();
gridRef.value.grid.commitProxy('_init'); // 触发查询
```

### 独立方法

| 方法 | 说明 | 类型 | 版本 |
| --- | --- | --- | --- |
| useTable(app) | 注册 vxe-table 全部模块（含全局默认参数、中文语言包、区域选择插件），重复调用安全 | `(app: App) => App` |  |
| setGridOpts(type, opts) | 组合通用配置：`props` / `events` / `busi` | `(type, opts) => object` |  |
| updateQueryParams(queryParams, obj) | 更新查询参数，仅保留 obj 中存在的键 | `(queryParams, obj) => void` |  |
| updateColumns(menuCode, columns) | 更新列配置（列宽修复 + 默认 formatter） | `(menuCode, columns) => any[]` |  |
| columnsSort(data, sortList, columns) | 本地自动排序（数字/时间/字符串感知排序，空值置底） | `(data, sortList, columns) => any[]` |  |
| storageColumns($grid, id) | 缓存列宽 | `($grid, id) => void` |  |
| repairColumnWidth(menuCode, item) | 恢复缓存列宽 | `(menuCode, item) => object` |  |
| copyTextToClipboard(text, opts) | 复制文本到剪贴板 | `(text, opts) => boolean` |  |
