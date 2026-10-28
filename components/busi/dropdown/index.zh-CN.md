---
category: Components
type: 业务
title: Dropdown
subtitle: 下拉菜单
cover: https://gw.alipayobjects.com/zos/alicdn/eedWN59yJ/Dropdown.svg
---

基于 Ant Design [Dropdown](/components/dropdown/) 的业务下拉菜单。组件本身只做**插槽转发**：不声明任何自有属性与事件，`trigger` / `placement` / `v-model:visible` / `@visibleChange` 等一律由根节点自动继承透传给 `a-dropdown`；`default`（触发元素）与 `overlay`（菜单内容）插槽原样转发。

## 何时使用

- 一组操作需要收纳在触发元素下方展开时（如「更多」按钮）。
- 菜单由 `a-menu` 组织，需要 hover / click / 右键触发切换时。
- 需要「主按钮 + 下拉箭头」的 `Dropdown.Button` 形态时，请直接使用 `a-dropdown-button`（本组件不代理按钮形态）。

## API

属性与事件继承自 `a-dropdown`（本组件不新增任何自有属性），常用项如下：

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| trigger | 触发下拉的行为（移动端不支持 `hover`） | Array&lt;`click` \| `hover` \| `contextmenu`&gt; | `['hover']` |  |
| placement | 菜单弹出位置 | `bottomLeft` \| `bottom` \| `bottomRight` \| `topLeft` \| `top` \| `topRight` | `bottomLeft` |  |
| visible(v-model:visible) | 菜单是否显示 | boolean | - |  |
| overlay(v-slot) | 菜单内容，通常为 `a-menu` | [Menu](/components/menu/) | - |  |
| overlayClassName | 下拉根元素的类名 | string | - |  |
| overlayStyle | 下拉根元素的样式 | object | - |  |
| disabled | 菜单是否禁用 | boolean | - |  |
| destroyPopupOnHide | 关闭后是否销毁下拉 | boolean | `false` |  |
| getPopupContainer | 菜单渲染父节点，默认渲染到 body；滚动定位异常时改为滚动区域 | Function(triggerNode) | `() => document.body` |  |

### 事件

| 事件名称      | 说明                                                 | 回调参数          | 版本 |
| ------------- | ---------------------------------------------------- | ----------------- | ---- |
| visibleChange | 菜单显示状态改变时回调（点击菜单项导致的关闭不触发） | function(visible) |      |

### 插槽

| 插槽名称 | 说明                      | 版本 |
| -------- | ------------------------- | ---- |
| default  | 触发元素（`a-button` 等） |      |
| overlay  | 菜单内容（`a-menu`）      |      |

> 菜单项写在 `a-menu` 里，`a-menu-item` 必须设置唯一 `key`；Dropdown 下的 Menu 默认不可选中，需要选中态时给 `a-menu` 加 `selectable`。
