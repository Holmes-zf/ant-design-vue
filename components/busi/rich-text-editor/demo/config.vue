<docs>
---
order: 2
title:
  zh-CN: 透传 toolbarConfig / editorConfig
  en-US: Pass-through toolbarConfig / editorConfig
---

## zh-CN

`toolbarConfig` / `editorConfig` 是创建期快照：`toolbarConfig` 的 `excludeKeys` 覆盖组件内置排除项；`editorConfig` 的 `MENU_CONF` 按 key 合并，不会整块顶掉上传配置。demo 未注入 `customUpload`。

## en-US

`toolbarConfig` / `editorConfig` are snapshots at creation time: `excludeKeys` in `toolbarConfig` overrides the built-in exclusions; `MENU_CONF` in `editorConfig` is merged by key, so upload config is never wholly overridden. This demo does not inject `customUpload`.

</docs>
<template>
  <RichTextEditor
    v-model:value="html"
    :height="260"
    :toolbarConfig="toolbarConfig"
    :editorConfig="editorConfig"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RichTextEditor from '../RichTextEditor.vue';

export default defineComponent({
  components: { RichTextEditor },
  setup() {
    const html = ref('');
    // 创建期快照：excludeKeys 会覆盖组件内置排除项（组件已固定排除视频/全屏）
    const toolbarConfig = { excludeKeys: ['insertTable', 'codeBlock', 'emotion'] };
    // 创建期快照：MENU_CONF 按 key 与内置项合并，其余项（如 placeholder / maxLength）直接生效
    const editorConfig = { placeholder: '请输入正文…', maxLength: 5000 };
    return { html, toolbarConfig, editorConfig };
  },
});
</script>
