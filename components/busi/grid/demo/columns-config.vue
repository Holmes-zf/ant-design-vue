<docs>
---
order: 3
title:
  zh-CN: 列配置弹窗
  en-US: Column Config Modal
---

## zh-CN

`defaultChecked` 注入已选字段（宿主从自己的存储传入）；未传 `requestSave` 时确认直接 `emit('confirm', columns)`，demo 里打印已选列。第二个示例演示传入 `requestSave`（mock 接口返回 `{ code: 200, message: '保存成功' }`）时沿用原确认流程：loading → 保存 → 成功提示 → 关闭。

## en-US

`defaultChecked` injects the selected field keys from the host's storage. Without `requestSave`, confirm directly emits `confirm(columns)` — printed in the demo. The second sample passes a mock `requestSave` returning `{ code: 200, message: '保存成功' }` to keep the original confirm flow: loading → save → success toast → close.

</docs>
<template>
  <a-space direction="vertical" :size="24">
    <div>
      <ColumnsConfig
        :columns="columns"
        menu-code="demoColumns"
        :defaultChecked="defaultChecked"
        @confirm="onConfirm"
      />
      <div style="margin-top: 8px">最近确认：{{ lastConfirm }}</div>
    </div>
    <div>
      <ColumnsConfig
        :columns="columns"
        menu-code="demoColumns"
        :defaultChecked="defaultChecked"
        :requestSave="mockSave"
        @confirm="onConfirm"
      />
      <div style="margin-top: 8px">
        传入 requestSave：沿用原确认流程（loading → 保存 → 提示 → 关闭）
      </div>
    </div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ColumnsConfig from '../ColumnsConfig.vue';

export default defineComponent({
  name: 'DemoColumnsConfig',
  components: { ColumnsConfig },
  setup() {
    const columns = [
      { field: 'name', title: '名称', visible: true },
      { field: 'code', title: '编码', visible: true },
      { field: 'status', title: '状态', visible: true },
      { field: 'qty', title: '数量', visible: true },
      { field: 'weight', title: '重量', visible: true },
      { field: 'createTime', title: '创建时间', visible: true },
    ];
    // 宿主存储里的已选字段 key 列表
    const defaultChecked = ['name', 'code', 'qty'];
    const lastConfirm = ref('（尚未确认）');
    const onConfirm = (list?: Array<{ key: string; sort: number; checked: boolean }>) => {
      lastConfirm.value = JSON.stringify(list ?? 'requestSave 模式（无参，同原实现）');
      // eslint-disable-next-line no-console
      console.log('confirm:', list);
    };
    // mock 保存接口：返回结构与原业务接口一致
    const mockSave = (menuCode: string, cols: unknown) => {
      // eslint-disable-next-line no-console
      console.log('mock requestSave:', menuCode, cols);
      return Promise.resolve({ code: 200, message: '保存成功' });
    };
    return { columns, defaultChecked, lastConfirm, onConfirm, mockSave };
  },
});
</script>
