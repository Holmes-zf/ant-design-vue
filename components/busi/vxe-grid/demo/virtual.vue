<docs>
---
order: 2
title:
  zh-CN: 虚拟表格
  en-US: Virtual Table
---

## zh-CN

通过 `scrollY` / `scrollX` 开启虚拟滚动（通用默认配置中 `gt: 20`，超过 20 条自动启用），5000 条数据仅渲染可视区行，滚动流畅；表头排序使用默认的本地自动排序（数字/时间/字符串感知排序，空值置底）。

## en-US

Enable virtual scrolling via `scrollY` / `scrollX` (shared default `gt: 20`, auto enabled over 20 rows). With 5000 rows only the visible area renders, scrolling stays smooth. Header sorting uses the default local auto sort (number/time/string aware, empties at bottom).

</docs>
<template>
  <div style="height: 480px">
    <DcVxeGrid v-bind="gridOptions" v-on="gridEvents" />
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import DcVxeGrid, { useTable, setGridOpts } from '../index';

// 5000 条大数据
const dataSource = Array.from({ length: 5000 }, (_, i) => ({
  rowId: String(i + 1),
  name: `用户 ${i + 1}`,
  age: 18 + ((i * 7) % 40),
  amount: Math.round((i % 97) * 13.5 * 100) / 100,
  city: ['杭州', '上海', '北京', '深圳', '广州', '成都'][i % 6],
  createTime: `2025-0${(i % 8) + 1}-1${i % 10} 1${i % 10}:30:00`,
}));

const columns = [
  { type: 'seq', title: '序号', width: 80 },
  { field: 'name', title: '姓名', sortable: true },
  { field: 'age', title: '年龄', sortable: true },
  { field: 'amount', title: '金额', sortable: true },
  { field: 'city', title: '城市', sortable: true },
  { field: 'createTime', title: '创建时间', sortable: true, width: 200 },
];

export default defineComponent({
  components: { DcVxeGrid },
  setup() {
    const instance = getCurrentInstance();
    useTable(instance?.appContext.app);

    const gridOptions = setGridOpts('props', {
      id: 'dcVxeGridVirtualDemo',
      columns,
      data: dataSource,
    });
    const gridEvents = setGridOpts('events', {});
    return { gridOptions, gridEvents };
  },
});
</script>
