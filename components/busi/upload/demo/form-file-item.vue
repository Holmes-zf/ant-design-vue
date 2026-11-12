<docs>
---
order: 1
title:
  zh-CN: 单条文件行
  en-US: Single File Row
---

## zh-CN

`FormFileItem` 也可单独使用：按 `tools` 数组顺序渲染工具图标，开启 `preview` 后点击眼睛图标内置弹框预览。

## en-US

`FormFileItem` works standalone: tool icons render in `tools` order; with `preview` enabled, the eye icon opens the built-in preview modal.

</docs>
<template>
  <div style="max-width: 480px">
    <FormFileItem :file="file" :tools="['delete', 'download', 'preview']" @delete="onDelete" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { message } from 'ant-design-vue';
import FormFileItem from '../FormFileItem.vue';

export default defineComponent({
  components: { FormFileItem },
  setup() {
    const file = {
      name: '示例图片.png',
      url: 'https://httpbin.org/image/png',
      fileId: 'demo-1',
    };
    const onDelete = () => message.info('已触发 delete 事件（demo 不做真实删除）');
    return { file, onDelete };
  },
});
</script>
