<docs>
---
order: 1
title:
  zh-CN: 查询表格
  en-US: Query Table
---

## zh-CN

通过 `proxyConfig` 配置数据代理（配合 `formConfig` 查询表单与 `pagerConfig` 分页），由 `commitProxy` 触发查询；工具栏支持刷新、缩放、自定义列；`pagerLeft` 插槽自定义分页左侧统计内容；操作列通过列 `slots.default` 渲染。

## en-US

Configure data proxy via `proxyConfig` (together with `formConfig` query form and `pagerConfig` pagination), triggered by `commitProxy`. The toolbar supports refresh, zoom and custom columns. Use the `pagerLeft` slot for custom pager-left statistics, and column `slots.default` for the operate column.

</docs>
<template>
  <div style="height: 480px">
    <DcVxeGrid v-bind="gridOptions" v-on="gridEvents">
      <template #pagerLeft>
        <span style="font-size: 12px">共 {{ total }} 条数据</span>
      </template>
      <template #operate="{ row }">
        <a @click="handleView(row)">查看</a>
        <a-divider type="vertical" />
        <a @click="handleEdit(row)">编辑</a>
      </template>
    </DcVxeGrid>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from 'vue';
import DcVxeGrid, { useTable, setGridOpts, updateColumns } from '../index';

// 模拟接口
const ALL_DATA = Array.from({ length: 126 }, (_, i) => ({
  rowId: String(i + 1),
  name: `用户 ${i + 1}`,
  phone: `1390000${String(i).padStart(4, '0')}`,
  status: i % 3,
  createTime: `2025-0${(i % 8) + 1}-2${i % 10} 0${i % 10}:00:00`,
}));

const queryMock = ({ current, size, name }: any) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const list = name ? ALL_DATA.filter((it) => it.name.includes(name)) : ALL_DATA;
      resolve({
        result: list.slice((current - 1) * size, current * size),
        total: list.length,
      });
    }, 300);
  });

const columns = updateColumns('dcVxeGridQueryDemo', [
  { type: 'seq', title: '序号', width: 60 },
  { type: 'checkbox', title: '', width: 50 },
  { field: 'name', title: '姓名' },
  { field: 'phone', title: '手机号' },
  { field: 'status', title: '状态', formatter: ({ cellValue }: any) => ['待处理', '处理中', '已完成'][cellValue] },
  { field: 'createTime', title: '创建时间' },
  { field: 'operate', title: '操作', slots: { default: 'operate' }, fixed: 'right', width: 120 },
]);

export default defineComponent({
  components: { DcVxeGrid },
  setup() {
    const instance = getCurrentInstance();
    useTable(instance?.appContext.app);

    const total = ref(0);
    const gridOptions = setGridOpts('props', {
      id: 'dcVxeGridQueryDemo',
      columns,
      proxyConfig: {
        form: true,
        autoLoad: true,
        props: { result: 'result', total: 'total' },
        ajax: {
          query: ({ page, form }: any) =>
            queryMock({ current: page.currentPage, size: page.pageSize, ...form }).then(
              (res: any) => {
                total.value = res.total;
                return res;
              }
            ),
        },
      },
      formConfig: {
        items: [
          {
            field: 'name',
            title: '姓名',
            itemRender: { name: '$input', props: { placeholder: '请输入姓名' } },
          },
        ],
      },
      toolbarConfig: {
        refresh: true,
        zoom: true,
        custom: true,
      },
    });
    const gridEvents = setGridOpts('events', {});
    const handleView = (row: any) => {
      console.log('view', row);
    };
    const handleEdit = (row: any) => {
      console.log('edit', row);
    };
    return { gridOptions, gridEvents, total, handleView, handleEdit };
  },
});
</script>
