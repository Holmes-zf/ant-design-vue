<docs>
---
order: 0
title:
  zh-CN: 多文件预览
  en-US: Multi-file Preview
---

## zh-CN

通过 `previewList` 传入多个文件（支持 url / fileName / blob 三种来源），底部出现上一份/下一份切换按钮。`tools` 声明 `print` 与 `download`，实际按各格式支持能力渲染。同时透传 `a-modal` 的属性如 `wrapClassName`、`zIndex` 等。

## en-US

Pass multiple files via `previewList` (url / fileName / blob are all supported), and the footer shows prev/next paging buttons. `tools` declares `print` and `download`, rendered by each format's capabilities. `a-modal` props such as `wrapClassName` and `zIndex` are passed through.

</docs>
<template>
  <div>
    <a-space :wrap="true">
      <a-upload :before-upload="addFile" multiple :show-upload-list="false">
        <a-button type="primary">
          <upload-outlined />
          选择文件加入预览
        </a-button>
      </a-upload>
      <a-button :disabled="!previewList.length" @click="visible = true">
        打开预览（{{ previewList.length }} 个文件）
      </a-button>
    </a-space>
    <PreviewModal
      v-model:visible="visible"
      :preview-list="previewList"
      :tools="['print', 'download']"
      wrap-class-name="demo-preview-modal"
      :z-index="1001"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import PreviewModal from '../PreviewModal.vue';

export default defineComponent({
  components: { PreviewModal, UploadOutlined },
  setup() {
    const visible = ref(false);
    const previewList = ref<any[]>([]);

    const addFile = (file: File) => {
      // 不可变更新：原地 push 会导致 PreviewModal 内部 isEqual(newVal, oldVal) 判定相等而不重新初始化
      previewList.value = [
        ...previewList.value,
        {
          name: file.name,
          type: file.name.split('.').pop(),
          blob: file,
        },
      ];
      return false; // 阻止自动上传
    };

    return { visible, previewList, addFile };
  },
});
</script>
