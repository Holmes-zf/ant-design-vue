<docs>
---
order: 3
title:
  zh-CN: 标题栏
  en-US: Title Bar
---

## zh-CN

`FormTitle` 用于表单区块标题，默认插槽为标题文案，`tool` 插槽为右侧操作区，`inset` 控制左右内缩（默认 `20px`，`0` 表示与宿主容器对齐）。

## en-US

`FormTitle` renders a form section title. The default slot is the title text, the `tool` slot is the action area on the right, and `inset` controls the horizontal inset (default `20px`, `0` aligns with the host container).

</docs>
<template>
  <div style="width: 100%">
    <FormTitle>
      基础信息
      <template #tool>
        <a-button type="link" size="small">编辑</a-button>
      </template>
    </FormTitle>
    <div class="title-inset-demo">
      <FormTitle :inset="0">无内缩（与容器对齐）</FormTitle>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormTitle from '../FormTitle.vue';

export default defineComponent({
  components: { FormTitle },
});
</script>

<style lang="less" scoped>
.title-inset-demo {
  padding: 0 12px;
  border-left: 2px solid #0032a0;
}
</style>
