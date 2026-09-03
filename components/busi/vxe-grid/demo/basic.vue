<docs>
---
order: 0
title:
  zh-CN: 基础表格
  en-US: Basic Table
---

## zh-CN

通过 `setGridOpts('props')` 组合通用默认配置（列宽拖拽、虚拟滚动、自动排序等），静态数据直接传 `data`。所有 vxe-grid 属性均可透传，如 `stripe`、`showOverflow`；双击单元格默认复制文本。

## en-US

Compose shared default configs via `setGridOpts('props')` (resizable columns, virtual scrolling, auto sorting, etc.), and pass static data directly with `data`. All vxe-grid props can be passed through, e.g. `stripe`, `showOverflow`. Double click a cell to copy its text by default.

</docs>
<template>
  <div style="height: 400px">
    <DcVxeGrid v-bind="gridOptions" v-on="gridEvents" />
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import DcVxeGrid, { useTable, setGridOpts } from '../index';

const dataSource = Array.from({ length: 60 }, (_, i) => ({
  rowId: String(i + 1),
  name: `用户 ${i + 1}`,
  phone: `1380000${String(i).padStart(4, '0')}`,
  city: ['杭州', '上海', '北京', '深圳'][i % 4],
  createTime: `2025-0${(i % 8) + 1}-1${i % 10} 1${i % 10}:30:00`,
}));

const columns = [
  { type: 'seq', title: '序号', width: 60 },
  { type: 'checkbox', title: '', width: 50 },
  { field: 'name', title: '姓名' },
  { field: 'phone', title: '手机号' },
  { field: 'city', title: '城市' },
  { field: 'createTime', title: '创建时间' },
];

export default defineComponent({
  components: { DcVxeGrid },
  setup() {
    // 注册 vxe-table 模块（重复调用安全）
    const instance = getCurrentInstance();
    useTable(instance?.appContext.app);

    // 组合通用默认配置，透传属性 stripe 会覆盖默认值
    const gridOptions = setGridOpts('props', {
      id: 'dcVxeGridBasicDemo',
      columns,
      data: dataSource,
      stripe: true,
    });
    const gridEvents = setGridOpts('events', {});
    return { gridOptions, gridEvents };
  },
});
</script>
