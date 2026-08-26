<docs>
---
order: 1
title:
  zh-CN: 确认弹窗
  en-US: Confirm Modal
---

## zh-CN

确认型弹窗，支持 `success`、`warning`、`error` 三种状态图标。内置标题"操作确认"和 700px 宽度。

## en-US

Confirmation modal with `success`, `warning`, `error` type icons. Built-in title and 700px width.

</docs>
<template>
  <div>
    <a-space>
      <a-button @click="openConfirm('warning')">Warning</a-button>
      <a-button type="primary" @click="openConfirm('success')">Success</a-button>
      <a-button danger @click="openConfirm('error')">Error</a-button>
    </a-space>
    <ConfirmModal
      v-model:visible="visible"
      :type="type"
      content="确定要执行此操作吗？"
      tips="此操作不可撤销。"
      @ok="handleOk"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ConfirmModal from '../ConfirmModal.vue';

export default defineComponent({
  components: { ConfirmModal },
  setup() {
    const visible = ref(false);
    const type = ref<'success' | 'warning' | 'error'>('warning');

    const openConfirm = (t: 'success' | 'warning' | 'error') => {
      type.value = t;
      visible.value = true;
    };

    const handleOk = () => {
      visible.value = false;
    };

    return { visible, type, openConfirm, handleOk };
  },
});
</script>
