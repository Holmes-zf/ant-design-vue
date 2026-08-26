<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

基础的表单选择器用法，使用 `v-model:value` 绑定选中值。透传 `a-select` 的所有属性如 `showSearch`、`disabled` 等。

## en-US

Basic form select usage with `v-model:value`. Passes through all `a-select` props such as `showSearch`, `disabled`.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <div>
      <p>基本用法</p>
      <FormSelect v-model:value="value" :options="options" style="width: 240px" />
    </div>
    <div>
      <p>可搜索 + 禁用</p>
      <FormSelect
        v-model:value="disabledValue"
        :options="options"
        show-search
        disabled
        style="width: 240px"
      />
    </div>
    <div>当前值：{{ value }}</div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormSelect from '../FormSelect.vue';

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];

export default defineComponent({
  components: { FormSelect },
  setup() {
    const value = ref<string>();
    const disabledValue = ref('lucy');
    return { options, value, disabledValue };
  },
});
</script>
