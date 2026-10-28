<docs>
---
order: 1
title:
  zh-CN: 自定义文案与插画
  en-US: Custom Text and Illustration
---

## zh-CN

`description` 换文案；`image` 换插画，可传图片地址字符串，也可传 antd 的 `PRESENTED_IMAGE_SIMPLE` / `PRESENTED_IMAGE_DEFAULT`。

## en-US

Use `description` to change the text and `image` to change the illustration — either an image URL string or antd's `PRESENTED_IMAGE_SIMPLE` / `PRESENTED_IMAGE_DEFAULT`.

</docs>

<template>
  <div class="demo-grid">
    <div class="demo-box">
      <Empty description="暂无审批记录" />
    </div>
    <div class="demo-box">
      <Empty :image="AntEmpty.PRESENTED_IMAGE_DEFAULT" description="暂无数据（默认插画）" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Empty as AntEmpty } from 'ant-design-vue';
import Empty from '../Empty.vue';

export default defineComponent({
  components: { Empty },
  setup() {
    return { AntEmpty };
  },
});
</script>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.demo-box {
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}
</style>
