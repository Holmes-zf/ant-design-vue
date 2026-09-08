<docs>
---
order: 3
title:
  zh-CN: 框架图标全部展示
  en-US: All Framework Icons
---

## zh-CN

导入 `assets/iconfont-core/iconfont.js` 后，SVG sprite 会自动注入页面（也可在运行时通过 `window._iconfont_svg_string_5228714` 手动注入）。当前内置 **44** 个框架图标。点击图标可复制其 ID 到剪贴板。

## en-US

After importing `assets/iconfont-core/iconfont.js`, the SVG sprite is injected into the page automatically (or manually via `window._iconfont_svg_string_5228714` at runtime). There are **44** framework icons built in. Click an icon to copy its ID to the clipboard.

</docs>
<template>
  <div class="icon-all">
    <div v-for="icon in icons" :key="icon" class="icon-all__item" @click="onCopy(icon)">
      <SvgIcon :icon="icon" :size="28" />
      <span class="icon-all__name">{{ icon }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
// 引入框架图标资源：脚本执行时定义 window._iconfont_svg_string_5228714 并自动将 SVG sprite 注入页面
import '../assets/iconfont-core/iconfont.js';
import SvgIcon from '../SvgIcon.vue';
import { copyIconId, ensureSprite, getIconIds } from './sprite';

const GLOBAL_KEY = '5228714';

export default defineComponent({
  components: { SvgIcon },
  setup() {
    const icons = ref<string[]>([]);
    onMounted(() => {
      ensureSprite(GLOBAL_KEY);
      icons.value = getIconIds(GLOBAL_KEY);
    });
    return { icons, onCopy: copyIconId };
  },
});
</script>

<style lang="less" scoped>
.icon-all {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 8px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: #1677ff;
      color: #1677ff;
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15);
    }
  }

  &__name {
    font-size: 12px;
    color: #666;
    word-break: break-all;
    text-align: center;
    line-height: 1.4;

    .icon-all__item:hover & {
      color: #1677ff;
    }
  }
}
</style>
