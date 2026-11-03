<docs>
---
order: 3
title:
  zh-CN: 设为默认
  en-US: Set As Default
---

## zh-CN

选项行内提供「设为默认」动作；`allowCancelSet` 开启后已默认项显示「取消默认」。不传 `defaultHooks` 时，`isDefault` 读取选项自带的 `isDefault`，动作只抛 `setDefault` / `cancelDefault` 事件，由使用方回写数据。

## en-US

Each option row gets a "set as default" action; with `allowCancelSet` the default row shows "cancel default". Without `defaultHooks`, `isDefault` reads `option.isDefault` and the actions only emit `setDefault` / `cancelDefault` for the caller to update data.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <FormSelectDefault
      v-model:value="value"
      :options="options"
      allow-cancel-set
      style="width: 260px"
      @set-default="handleSetDefault"
      @cancel-default="handleCancelDefault"
      @change="handleChange"
    />
    <div>当前值：{{ value }}；当前默认项：{{ defaultLabel }}</div>
  </a-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import FormSelectDefault from '../FormSelectDefault.vue';

export default defineComponent({
  components: { FormSelectDefault },
  setup() {
    const value = ref('port-a');
    const options = ref([
      { value: 'port-a', label: '口岸 A' },
      { value: 'port-b', label: '口岸 B', isDefault: true },
      { value: 'port-c', label: '口岸 C' },
    ]);

    const handleSetDefault = (item: any) => {
      options.value = options.value.map(opt => ({ ...opt, isDefault: opt.value === item.value }));
    };
    const handleCancelDefault = (item: any) => {
      options.value = options.value.map(opt =>
        opt.value === item.value ? { ...opt, isDefault: false } : opt,
      );
    };
    const handleChange = (val: any) => {
      value.value = val;
    };
    const defaultLabel = computed(() => options.value.find(opt => opt.isDefault)?.label ?? '无');

    return { value, options, defaultLabel, handleSetDefault, handleCancelDefault, handleChange };
  },
});
</script>
