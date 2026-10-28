<docs>
---
order: 1
title:
  zh-CN: 多行文本
  en-US: Textarea
---

## zh-CN

`FormTextarea` 是 `a-textarea` 的透传壳：`v-model:value` 与 `autoSize`、`showCount`、`maxlength` 等属性都经 `$attrs` 直达底层，组件本身不持有状态。清空按钮默认开启，可传 `:allow-clear="false"` 覆盖。

## en-US

`FormTextarea` is a pass-through wrapper of `a-textarea`: `v-model:value` plus `autoSize`, `showCount`, `maxlength` and so on reach the underlying component via `$attrs`, and the wrapper holds no state. The clear button is on by default — pass `:allow-clear="false"` to override.

</docs>

<template>
  <div class="demo-wrap">
    <FormTextarea
      v-model:value="value"
      :auto-size="{ minRows: 3, maxRows: 6 }"
      :maxlength="100"
      show-count
      placeholder="请输入备注"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormTextarea from '../FormTextarea.vue';

export default defineComponent({
  components: { FormTextarea },
  setup() {
    const value = ref<string>('');
    return { value };
  },
});
</script>

<style scoped>
.demo-wrap {
  width: 420px;
  max-width: 100%;
}
</style>
