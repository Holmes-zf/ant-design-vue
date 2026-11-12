---
category: Components
type: 业务
title: Grid
subtitle: 表格配套业务组件
---

表格配套业务组件：覆盖分页统计条、操作列智能折叠、查询/重置按钮、列配置弹窗与动态查询条件栏，与 `vxe-grid`（或任意暴露 `commitProxy` 的表格实例）搭配使用。所有组件不依赖 i18n 服务，文案为简体中文；涉及外部存储/接口的能力均通过 props 注入，由宿主自行持久化。

## 何时使用

- 分页条左侧展示汇总数据（件数、票数等）时，用 `PagerStatistics`。
- 需要横向容器承载工具栏 / 按钮组（固定 8px 间距、可对齐）时，用 `ActionBody`。
- 表格操作列按钮较多、需要折叠进「更多」面板时，用 `GridAction`。
- 表格工具栏需要「查询 / 重置」按钮对，并联动 `grid.commitProxy('_init')` 时，用 `GridQryBtn`。
- 需要让用户自定义表格列的显隐与顺序时，用 `ColumnsConfig`。
- 需要可增删的动态查询条件栏（支持折叠、字段记忆）时，用 `DcGridQryForm`。

## 组件选型

| 组件 | 一句话定位 | 典型场景 |
| --- | --- | --- |
| `PagerStatistics` | 分页统计条（纯展示） | 分页条左侧展示后端下发的汇总数据 |
| `ActionBody` | 横向操作区容器（flex + 8px 间距） | 表格工具栏、弹窗底部按钮组 |
| `GridAction` | 操作列智能折叠 | 行内按钮超 `max` 收进「更多」面板，自动接管二级弹层 |
| `GridQryBtn` | 查询 / 重置按钮对 | 表格工具栏，查询联动 `grid.commitProxy('_init')` |
| `ColumnsConfig` | 列配置弹窗 | 用户自定义列显隐与顺序（勾选 + 拖拽排序） |
| `DcGridQryForm` | 动态查询条件栏 | 可增删的条件 chip、折叠、字段记忆（menuCode 缓存） |

## API

### PagerStatistics

统计项由数据层下发，本组件只做展示。**`name` 直接渲染宿主传入的文本**（原外部实现会做 `$t` 动态翻译，本仓库无 i18n 服务，由宿主传入已翻译文本）。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| statistics | 统计项列表，每项 `{ name?, value?, unit? }`；`name` 缺失时该项降级为「值 单位」 | `{ name?: string; value?: string \| number; unit?: string }[]` | `[]` |  |

### GridAction

行内最多展示 `max` 个按钮，其余收进「更多」悬浮面板；折叠区内 `Popconfirm` / `Popover` / 各类 `Dropdown` 的弹层显隐由组件自动接管对账（弹层未关闭时面板保持展开）。使用约束：显隐一律用 `v-if`（`v-show` 仍占配额）；折叠区弹层不要用外部 `visible` 受控。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| max | 行内直接展示的业务按钮数量上限；空串 / null / 非数值一律回落 3（兼容 `max="2"` 字符串写法） | number \| string | `3` |  |
| moreText | 「更多」入口的可选文字（原实现传 `$t` 结果，本仓库直接传中文文本），为空时只显示图标 | string | `''` |  |
| align | 行内按钮的水平对齐 | `'left' \| 'center' \| 'right'` | `'left'` |  |

#### GridAction 插槽

| 插槽名称 | 说明                                 | 版本 |
| -------- | ------------------------------------ | ---- |
| default  | 同一行的操作按钮，一个动作放一个节点 |      |
| more     | 自定义「更多」入口（只取第一个节点） |      |

### GridQryBtn

「查询 / 重置」按钮对：查询时依次 `emit('beforeQueryCallback')` → 调用 `grid.commitProxy('_init')` → `emit('queryCallback')`；重置仅 `emit('resetCallback')`。原实现的计数刷新副作用已删除，由宿主监听回调自行处理。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| grid | vxe-grid 实例（或含 `commitProxy` 方法的对象），内部以 `isFunction(grid.commitProxy)` 判定后调用 | object | `{}` |  |

#### GridQryBtn 事件

| 事件名称            | 说明         | 回调参数 | 版本 |
| ------------------- | ------------ | -------- | ---- |
| beforeQueryCallback | 查询前置回调 | -        |      |
| queryCallback       | 查询后置回调 | -        |      |
| resetCallback       | 重置回调     | -        |      |

### ColumnsConfig

列配置弹窗：左侧字段勾选（搜索过滤 / 全选 / 半选）+ 右侧已选拖拽排序，确认输出 `{ key, sort, checked }[]`（全量字段，勾选字段按右侧顺序赋 sort）。列唯一键只认 `field`。已选列的持久化完全交给宿主：回显走 `defaultChecked`，保存走 `requestSave` 或 `confirm` 事件。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| columns | 全量列配置（vxe columns），无 `field` 的列自动排除 | array | `[]` |  |
| menuCode | 菜单标识，透传给 `requestSave` | string | `''` |  |
| defaultChecked | 已选字段 key 列表（宿主从自己的存储传入）；非空视为有历史配置（仅勾选其中字段、顺序即 sort），空视为无配置（默认全勾选，按 `visible !== false`） | string[] | `[]` |  |
| requestSave | 可选保存接口 `(menuCode, columns) => Promise`；传入时沿用确认流程（loading → 保存 → `code === 200` 成功提示并关闭 / 否则警告 → emit confirm）；未传时确认直接 `emit('confirm', columns)` 由宿主持久化并关闭 | Function | - |  |

#### ColumnsConfig 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| confirm | 确认完成；未传 `requestSave` 时携带 `columns`（`{ key, sort, checked }[]`），传入 `requestSave` 时无参（同原实现） | - 或 columns |  |

### DcGridQryForm

动态查询条件栏：从 `formConfig.items` 生成可增删的条件 chip（内置 `$select` / `$input` 渲染器，或具名插槽），支持折叠、`fixedFields` 固定排序（start 恒排最前 / end 恒排最后）、按 `menuCode` 记忆选中字段。`mode="grid"` 时查询联动 `grid.commitProxy('_init')`；`mode="standalone"` 时不关联表格，查询由外部监听 `queryCallback` 自行处理。条件缓存放独立内嵌，缓存读写以 try/catch 降级。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| formConfig | 直接传 `gridOptions.formConfig`，内部取 `items` 作为字段列表（`field` / `title` / `itemRender` / `slots.default` / `className` / `contentClassName` / `contentStyle` 均支持） | object | `{ items: [] }` |  |
| queryParams | 查询参数对象（重置时按初始快照原地还原） | object | `{}` |  |
| grid | vxe-grid 实例（或含 `commitProxy` / `getProxyInfo` 的对象），`mode="grid"` 时使用 | object | `{}` |  |
| menuCode | 菜单标识，用于 localStorage 条件缓存（key：`busi-grid-cond-${menuCode}`），不传则不缓存 | string | `''` |  |
| defaultSelectedFields | 默认选中字段列表（缓存未命中时回退使用） | string[] | `[]` |  |
| dynamicFields | 动态注入字段：自动加入选中且不写入缓存 | string[] | `[]` |  |
| showAddBtn | 是否显示「添加条件」按钮 | boolean | `true` |  |
| mode | 模式 | `'grid' \| 'standalone'` | `'grid'` |  |
| fixedFields | 固定排序 `{ start: string[], end: string[] }` | object | `{ start: [], end: [] }` |  |

#### DcGridQryForm 事件

| 事件名称 | 说明 | 回调参数 | 版本 |
| --- | --- | --- | --- |
| update:queryParams | `v-model:queryParams`（重置场景为原地还原，不触发本事件） | - |  |
| beforeQueryCallback | 查询前置回调 | - |  |
| queryCallback | 查询后置回调 | - |  |
| resetCallback | 重置回调 | - |  |
| removeField | 移除条件字段 | field |  |

#### DcGridQryForm 插槽

| 插槽名称 | 说明 | 版本 |
| --- | --- | --- |
| item.slots.default 或 item.field | 未配置内置渲染器的字段走具名插槽，作用域 `{ data, field }`（`data` 即内部表单对象） |  |

### ActionBody

基于 Flex 的横向操作区容器（原独立类别 `table` 已并入本组件群）：子项间距固定 8px、不换行，`align` 控制对齐。容器本身不处理背景与边框，可直接置于表格工具条、卡片操作区等场景。

| 参数  | 说明                                       | 类型   | 默认值 | 版本 |
| ----- | ------------------------------------------ | ------ | ------ | ---- |
| align | 内容对齐方式，可选 `left` `center` `right` | string | `left` |      |

#### ActionBody 插槽

| 插槽名称 | 说明                                        | 版本 |
| -------- | ------------------------------------------- | ---- |
| default  | 操作项内容，任意子节点（通常为 `a-button`） |      |
