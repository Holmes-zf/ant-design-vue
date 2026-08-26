<docs>
---
order: 2
title:
  zh-CN: 错误状态与自动选中
  en-US: Error State & Auto Select
---

## zh-CN

`formType="fail"` 展示错误状态样式；`defaultSelect` 在数据只有一条且当前无值时自动选中。

## en-US

`formType="fail"` shows the error state style; `defaultSelect` auto-selects the only option when no value is set.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <div>
      <p>错误状态</p>
      <FormSelect
        v-model:value="errorValue"
        :options="options"
        form-type="fail"
        style="width: 240px"
      />
    </div>
    <div>
      <p>单条数据自动选中</p>
      <FormSelect
        v-model:value="autoValue"
        :options="singleOptions"
        default-select
        style="width: 240px"
      />
      <span style="margin-left: 8px">当前值：{{ autoValue }}</span>
    </div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormSelect from '../FormSelect.vue';

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
];

const singleOptions = [{ value: 'only', label: 'Only Option' }];

export default defineComponent({
  components: { FormSelect },
  setup() {
    const errorValue = ref('lucy');
    const autoValue = ref<string>();
    return { options, singleOptions, errorValue, autoValue };
  },
});
</script>
