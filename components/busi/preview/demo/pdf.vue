<docs>
---
order: 1
title:
  zh-CN: PDF 预览
  en-US: PDF Preview
---

## zh-CN

单独使用 `PDFPreview`，支持 `print` / `download` 工具；`percentage` 控制打开时滚动定位到文档的百分比位置（挂载时生效，拖动滑块可重新定位）。

## en-US

Use `PDFPreview` standalone with `print` / `download` tools. `percentage` scrolls to a percentage position of the document when it mounts (drag the slider to re-position).

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload accept=".pdf" :before-upload="setFile" :show-upload-list="false">
        <a-button type="primary">选择 PDF 文件</a-button>
      </a-upload>
      <span>定位百分比：{{ percentage }}%</span>
      <a-slider
        v-model:value="sliderValue"
        :min="0"
        :max="100"
        :step="10"
        style="width: 160px"
        @afterChange="commitPercentage"
      />
    </a-space>
    <div class="preview-box">
      <PDFPreview
        v-if="file"
        :key="percentage"
        :info="info"
        :source="file"
        :tools="['print', 'download']"
        :percentage="percentage / 100"
      />
      <a-empty v-else description="请选择 PDF 文件" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import PDFPreview from '../PDFPreview.vue';

export default defineComponent({
  components: { PDFPreview },
  setup() {
    // percentage 仅在拖动结束后提交，避免拖动过程中反复重挂载 PDF
    const percentage = ref(0);
    const sliderValue = ref(0);
    const state = reactive({
      file: null as Blob | null,
      info: {} as Record<string, any>,
    });

    const commitPercentage = (value: number) => {
      sliderValue.value = value;
      percentage.value = value;
    };

    const setFile = (file: File) => {
      state.file = file;
      state.info = { name: file.name, type: file.name.split('.').pop() };
      return false;
    };

    return { percentage, sliderValue, commitPercentage, ...toRefs(state), setFile };
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
