<docs>
---
order: 6
title:
  zh-CN: 不支持格式兜底
  en-US: Unsupported Format Fallback
---

## zh-CN

不支持的文件类型（如 `zip`）由 `EmptyPreview` 兜底展示"暂不支持预览"，仍可通过头部下载工具下载文件。

## en-US

Unsupported file types (e.g. `zip`) fall back to `EmptyPreview` with a "not supported" hint; the file can still be downloaded via the toolbar.

</docs>
<template>
  <div>
    <div class="preview-box">
      <EmptyPreview :info="info" :source="source" :tools="['download']" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import EmptyPreview from '../EmptyPreview.vue';

export default defineComponent({
  components: { EmptyPreview },
  setup() {
    const state = reactive({
      source: new Blob(['demo archive'], { type: 'application/zip' }),
      info: { name: 'demo.zip', type: 'zip' },
    });
    return { ...toRefs(state) };
  },
});
</script>

<style scoped>
.preview-box {
  height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
