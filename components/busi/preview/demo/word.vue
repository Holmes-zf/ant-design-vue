<docs>
---
order: 4
title:
  zh-CN: Word 预览
  en-US: Word Preview
---

## zh-CN

单独使用 `WordPreview`，推荐使用 `docx` 文件；doc/docx 不支持打印，仅渲染下载工具。

## en-US

Use `WordPreview` standalone, `docx` is recommended. Print is not supported for doc/docx, only the download tool is rendered.

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload accept=".docx" :before-upload="setFile" :show-upload-list="false">
        <a-button type="primary">选择 docx 文件</a-button>
      </a-upload>
    </a-space>
    <div class="preview-box">
      <WordPreview v-if="file" :info="info" :source="file" :tools="['print', 'download']" />
      <a-empty v-else description="请选择 docx 文件" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import WordPreview from '../WordPreview.vue';

export default defineComponent({
  components: { WordPreview },
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
  height: 500px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
