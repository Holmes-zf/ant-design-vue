<docs>
---
order: 1
title:
  zh-CN: 详情页外壳
  en-US: Detail Page
---

## zh-CN

`DetailPage` 组合出「返回头 + 内容 + 页面底栏」的整页骨架：`#tags` 与 `#headerRight` 分别落在标题行与页头右侧，`#footer` 贴底常驻（不传则不渲染）。返回键恒渲染，`back` 只决定点击行为，不传时按路由 / 浏览器历史回退。

## en-US

`DetailPage` composes the full-page skeleton of "back header + content + page footer": `#tags` and `#headerRight` land in the title row and on the right of the header, while `#footer` stays pinned to the bottom (skipped when omitted). The back button is always rendered; `back` only decides the click behavior, falling back to router / browser history when omitted.

</docs>

<template>
  <div class="demo-viewport">
    <DetailPage title="订单详情" sub-title="SO-20261028-0001" :back="handleBack">
      <template #tags>
        <a-tag color="processing">待审核</a-tag>
      </template>
      <template #headerRight>
        <a-space>
          <a-button size="small">打印</a-button>
          <a-button type="primary" size="small">编辑</a-button>
        </a-space>
      </template>

      <div class="demo-content">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="客户">上海某某贸易有限公司</a-descriptions-item>
          <a-descriptions-item label="金额">¥ 128,600.00</a-descriptions-item>
          <a-descriptions-item label="创建时间">2026-10-28 10:24</a-descriptions-item>
          <a-descriptions-item label="负责人">张帆</a-descriptions-item>
        </a-descriptions>
      </div>

      <template #footer>
        <div class="demo-footer">
          <a-space>
            <a-button>取消</a-button>
            <a-button type="primary">提交</a-button>
          </a-space>
        </div>
      </template>
    </DetailPage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { message } from 'ant-design-vue';
import DetailPage from '../DetailPage.vue';

export default defineComponent({
  components: { DetailPage },
  setup() {
    const handleBack = () => {
      message.info('点击了返回（未传 back 时按路由 / 浏览器历史回退）');
    };
    return { handleBack };
  },
});
</script>

<style scoped>
.demo-viewport {
  height: 340px;
  border: 1px dashed #d9d9d9;
}

.demo-content {
  padding: 16px;
}

.demo-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background: #fff;
  box-shadow: var(--form-footer-shadow, 0 1px 8px rgba(19, 32, 67, 0.1));
}
</style>
