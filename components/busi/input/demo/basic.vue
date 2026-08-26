<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic usage
---

## zh-CN

基本用法，使用 `v-model:value` 双向绑定。

## en-US

Basic usage with `v-model:value` two-way binding.

</docs>
<template>
  <FormInput v-model:value="value" placeholder="请输入" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormInput from '../FormInput.vue';

export default defineComponent({
  components: { FormInput },
  setup() {
    const value = ref<string>('');
    return { value };
  },
});
</script>
