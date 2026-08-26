<docs>
---
order: 1
title:
  zh-CN: 多选
  en-US: Multiple
---

## zh-CN

透传 `multiple` 属性开启多选。多选时标签默认不换行（`heightClass="nowrap"`），超出宽度后横向滚动。

## en-US

Pass `multiple` to enable multi-select. Selected tags stay on one line (`heightClass="nowrap"`) by default and scroll horizontally when overflowing.

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
