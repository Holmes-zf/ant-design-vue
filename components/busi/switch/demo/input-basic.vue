<docs>
---
order: 1
title:
  zh-CN: 文本框内嵌开关
  en-US: Inline switch in a text box
---

## zh-CN

`checked` 使用 `v-model:checked` 双向绑定；`openText` / `closeText` 可自定义开启 / 关闭态文案，不传回落内置「启用 / 禁用」。

## en-US

Bind `checked` with `v-model:checked`; `openText` / `closeText` customize the on / off text, falling back to the built-in text when omitted.

</docs>
<template>
  <div class="demo-rows">
    <InputSwitch v-model:checked="enabled" />
    <InputSwitch v-model:checked="autoSync" open-text="自动同步" close-text="手动同步" />
    <InputSwitch checked disabled />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import InputSwitch from '../InputSwitch.vue';

export default defineComponent({
  components: { InputSwitch },
  setup() {
    const enabled = ref(true);
    const autoSync = ref(false);
    return { enabled, autoSync };
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
