<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

`v-model:value` 双向绑定，值为「编辑器片段」HTML，空内容统一为 `''`。`height` 支持数字（px）与带单位的字符串。demo 未注入 `customUpload`，图片/附件上传入口不可用。

## en-US

`v-model:value` two-way binding; the value is editor-fragment HTML and empty content is always `''`. `height` accepts a number (px) or a string with units. This demo does not inject `customUpload`, so image/attachment upload entries are unavailable.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <RichTextEditor v-model:value="html" :height="240" />
    <pre class="value-preview">{{ html || "''" }}</pre>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RichTextEditor from '../RichTextEditor.vue';

export default defineComponent({
  components: { RichTextEditor },
  setup() {
    // 值契约：空内容就是 ''，可直接挂 required 规则
    const html = ref('');
    return { html };
  },
});
</script>

<style scoped>
.value-preview {
  margin: 0;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
