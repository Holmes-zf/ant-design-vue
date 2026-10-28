<docs>
---
order: 2
title:
  zh-CN: 区块容器
  en-US: Detail Container
---

## zh-CN

`DetailContainer` 给「页面里的某一块」用：内容 + 本区块自己的底栏。底栏是流内元素，位置由 flex 分配 —— 宿主定高时随容器常驻列尾，宿主随内容时排在末尾，所以不需要任何让位补偿。页面级的底栏请用 `DetailPage` 的 `#footer`，不要用这里。

## en-US

`DetailContainer` serves a single block of a page: content plus that block's own footer. The footer stays in the flow and its position is allocated by flex — pinned to the column end when the host has a height, otherwise placed at the end of the content, so no space compensation is needed. For a page-level footer use `#footer` of `DetailPage`, not this component.

</docs>

<template>
  <div class="demo-grid">
    <DetailContainer>
      <div class="demo-content">
        <h4>基本信息</h4>
        <p>没有底栏的区块：内容超出时在这一块内部滚动。</p>
      </div>
    </DetailContainer>

    <DetailContainer>
      <template #footer>
        <div class="demo-footer">
          <a-space>
            <a-button size="small">重置</a-button>
            <a-button type="primary" size="small">保存</a-button>
          </a-space>
        </div>
      </template>
      <div class="demo-content">
        <h4>明细信息</h4>
        <p>带本区块底栏：底栏贴在列尾，不遮挡内容，也不需要业务侧写任何 margin / padding。</p>
      </div>
    </DetailContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DetailContainer from '../DetailContainer.vue';

export default defineComponent({
  components: { DetailContainer },
});
</script>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 220px;
}

.demo-grid > :deep(.detail-container) {
  border: 1px dashed #d9d9d9;
}

.demo-content {
  padding: 16px;
}

.demo-content h4 {
  margin: 0 0 8px;
}

.demo-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
