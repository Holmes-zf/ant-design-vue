<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

内容溢出时出现两侧箭头；`wheel` 把纵向滚轮转成横向滚动，`veil` 开启两端渐隐。也可通过实例方法 `scrollTo` / `scrollIntoView` 控制滚动。

## en-US

Arrows appear once content overflows; `wheel` turns vertical wheel events into horizontal scrolling and `veil` adds fade masks. Instance methods `scrollTo` / `scrollIntoView` control scrolling too.

</docs>
<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <ScrollBox ref="scrollBoxRef" wheel veil>
      <a-space :size="12">
        <a-tag v-for="item in items" :key="item" :color="item === '订单 06' ? 'blue' : ''">
          {{ item }}
        </a-tag>
      </a-space>
    </ScrollBox>

    <a-space :size="16">
      <a-button @click="scrollToStart">回到最前</a-button>
      <a-button @click="scrollToEnd">滚到最后</a-button>
    </a-space>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ScrollBox from '../ScrollBox.vue';

const items = Array.from({ length: 20 }, (_, index) => `订单 0${index + 1}`);

export default defineComponent({
  components: { ScrollBox },
  setup() {
    const scrollBoxRef = ref();
    const scrollToStart = () => scrollBoxRef.value?.scrollTo(0);
    const scrollToEnd = () => scrollBoxRef.value?.scrollTo(Number.MAX_SAFE_INTEGER);

    return { items, scrollBoxRef, scrollToStart, scrollToEnd };
  },
});
</script>
