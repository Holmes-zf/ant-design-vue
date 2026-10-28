<docs>
---
order: 0
title:
  zh-CN: 基本用法
  en-US: Basic usage
---

## zh-CN

触发元素放默认插槽、菜单放 `overlay` 插槽；`trigger`、`placement`、`v-model:visible`、`@visibleChange` 等属性与事件由根节点自动透传给 `a-dropdown`。

## en-US

Put the trigger element in the default slot and the menu in the `overlay` slot; props and events such as `trigger`, `placement`, `v-model:visible` and `@visibleChange` are inherited by the root node and passed through to `a-dropdown`.

</docs>

<template>
  <a-space :wrap="true">
    <Dropdown @visibleChange="handleVisibleChange">
      <a-button type="primary">
        操作
        <DownOutlined />
      </a-button>
      <template #overlay>
        <a-menu @click="handleClick">
          <a-menu-item key="edit">编辑</a-menu-item>
          <a-menu-item key="copy">复制</a-menu-item>
          <a-menu-item key="delete" danger>删除</a-menu-item>
        </a-menu>
      </template>
    </Dropdown>
    <span class="demo-tip">visible：{{ visible }}｜最近操作：{{ lastAction || '（无）' }}</span>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';
import Dropdown from '../Dropdown.vue';

export default defineComponent({
  components: { Dropdown, DownOutlined },
  setup() {
    const visible = ref(false);
    const lastAction = ref('');

    const handleVisibleChange = (open: boolean) => {
      visible.value = open;
    };
    const handleClick = ({ key }: { key: string }) => {
      lastAction.value = key;
    };

    return { visible, lastAction, handleVisibleChange, handleClick };
  },
});
</script>

<style scoped>
.demo-tip {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
