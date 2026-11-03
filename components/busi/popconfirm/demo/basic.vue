<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic Usage
---

## zh-CN

默认点击触发元素弹出气泡，`#title` 自定义描述，`@confirm` / `@cancel` 接回调。透传 `a-popconfirm` 的 `trigger`、`disabled` 等属性。

## en-US

Click the trigger element to open the bubble; `#title` customizes the description and `@confirm` / `@cancel` handle the actions. Props such as `trigger` and `disabled` are forwarded to `a-popconfirm`.

</docs>
<template>
  <a-space direction="vertical" :size="16">
    <a-space :wrap="true" :size="24">
      <Popconfirm
        title="确认删除该条数据？"
        @confirm="handleConfirm('删除')"
        @cancel="handleCancel"
      >
        <a style="color: #f6530f">删除</a>
      </Popconfirm>

      <Popconfirm
        v-model:visible="visible"
        :show-cancel="false"
        ok-text="知道了"
        @confirm="visible = false"
      >
        <a>受控显隐</a>
      </Popconfirm>

      <Popconfirm title="禁用后该客户不可下单" trigger="click" @confirm="handleConfirm('禁用')">
        <a-button>禁用</a-button>
      </Popconfirm>
    </a-space>
    <div>最近操作：{{ lastAction }}</div>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Popconfirm from '../Popconfirm.vue';

export default defineComponent({
  components: { Popconfirm },
  setup() {
    const visible = ref(false);
    const lastAction = ref('');
    const handleConfirm = (name: string) => {
      lastAction.value = `${name}：确认`;
    };
    const handleCancel = () => {
      lastAction.value = '删除：取消';
    };
    return { visible, lastAction, handleConfirm, handleCancel };
  },
});
</script>
