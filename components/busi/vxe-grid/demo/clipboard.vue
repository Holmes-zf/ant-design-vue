<docs>
---
order: 3
title:
  zh-CN: 复制粘贴与操作
  en-US: Clipboard & Actions
---

## zh-CN

开启 `mouseConfig.area` + `keyboardConfig.isClip` 后，可用鼠标拖拽框选单元格区域，`Ctrl+C` 复制（TSV 格式，可直接粘贴到 Excel）；双击单元格默认复制单元格文本，双击表头默认复制整列数据；点击单元格默认进入行编辑（`editConfig`），编辑后单元格显示状态标记。

## en-US

With `mouseConfig.area` + `keyboardConfig.isClip` enabled, drag to select a cell area and press `Ctrl+C` to copy (TSV format, can be pasted into Excel directly). Double click a cell copies its text and double click a header copies the whole column by default. Clicking a cell enters row editing (`editConfig`), and edited cells show dirty status marks.

</docs>
<template>
  <div style="height: 440px">
    <DcVxeGrid v-bind="gridOptions" v-on="gridEvents" />
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import DcVxeGrid, { useTable, setGridOpts } from '../index';

const dataSource = Array.from({ length: 30 }, (_, i) => ({
  rowId: String(i + 1),
  name: `用户 ${i + 1}`,
  phone: `1370000${String(i).padStart(4, '0')}`,
  address: `${['杭州市', '上海市', '北京市'][i % 3]}某某路 ${i + 1} 号`,
  createTime: `2025-0${(i % 8) + 1}-1${i % 10} 1${i % 10}:30:00`,
}));

const columns = [
  { type: 'seq', title: '序号', width: 60 },
  { field: 'name', title: '姓名', editRender: { name: '$input' } },
  { field: 'phone', title: '手机号', editRender: { name: '$input' } },
  { field: 'address', title: '地址', editRender: { name: '$input' } },
  { field: 'createTime', title: '创建时间' },
];

export default defineComponent({
  components: { DcVxeGrid },
  setup() {
    const instance = getCurrentInstance();
    useTable(instance?.appContext.app);

    // 开启区域框选复制与键盘复制
    const gridOptions = setGridOpts('props', {
      id: 'dcVxeGridClipboardDemo',
      columns,
      data: dataSource,
      mouseConfig: { area: true },
      keyboardConfig: { isClip: true },
    });
    const gridEvents = setGridOpts('events', {});
    return { gridOptions, gridEvents };
  },
});
</script>
