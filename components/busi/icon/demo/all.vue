<docs>
---
order: 1
title:
  zh-CN: 全部图标
  en-US: All Icons
---

## zh-CN

导入 `assets/iconfont/iconfont.js` 后，SVG sprite 会自动注入页面（也可在运行时通过 `window._iconfont_svg_string_5104230` 手动注入）。通过 `icon` 属性引用 `icon-YTxxx` 图标 ID，当前内置 **142** 个业务图标。点击图标可复制其 ID 到剪贴板。

## en-US

After importing `assets/iconfont/iconfont.js`, the SVG sprite is injected into the page automatically (or manually via `window._iconfont_svg_string_5104230` at runtime). Reference icons by their `icon-YTxxx` ID through the `icon` prop. There are **142** business icons built in. Click an icon to copy its ID to the clipboard.

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
import { message } from 'ant-design-vue';
// 引入图标资源：脚本执行时定义 window._iconfont_svg_string_5104230 并自动将 SVG sprite 注入页面
import '../assets/iconfont/iconfont.js';
import SvgIcon from '../SvgIcon.vue';

const copyText = (text: string) => {
  // 优先使用 Clipboard API（需 secure context，localhost 下可用）
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => message.success(`已复制: ${text}`))
      .catch(() => message.error('复制失败，请手动复制'));
    return;
  }
  // 降级方案：execCommand
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  message.success(`已复制: ${text}`);
};

const getIconIds = (): string[] => {
  const sprite = (window as any)._iconfont_svg_string_5104230 || '';
  return Array.from(sprite.matchAll(/<symbol[^>]*id="([^"]+)"/g), m => m[1]);
};

const ensureSprite = () => {
  if (document.querySelector('body svg symbol')) {
    return;
  }
  const svgString = (window as any)._iconfont_svg_string_5104230;
  if (svgString) {
    const container = document.createElement('div');
    container.innerHTML = svgString;
    document.body.insertBefore(container.firstChild, document.body.firstChild);
  }
};

export default defineComponent({
  components: { SvgIcon },
  setup() {
    const icons = ref<string[]>([]);
    onMounted(() => {
      ensureSprite();
      icons.value = getIconIds();
    });
    return { icons, onCopy: copyText };
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
