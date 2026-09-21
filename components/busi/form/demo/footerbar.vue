<docs>
---
order: 4
title:
  zh-CN: 底部操作栏
  en-US: Footer Bar
---

## zh-CN

`FormFooter` 用于表单底部操作区，默认随内容滚动；`fixed` 时改为 `position: absolute` 常驻底部（定位锚点由父容器提供，组件自身不创建），`inset` 控制左右内缩（默认 `12px`，`0` 即通栏）。内容通常使用 `RadiusButton`，彼此左间距 16px。

## en-US

`FormFooter` is the action bar at the bottom of a form and scrolls with the content by default; with `fixed` it becomes `position: absolute` and sticks to the bottom (the positioning context is provided by the parent container). `inset` controls the horizontal inset (default `12px`, `0` for full width). Its content is usually `RadiusButton`, with 16px spacing on the left.

</docs>
<template>
  <div style="width: 100%">
    <div class="footer-body">表单内容区（默认形态：底栏随内容滚动）</div>
    <FormFooter>
      <RadiusButton>取消</RadiusButton>
      <RadiusButton type="primary">保存</RadiusButton>
    </FormFooter>

    <div class="footer-fixed-demo">
      <div class="footer-fixed-body">固定形态：底栏常驻容器底部</div>
      <FormFooter fixed :inset="0">
        <RadiusButton>取消</RadiusButton>
        <RadiusButton type="primary">确定</RadiusButton>
      </FormFooter>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormFooter from '../FormFooter.vue';
import RadiusButton from '../../button/RadiusButton.vue';

export default defineComponent({
  components: { FormFooter, RadiusButton },
});
</script>

<style lang="less" scoped>
.footer-body,
.footer-fixed-body {
  padding: 12px;
  background: #f0f0f7;
}

.footer-fixed-demo {
  position: relative;
  min-height: 160px;
  background: #f0f0f7;

  .footer-fixed-body {
    padding-bottom: 76px;
  }
}
</style>
