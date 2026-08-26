<docs>
---
order: 2
title:
  zh-CN: 容器
  en-US: Container
---

## zh-CN

`FormBox` 提供白色背景容器，用于包裹表单内容，可与 `FormRow` / `FormARow` 组合使用。

## en-US

`FormBox` provides a white background container for form content, and can be combined with `FormRow` / `FormARow`.

</docs>
<template>
  <FormBox>
    <a-form layout="vertical" style="padding-top: 20px">
      <FormRow :col-num="2">
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
      </FormRow>
    </a-form>
  </FormBox>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormBox from '../FormBox.vue';
import FormRow from '../FormRow.vue';

export default defineComponent({
  components: { FormBox, FormRow },
});
</script>
