<docs>
---
order: 1
title:
  zh-CN: 禁用态
  en-US: Disabled
---

## zh-CN

`disabled` 为 true 时隐藏工具栏、内容只读；程序赋值与值的写入/回写规则与正常态一致。

## en-US

With `disabled`, the toolbar is hidden and the content is read-only; programmatic assignment and value writing rules stay the same as the normal state.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <a-switch v-model:checked="disabled" unCheckedChildren="编辑" checkedChildren="只读" />
    <RichTextEditor v-model:value="html" :height="220" :disabled="disabled" />
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RichTextEditor from '../RichTextEditor.vue';

export default defineComponent({
  components: { RichTextEditor },
  setup() {
    const disabled = ref(true);
    const html = ref(
      '<p>只读展示的富文本内容，可包含 <strong>加粗</strong>、<em>斜体</em> 等样式。</p>',
    );
    return { disabled, html };
  },
});
</script>
