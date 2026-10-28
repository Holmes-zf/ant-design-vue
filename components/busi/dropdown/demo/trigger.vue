<docs>
---
order: 1
title:
  zh-CN: 触发方式与弹出位置
  en-US: Trigger and Placement
---

## zh-CN

`trigger` 支持 `hover`（默认）、`click` 与 `contextmenu`，`placement` 决定弹出位置。两者都是透传属性，组件侧无需任何配置。

## en-US

`trigger` supports `hover` (default), `click` and `contextmenu`, while `placement` decides where the menu pops up. Both are pass-through props — no configuration on the component side.

</docs>

<template>
  <a-space :wrap="true">
    <Dropdown :trigger="['click']" placement="bottomLeft">
      <a-button>点击触发</a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1">新建</a-menu-item>
          <a-menu-item key="2">导入</a-menu-item>
        </a-menu>
      </template>
    </Dropdown>

    <Dropdown :trigger="['hover']" placement="bottomRight">
      <a-button>悬浮触发（右下）</a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1">新建</a-menu-item>
          <a-menu-item key="2">导入</a-menu-item>
        </a-menu>
      </template>
    </Dropdown>

    <Dropdown :trigger="['contextmenu']">
      <div class="demo-area">在此区域内点击右键</div>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1">刷新</a-menu-item>
          <a-menu-item key="2">清空缓存</a-menu-item>
        </a-menu>
      </template>
    </Dropdown>
  </a-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Dropdown from '../Dropdown.vue';

export default defineComponent({
  components: { Dropdown },
});
</script>

<style scoped>
.demo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 32px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
