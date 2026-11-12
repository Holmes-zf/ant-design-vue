<docs>
---
order: 0
title:
  zh-CN: 导入按钮（只选文件不上传）
  en-US: Import Button (select only)
---

## zh-CN

`ImportButton` 通过 `customRequest` 拦截真实上传，选中文件后按批次回调 `selectFile` / `select`，由业务自行解析处理。本示例将文件信息打印到控制台。

## en-US

`ImportButton` intercepts real uploads via `customRequest` and calls back `selectFile` / `select` per batch; parsing is up to the caller. This demo logs file info to the console.

</docs>
<template>
  <ImportButton upload-type="xls,xlsx" @selectFile="onSelectFile" @select="onSelect" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImportButton from '../ImportButton.vue';

export default defineComponent({
  components: { ImportButton },
  setup() {
    const onSelectFile = (file: File) => {
      // mock：真实业务里这里做前端解析 / 调接口
      console.log('[ImportButton] selectFile:', file.name, file.size);
    };
    const onSelect = (files: File[]) => {
      console.log(
        '[ImportButton] select batch:',
        files.map(f => f.name),
      );
    };
    return { onSelectFile, onSelect };
  },
});
</script>
