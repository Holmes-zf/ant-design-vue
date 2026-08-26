<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

通过 `colNum` 控制每行列数，子项自动等分宽度。子项通常为 `a-form-item`。

## en-US

`colNum` controls the number of columns per row, children are evenly divided. Children are usually `a-form-item`.

</docs>
<template>
  <a-form layout="vertical" style="width: 100%">
    <FormRow :col-num="4">
      <a-form-item label="姓名" name="name">
        <a-input placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item label="电话" name="phone">
        <a-input placeholder="请输入电话" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item label="部门" name="dept">
        <a-input placeholder="请输入部门" />
      </a-form-item>
      <a-form-item label="岗位" name="position">
        <a-input placeholder="请输入岗位" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-input placeholder="请输入备注" />
      </a-form-item>
    </FormRow>
  </a-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormRow from '../FormRow.vue';

export default defineComponent({
  components: { FormRow },
});
</script>
