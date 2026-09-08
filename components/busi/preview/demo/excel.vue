<docs>
---
order: 3
title:
  zh-CN: Excel/CSV 预览
  en-US: Excel/CSV Preview
---

## zh-CN

单独使用 `ExcelPreview`，支持 `xls` / `xlsx` 等格式；`csv` 会先在浏览器内转换为表格再渲染。excel/csv 不支持打印，仅渲染下载工具。

## en-US

Use `ExcelPreview` standalone for `xls` / `xlsx` and other formats; `csv` files are converted to a spreadsheet in the browser before rendering. Print is not supported for excel/csv, only the download tool is rendered.

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload accept=".xls,.xlsx,.xlsm,.csv" :before-upload="setFile" :show-upload-list="false">
        <a-button type="primary">选择表格文件</a-button>
      </a-upload>
    </a-space>
    <div class="preview-box">
      <ExcelPreview v-if="file" :info="info" :source="file" :tools="['print', 'download']" />
      <a-empty v-else description="请选择 xls / xlsx / csv 文件" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import ExcelPreview from '../ExcelPreview.vue';

export default defineComponent({
  components: { ExcelPreview },
  setup() {
    const state = reactive({
      file: null as Blob | null,
      info: {} as Record<string, any>,
    });

    const setFile = (file: File) => {
      state.file = file;
      state.info = { name: file.name, type: file.name.split('.').pop() };
      return false;
    };

    return { ...toRefs(state), setFile };
  },
});
</script>

<style scoped>
.preview-box {
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
