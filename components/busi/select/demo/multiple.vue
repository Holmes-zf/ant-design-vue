<docs>
---
order: 1
title:
  zh-CN: 多选
  en-US: Multiple
---

## zh-CN

透传 `multiple` 属性开启多选。多选时标签按 `a-select` 默认行为展示（超出容器宽度后换行）；`heightClass` 的 `nowrap` 不换行样式已停用。

## en-US

Pass `multiple` to enable multi-select. Selected tags follow the default `a-select` behavior (they wrap when exceeding the container width); the `nowrap` styling of `heightClass` has been retired.

</docs>
<template>
  <div>
    <FormSelect v-model:value="value" :options="options" multiple style="width: 320px" />
    <p style="margin-top: 16px">当前值：{{ value.join('、') }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormSelect from '../FormSelect.vue';

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
  { value: 'tom', label: 'Tom' },
  { value: 'bob', label: 'Bob' },
];

export default defineComponent({
  components: { FormSelect },
  setup() {
    const value = ref<string[]>(['jack']);
    return { options, value };
  },
});
</script>
