<docs>
---
order: 3
title:
  zh-CN: 维度 + 多行值
  en-US: Select + Multi-line Values
---

## zh-CN

`SelectTextarea` 是「左下拉 + 右多行文本」的合成框，高度由文本域的 `rows` 决定，左下拉 `stretch` 跟随；外框、聚焦与错误三态由容器统一承担。`showCount` 统计的是**条目数 / 上限**（按内置分隔符拆分后的数量），不是字符数。

## en-US

`SelectTextarea` is a "select + multi-line text" composite whose height comes from `rows` of the textarea while the select stretches along; the frame, focus and error states belong to the container. `showCount` shows **items / limit** (the number of segments after splitting with the built-in rule), not characters.

</docs>

<template>
  <div class="demo-wrap">
    <SelectTextarea
      v-model:selected="selected"
      v-model:value="value"
      :options="options"
      :rows="3"
      :limit-count="5"
      show-count
      placeholder="每行一个单号，也可用逗号分隔"
    />
    <div class="demo-tip">selected：{{ selected }}｜条目数：{{ count }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import SelectTextarea from '../SelectTextarea.vue';

export default defineComponent({
  components: { SelectTextarea },
  setup() {
    const options = [
      { label: '订单号', value: 'orderNo' },
      { label: '外部单号', value: 'externalNo' },
    ];
    const selected = ref<string | number>('orderNo');
    const value = ref<string>('');
    const count = computed(
      () => value.value.split(/[\s+,，；;]+/).filter(item => item !== '').length,
    );
    return { options, selected, value, count };
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
}
</style>
