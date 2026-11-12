<docs>
---
order: 2
title:
  zh-CN: 查询 / 重置按钮对
  en-US: Query / Reset Button Pair
---

## zh-CN

demo 用一个 mock 的 `grid` 对象（只实现 `commitProxy`），点击「查询」会依次触发 `beforeQueryCallback` → `grid.commitProxy('_init')` → `queryCallback`；点击「重置」触发 `resetCallback`。原实现的计数刷新副作用由宿主监听回调自行处理。

## en-US

The demo uses a mock `grid` object implementing `commitProxy` only. Clicking "query" fires `beforeQueryCallback` → `grid.commitProxy('_init')` → `queryCallback`; "reset" fires `resetCallback`. The original counter-refresh side effect is owned by the host via these callbacks.

</docs>
<template>
  <a-space direction="vertical" :size="12">
    <GridQryBtn :grid="grid" @beforeQueryCallback="log" @queryCallback="log" @resetCallback="log" />
    <a-typography-text type="secondary">{{ events.join(' → ') }}</a-typography-text>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import GridQryBtn from '../GridQryBtn.vue';

export default defineComponent({
  name: 'DemoGridQryBtn',
  components: { GridQryBtn },
  setup() {
    // mock 表格实例：不引 vxe-grid，只实现组件会调用的 commitProxy
    const grid = {
      commitProxy: (code: string) => {
        // eslint-disable-next-line no-console
        console.log('mock grid.commitProxy:', code);
      },
    };
    const events = ref<string[]>([]);
    const log = (name: string) => {
      events.value = [...events.value, name].slice(-6);
    };
    return { grid, events, log };
  },
});
</script>
