<docs>
---
order: 2
title:
  zh-CN: 维度 + 多值
  en-US: Select + Multi Values
---

## zh-CN

`SelectMultiInput` 把「左下拉（维度）+ 右文本（值）」合成一个控件：文本按 `separators`（默认换行 / 空白 / 加号 / 逗号 / 分号）拆成多个条目，超过 `limitCount` 时提示并清空。开启 `isShowModal` 会出现批量入口，可在弹窗里一项一行地录入、核对后回填。外框、聚焦与错误三态都由容器统一承担。

## en-US

`SelectMultiInput` merges "left select (dimension) + right text (values)" into one control: the text is split into items by `separators` (newline / whitespace / plus / comma / semicolon by default), and exceeding `limitCount` shows a warning and clears the value. With `isShowModal` a batch entry appears, where values can be entered one per line, reviewed and back-filled. The frame, focus and error states are all owned by the container.

</docs>

<template>
  <div class="demo-wrap">
    <SelectMultiInput
      v-model:selected="selected"
      v-model:value="value"
      :options="options"
      :limit-count="5"
      is-show-modal
      placeholder="多个值用逗号 / 空格 / 换行分隔"
    />
    <div class="demo-tip">selected：{{ selected }}｜value：{{ value }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SelectMultiInput from '../SelectMultiInput.vue';

export default defineComponent({
  components: { SelectMultiInput },
  setup() {
    const options = [
      { label: '订单号', value: 'orderNo' },
      { label: '客户编码', value: 'customerCode' },
      { label: '物料编码', value: 'materialCode' },
    ];
    const selected = ref<string | number>('orderNo');
    const value = ref<string>('');
    return { options, selected, value };
  },
});
</script>

<style scoped>
.demo-wrap {
  width: 460px;
  max-width: 100%;
}

.demo-tip {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  word-break: break-all;
}
</style>
