<docs>
---
order: 1
title:
  zh-CN: 栅格布局与跨列
  en-US: Grid Layout & Column Span
---

## zh-CN

`FormARow` 基于 `a-row` / `a-col`，跨列使用 `FormACol` 的 `colspan`（相对逻辑列）或 `span`（24 栅格），普通子项支持 `data-colspan` / `data-span` 兼容写法。

## en-US

`FormARow` is based on `a-row` / `a-col`. Use `FormACol` with `colspan` (relative logical columns) or `span` (24-column grid) to span columns. Normal children also support `data-colspan` / `data-span`.

</docs>
<template>
  <a-form layout="vertical" style="width: 100%">
    <FormARow :col-num="3">
      <FormACol colspan="2" label="姓名" name="name">
        <a-input placeholder="占 2/3 宽度" />
      </FormACol>
      <a-form-item label="电话" name="phone">
        <a-input placeholder="等分 1/3 宽度" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input placeholder="等分 1/3 宽度" />
      </a-form-item>
      <a-form-item label="部门" name="dept" data-colspan="2">
        <a-input placeholder="data-colspan 兼容写法，占 2/3 宽度" />
      </a-form-item>
      <a-form-item label="岗位" name="position">
        <a-input placeholder="等分 1/3 宽度" />
      </a-form-item>
    </FormARow>
  </a-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormARow from '../FormARow.vue';
import FormACol from '../FormACol.vue';

export default defineComponent({
  components: { FormARow, FormACol },
});
</script>
