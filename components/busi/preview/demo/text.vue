<docs>
---
order: 5
title:
  zh-CN: 文本预览
  en-US: Text Preview
---

## zh-CN

单独使用 `TextPreview`，支持 txt / md / json / yaml / js 等文本类格式，内置轻量语法高亮（下方示例为 json）。也可上传本地文本文件预览。文本类不支持打印。

## en-US

Use `TextPreview` standalone for txt / md / json / yaml / js and other text formats, with lightweight built-in syntax highlighting (the demo below is json). Local text files can also be uploaded. Print is not supported for text files.

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload
        accept=".txt,.md,.json,.yaml,.yml,.xml,.js,.ts,.css,.sql,.sh"
        :before-upload="setFile"
        :show-upload-list="false"
      >
        <a-button type="primary">选择文本文件</a-button>
      </a-upload>
      <a-button @click="useSample">恢复内置 json 示例</a-button>
    </a-space>
    <div class="preview-box">
      <TextPreview :info="info" :source="source" :tools="['print', 'download']" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import TextPreview from '../TextPreview.vue';

const SAMPLE = JSON.stringify(
  {
    component: 'TextPreview',
    formats: ['txt', 'md', 'json', 'yaml', 'xml', 'js', 'ts', 'sql'],
    highlight: {
      keyword: ['const', 'function', 'return'],
      string: '"example"',
      number: [1024, 3.14],
      comment: '// 超过 1MB 的文本自动降级为纯转义渲染',
    },
    supported: true,
  },
  null,
  2,
);

export default defineComponent({
  components: { TextPreview },
  setup() {
    const state = reactive({
      source: new Blob([SAMPLE], { type: 'text/plain' }) as string | Blob,
      info: { name: 'sample.json', type: 'json' } as Record<string, any>,
    });

    const setFile = (file: File) => {
      state.source = file;
      state.info = { name: file.name, type: file.name.split('.').pop() };
      return false;
    };

    const useSample = () => {
      state.source = new Blob([SAMPLE], { type: 'text/plain' });
      state.info = { name: 'sample.json', type: 'json' };
    };

    return { ...toRefs(state), setFile, useSample };
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
