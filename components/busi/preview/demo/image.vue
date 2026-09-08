<docs>
---
order: 2
title:
  zh-CN: 图片预览
  en-US: Image Preview
---

## zh-CN

单独使用 `ImgPreview`，`source` 支持外链 URL（下方示例）与本地 Blob（上传图片），点击图片可全屏查看，支持打印与下载。

## en-US

Use `ImgPreview` standalone. `source` accepts a remote URL (demo below) or a local Blob (upload an image). Click the image for a fullscreen viewer; print and download are supported.

</docs>
<template>
  <div>
    <a-space :wrap="true" style="margin-bottom: 12px">
      <a-upload accept=".png,.jpg,.jpeg" :before-upload="setFile" :show-upload-list="false">
        <a-button type="primary">选择本地图片</a-button>
      </a-upload>
      <a-button @click="useUrlImage">恢复示例外链图片</a-button>
    </a-space>
    <div class="preview-box">
      <ImgPreview :info="info" :source="source" :tools="['print', 'download']" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import ImgPreview from '../ImgPreview.vue';

const URL_IMAGE = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';

export default defineComponent({
  components: { ImgPreview },
  setup() {
    const state = reactive({
      source: URL_IMAGE as string | Blob,
      info: { name: 'example.png', type: 'png' } as Record<string, any>,
    });

    const setFile = (file: File) => {
      state.source = file;
      state.info = { name: file.name, type: file.name.split('.').pop() };
      return false;
    };

    const useUrlImage = () => {
      state.source = URL_IMAGE;
      state.info = { name: 'example.png', type: 'png' };
    };

    return { ...toRefs(state), setFile, useUrlImage };
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
