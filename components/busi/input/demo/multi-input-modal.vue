<docs>
---
order: 4
title:
  zh-CN: 批量录入弹窗
  en-US: Batch Entry Dialog
---

## zh-CN

`MultiInputModal` 负责批量录入：输入或粘贴时按分隔符自动折成「一项一行」，光标会跟着原位置走（回改中间某项不会跑位）；点确定时按同一份规则拆分、去空、去重后以数组回传。`value` 只作打开时的初值，关闭即清草稿，所以反复打开不会残留上一次的内容。

## en-US

`MultiInputModal` handles batch entry: typing or pasting folds separators into "one item per line" while the caret keeps its position (editing an item in the middle does not move it); on confirm the text is split by the same rule, emptied entries removed, duplicates dropped, and an array is returned. `value` is only the initial text on open and the draft is cleared on close, so reopening never keeps stale content.

</docs>

<template>
  <div class="demo-wrap">
    <a-button type="primary" @click="visible = true">批量录入</a-button>
    <div class="demo-tip">确认结果：{{ items.length ? items.join('、') : '（未录入）' }}</div>

    <MultiInputModal v-model:visible="visible" :value="value" @confirm="handleConfirm" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import MultiInputModal from '../MultiInputModal.vue';

export default defineComponent({
  components: { MultiInputModal },
  setup() {
    const visible = ref(false);
    const value = ref<string>('SO-001, SO-002');
    const items = ref<string[]>([]);

    const handleConfirm = (list: string[]) => {
      items.value = list;
    };

    return { visible, value, items, handleConfirm };
  },
});
</script>

<style scoped>
.demo-tip {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
