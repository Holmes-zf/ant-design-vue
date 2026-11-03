<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

插槽内容是打印件，通过组件实例的 `printing()` 调起打印；`after-print` 在打印结束（含取消）后触发。

## en-US

The slot content is the printout; call `printing()` on the component instance to print, and `after-print` fires when printing finishes (including cancellation).

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <a-space :size="16">
      <a-button type="primary" @click="handlePrint">打印</a-button>
      <span>打印次数：{{ printCount }}</span>
    </a-space>

    <PrintingBody ref="printingRef" @after-print="handleAfterPrint">
      <div class="print-page">
        <div class="print-title">出库单</div>
        <div class="print-row">
          <span>单号：OUT-20261103-001</span>
          <span>日期：2026-11-03</span>
        </div>
        <div class="print-row">
          <span>仓库：阿姆斯特丹仓</span>
          <span>客户：示例客户</span>
        </div>
        <div class="print-tips">一页一块，多页时给每块加 break-after: page</div>
      </div>
    </PrintingBody>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PrintingBody from '../PrintingBody.vue';

export default defineComponent({
  components: { PrintingBody },
  setup() {
    const printingRef = ref();
    const printCount = ref(0);

    const handlePrint = () => {
      printingRef.value?.printing().catch(() => undefined);
    };
    const handleAfterPrint = () => {
      printCount.value += 1;
    };

    return { printingRef, printCount, handlePrint, handleAfterPrint };
  },
});
</script>

<style lang="less" scoped>
.print-page {
  width: 560px;
  padding: 16px;
  border: 1px solid #d9d9d9;
}

.print-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.print-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  line-height: 24px;
}

.print-tips {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
