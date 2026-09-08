<docs>
---
order: 1
title:
  zh-CN: PDF 预览
  en-US: PDF Preview
---

## zh-CN

单独使用 `PDFPreview`，支持 `print` / `download` 工具。`percentage` 用于"续读定位"：仅在预览挂载（打开）时生效一次，PDF 渲染完成后内部滚动容器自动定位到文档高度的 x% 处。典型场景：记录上次阅读位置，下次打开时传入。需文档内容高度超出预览容器才能看到滚动效果，页数太少的 PDF 定位不明显。

## en-US

Use `PDFPreview` standalone with `print` / `download` tools. `percentage` is for "resume reading": it applies only once when the preview mounts — after the PDF renders, its internal scroll container is scrolled to x% of the document height. Typical use case: remember the last reading position and pass it on the next open. The effect is only visible when the document is taller than the preview container.

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload accept=".pdf" :before-upload="setFile" :show-upload-list="false">
        <a-button type="primary">选择 PDF 文件</a-button>
      </a-upload>
      <a-button v-if="file" @click="reopen">
        {{ opened ? '重新打开（应用定位）' : '打开预览' }}
      </a-button>
      <span>续读定位：{{ percentage }}%</span>
      <a-slider v-model:value="percentage" :min="0" :max="100" :step="10" style="width: 160px" />
    </a-space>
    <p v-if="file" style="color: #999; margin-bottom: 8px">
      `percentage` 只在打开（挂载）时生效一次：调整滑块后点"重新打开"即可定位到文档
      {{ percentage }}% 高度处（内容需超过容器高度才可感知滚动）。
    </p>
    <div class="preview-box">
      <PDFPreview
        v-if="file && opened"
        :info="info"
        :source="file"
        :tools="['print', 'download']"
        :percentage="percentage / 100"
      />
      <a-empty v-else-if="!file" description="请选择 PDF 文件" />
      <a-empty v-else description="已关闭，点击上方按钮重新打开" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, reactive, ref, toRefs } from 'vue';
import PDFPreview from '../PDFPreview.vue';

export default defineComponent({
  components: { PDFPreview },
  setup() {
    // percentage：仅表示"下次打开时"的定位百分比，实时调整不影响已打开的预览
    const percentage = ref(0);
    const state = reactive({
      file: null as Blob | null,
      info: {} as Record<string, any>,
    });
    // opened：控制 PDFPreview 挂载/卸载；percentage 只在挂载那一刻生效
    const opened = ref(false);

    const reopen = () => {
      if (opened.value) {
        opened.value = false;
        nextTick(() => {
          opened.value = true;
        });
        return;
      }
      opened.value = true;
    };

    const setFile = (file: File) => {
      state.file = file;
      state.info = { name: file.name, type: file.name.split('.').pop() };
      opened.value = false; // 换文件后需重新打开，避免旧内容残留
      return false;
    };

    return { percentage, opened, reopen, ...toRefs(state), setFile };
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
