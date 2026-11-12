<docs>
---
order: 2
title:
  zh-CN: 透传属性用法
  en-US: Forwarded attributes
---

## zh-CN

未知属性（`class` / `style` / `id` 等）会落到组件根节点：`EyeSwitch` 落根 `div`（非 a-switch / FormInput），`InputSwitch` 同样落根 `div`，不会进输入框；`EyeSwitch` 还可用 `icon` 插槽在眼睛后追加内容。

## en-US

Unknown attributes (`class` / `style` / `id`, ...) land on the component root: for `EyeSwitch` on the root `div` (not on a-switch / FormInput), and likewise for `InputSwitch` on the root `div`, never reaching the input; `EyeSwitch` also accepts the `icon` slot after the eye button.

</docs>
<template>
  <div class="demo-rows">
    <EyeSwitch class="demo-eye" :row="row" field="email">
      <template #icon>
        <span class="demo-extra">已脱敏</span>
      </template>
    </EyeSwitch>
    <InputSwitch v-model:checked="checked" class="demo-input-switch" style="width: 320px" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import EyeSwitch from '../EyeSwitch.vue';
import InputSwitch from '../InputSwitch.vue';

export default defineComponent({
  components: { EyeSwitch, InputSwitch },
  setup() {
    const row = reactive({ email: '138****8000@163.com' });
    const checked = ref(true);
    return { row, checked };
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
.demo-extra {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
