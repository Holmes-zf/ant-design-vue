<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic usage
---

## zh-CN

默认使用简版插画与「暂无数据」文案，直接放在需要占位的容器里即可；外壳为 BFC，antd 空态自带的上下外边距不会溢出到父级。

## en-US

By default it uses the simple illustration and the "暂无数据" text — drop it into any container that needs a placeholder. The shell is a BFC, so the vertical margins antd's empty state carries never leak into the parent.

</docs>

<template>
  <div class="demo-box">
    <Empty />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Empty from '../Empty.vue';

export default defineComponent({
  components: { Empty },
});
</script>

<style scoped>
.demo-box {
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}
</style>
