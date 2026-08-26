<docs>
---
order: 0
title:
  zh-CN: 表格工具栏
  en-US: Table Toolbar
---

## zh-CN

`ActionBody` 常作为表格附属组件承载工具栏操作项。通过 `align` 控制对齐方式，左侧放搜索、右侧放操作按钮组，子项间距固定 8px。

## en-US

`ActionBody` is a table auxiliary component that usually holds toolbar actions. The `align` prop controls alignment: search on the left, action buttons on the right, with a fixed 8px gap between children.

</docs>
<template>
  <div style="width: 100%">
    <div class="action-body-demo-toolbar">
      <ActionBody align="left">
        <span class="action-body-demo-title">用户列表</span>
        <a-input-search placeholder="搜索姓名" style="width: 200px" />
      </ActionBody>
      <ActionBody align="right">
        <a-button type="primary">新增</a-button>
        <a-button>导出</a-button>
      </ActionBody>
    </div>
    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="false"
      size="small"
      row-key="key"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ActionBody from '../ActionBody.vue';

const dataSource = [
  { key: '1', name: '张三', phone: '13800000001' },
  { key: '2', name: '李四', phone: '13800000002' },
  { key: '3', name: '王五', phone: '13800000003' },
];

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '电话', dataIndex: 'phone', key: 'phone' },
];

export default defineComponent({
  components: { ActionBody },
  setup() {
    return { dataSource, columns };
  },
});
</script>

<style lang="less" scoped>
.action-body-demo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.action-body-demo-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
