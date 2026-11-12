<docs>
---
order: 0
title:
  zh-CN: 敏感字段值 + 眼睛
  en-US: Sensitive value + eye
---

## zh-CN

开关状态由组件托管在 `row[field + "__eye"]` 上，业务侧无需任何开关态样板；`toggle` 事件回传点击后的目标态，可在接口失败时把状态键弹回 `false`。

## en-US

The toggle state is hosted by the component at `row[field + "__eye"]`, no boilerplate needed on the business side; the `toggle` event carries the target state so the business side can flip the key back on failure.

</docs>
<template>
  <div class="demo-rows">
    <EyeSwitch
      v-for="item in rows"
      :key="item.field"
      :row="item"
      :field="item.field"
      @toggle="onToggle"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import EyeSwitch from '../EyeSwitch.vue';

export default defineComponent({
  components: { EyeSwitch },
  setup() {
    const rows = reactive([
      { field: 'email', email: '138****8000@163.com' },
      { field: 'phone', phone: '138****8000' },
    ]);

    const onToggle = (next: boolean) => {
      console.log('toggle next:', next);
    };

    return { rows, onToggle };
  },
});
</script>

<style scoped>
.demo-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 320px;
}
</style>
