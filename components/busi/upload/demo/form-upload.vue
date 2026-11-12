<docs>
---
order: 2
title:
  zh-CN: 上传区 + 文件列表
  en-US: Upload Zone + File List
---

## zh-CN

完整形态：`beforeSelect` 业务闸门、`maxCount` / `maxSize` / `uploadType` 校验、`fileItemProps` 配置条目工具。本 demo 不连接真实后端：`beforeSelect` 返回 `false` 拦截所有新上传并提示，同时预置一条已上传条目展示列表渲染。

## en-US

Full form: `beforeSelect` gate, `maxCount` / `maxSize` / `uploadType` checks, item tools via `fileItemProps`. This demo does not hit a real backend: `beforeSelect` returns `false` to block new uploads with a hint, and one preset "done" item shows the list rendering.

</docs>
<template>
  <div style="max-width: 640px">
    <FormUpload
      v-model:fileList="fileList"
      action="https://httpbin.org/post"
      upload-type="png,jpg,pdf"
      :maxSize="2"
      :maxCount="3"
      :fileItemProps="{ tools: ['delete', 'download', 'preview'] }"
      :beforeSelect="beforeSelect"
      @delete="onDelete"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { message } from 'ant-design-vue';
import FormUpload from '../FormUpload.vue';

export default defineComponent({
  components: { FormUpload },
  setup() {
    // 预置一条"已上传"条目，展示列表渲染（演示环境无真实后端）
    const fileList = reactive([
      {
        uid: 'demo-1',
        name: '预置文件.pdf',
        originalFileName: '预置文件.pdf',
        fileName: 'demo.pdf',
        fileId: 'demo-1',
        status: 'done',
        url: 'https://httpbin.org/image/png',
      },
    ]);
    // demo 不真传：业务闸门统一拦截
    const beforeSelect = () => {
      message.info('演示环境不真实上传：beforeSelect 返回 false 已拦截');
      return false;
    };
    const onDelete = (removed: unknown) => {
      message.info('已触发 delete 事件');
      console.log('[FormUpload] delete:', removed);
    };
    return { fileList, beforeSelect, onDelete };
  },
});
</script>
