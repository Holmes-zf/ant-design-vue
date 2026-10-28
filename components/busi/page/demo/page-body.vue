<docs>
---
order: 0
title:
  zh-CN: 页面主体
  en-US: Page Body
---

## zh-CN

`PageBody` 是「可选页头 + 内容」的主体容器：传入 `#header` 才渲染页头横条，页头内元素自由排布（横条本身已是 `flex` 换行）。`height` 默认撑满父级，需要随内容长高时传 `'auto'`；未传 `#header` 时整条页头不渲染。

## en-US

`PageBody` is the main container of an optional header plus content: the header bar is rendered only when `#header` is passed, and its children are freely arranged (the bar itself wraps with `flex`). `height` fills the parent by default — pass `'auto'` to grow with content; without `#header` the whole header bar is skipped.

</docs>

<template>
  <div>
    <PageBody height="160px" class="demo-body">
      <template #header>
        <span class="demo-title">订单列表</span>
        <a-space class="demo-header-right">
          <a-button size="small">导出</a-button>
          <a-button type="primary" size="small">新建</a-button>
        </a-space>
      </template>
      <div class="demo-content">
        内容区撑满页头以下的剩余高度，超出部分由使用方决定在哪一层滚动。
      </div>
    </PageBody>

    <PageBody height="auto" class="demo-body demo-body-plain">
      <div class="demo-content">未传 #header 时不渲染页头；height="auto" 时高度随内容长高。</div>
    </PageBody>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageBody from '../PageBody.vue';

export default defineComponent({
  components: { PageBody },
});
</script>

<style scoped>
.demo-body {
  border: 1px dashed #d9d9d9;
}

.demo-body-plain {
  margin-top: 12px;
}

.demo-title {
  font-size: 16px;
  font-weight: 600;
}

.demo-header-right {
  margin-left: auto;
}

.demo-content {
  padding: 16px;
}
</style>
