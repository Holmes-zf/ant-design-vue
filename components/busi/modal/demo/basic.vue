<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

基础的弹窗用法，使用 `v-model:visible` 控制显示隐藏。透传 `a-modal` 的所有属性如 `title`、`width`、`centered` 等。

## en-US

Basic modal usage with `v-model:visible`. Passes through all `a-modal` props such as `title`, `width`, `centered`.

</docs>
<template>
  <div>
    <a-button type="primary" @click="visible = true">Open Modal</a-button>
    <Modal
      v-model:visible="visible"
      title="Basic Modal"
      :width="520"
      centered
      :loading="loading"
      @ok="handleOk"
    >
      <p>This is the modal content.</p>
      <p>You can put any content here.</p>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Modal from '../Modal.vue';

export default defineComponent({
  components: { Modal },
  setup() {
    const visible = ref(false);
    const loading = ref(false);

    const handleOk = () => {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    };

    return { visible, loading, handleOk };
  },
});
</script>
