<docs>
---
order: 4
title:
  zh-CN: 动态查询条件栏（standalone）
  en-US: Dynamic Query Form (standalone)
---

## zh-CN

`standalone` 模式最小可跑示例：不关联表格，查询由外部监听 `queryCallback` 自行处理；`name` / `status` 走内置 `$input` / `$select` 渲染器，`remark` 走具名插槽；`fixedFields` 固定「名称」在最前。`menuCode` 传入后选中字段会记忆到 localStorage（key：`busi-grid-cond-demoQryForm`）。

## en-US

A minimal runnable `standalone` sample: no table wired, the host handles querying via `queryCallback`. `name` / `status` use built-in `$input` / `$select` renderers, `remark` uses a named slot, and `fixedFields` pins "名称" first. With `menuCode`, selected fields are remembered in localStorage (key `busi-grid-cond-demoQryForm`).

</docs>
<template>
  <div>
    <DcGridQryForm
      :formConfig="formConfig"
      :queryParams="queryParams"
      menu-code="demoQryForm"
      mode="standalone"
      :fixedFields="{ start: ['name'], end: [] }"
      @queryCallback="onQuery"
      @resetCallback="onReset"
    >
      <template #remark="{ data, field }">
        <a-input v-model:value="data[field]" placeholder="请输入备注" />
      </template>
    </DcGridQryForm>
    <div style="margin-top: 8px">当前表单值：{{ formSnapshot }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DcGridQryForm from '../DcGridQryForm.vue';

export default defineComponent({
  name: 'DemoDcGridQryForm',
  components: { DcGridQryForm },
  setup() {
    const formConfig = {
      items: [
        { field: 'name', title: '名称', itemRender: { name: '$input', defaultValue: '' } },
        {
          field: 'status',
          title: '状态',
          itemRender: {
            name: '$select',
            defaultValue: '',
            options: [
              { label: '全部', value: '' },
              { label: '待处理', value: 'todo' },
              { label: '已完成', value: 'done' },
            ],
          },
        },
        { field: 'remark', title: '备注', slots: { default: 'remark' } },
        { field: 'code', title: '编码', itemRender: { name: '$input', defaultValue: '' } },
      ],
    };
    const queryParams = ref({ name: '', status: '', remark: '', code: '' });
    const formSnapshot = ref('{}');
    const snapshot = () => JSON.stringify(queryParams.value);
    const onQuery = () => {
      formSnapshot.value = snapshot();
    };
    const onReset = () => {
      formSnapshot.value = snapshot();
    };
    return { formConfig, queryParams, formSnapshot, onQuery, onReset };
  },
});
</script>
