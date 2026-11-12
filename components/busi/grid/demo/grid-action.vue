<docs>
---
order: 1
title:
  zh-CN: 操作列折叠
  en-US: Action Column Folding
---

## zh-CN

行内超过 `max`（默认 3）个按钮时自动折叠进「更多」悬浮面板；折叠区里的 `Popconfirm` 等二级弹层显隐自动接管。第二个示例演示 `max="2"` 字符串写法与 `align="right"`。

## en-US

Buttons beyond `max` (default 3) fold into the hover "more" panel; popups such as `Popconfirm` inside the folded area are reconciled automatically. The second sample shows the string `max="2"` and `align="right"`.

</docs>
<template>
  <a-space direction="vertical" :size="24" style="width: 100%">
    <GridAction>
      <a @click="log('编辑')">编辑</a>
      <a @click="log('复制')">复制</a>
      <a class="success-color" @click="log('通过')">通过</a>
      <a class="error-color" @click="log('删除')">删除</a>
      <Popconfirm title="确认作废该记录？" @confirm="log('作废')">
        <a>作废</a>
      </Popconfirm>
      <a @click="log('日志')">日志</a>
    </GridAction>

    <div style="width: 320px">
      <GridAction max="2" align="right" more-text="更多">
        <a @click="log('编辑')">编辑</a>
        <a @click="log('复制')">复制</a>
        <a class="error-color" @click="log('删除')">删除</a>
        <a @click="log('日志')">日志</a>
      </GridAction>
    </div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GridAction from '../GridAction.vue';
import Popconfirm from '../../popconfirm/Popconfirm.vue';

export default defineComponent({
  name: 'DemoGridAction',
  components: { GridAction, Popconfirm },
  setup() {
    const log = (action: string) => {
      // eslint-disable-next-line no-console
      console.log('action:', action);
    };
    return { log };
  },
});
</script>
