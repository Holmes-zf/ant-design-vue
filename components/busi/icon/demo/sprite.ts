import { message } from 'ant-design-vue';

/**
 * 两套图标库共用的 sprite 工具
 * 各图库在 iconfont.cn 独立建项目，symbol id 前缀互不相同（icon-core-* / icon-YT*），
 * 因此多个 sprite 可共存于同一页面，SvgIcon 通过 `#icon-id` 引用即可。
 */

/** 已手动注入过 sprite 的图库（window 全局变量 key） */
const injected = new Set<string>();

const getSvgString = (globalKey: string): string =>
  (window as any)[`_iconfont_svg_string_${globalKey}`] || '';

/** 从 sprite 字符串中解析全部 symbol id */
export const getIconIds = (globalKey: string): string[] =>
  Array.from(getSvgString(globalKey).matchAll(/<symbol[^>]*id="([^"]+)"/g), m => m[1]);

/** 兜底注入：iconfont.js 脚本执行时会自动注入，若因时序问题未注入则手动补一次 */
export const ensureSprite = (globalKey: string) => {
  const svgString = getSvgString(globalKey);
  if (!svgString || injected.has(globalKey)) {
    return;
  }
  injected.add(globalKey);

  // 官方脚本与本函数时序不定：DOM 里已有该库任一 symbol 就说明已经注入过，不再重复补一份
  const ids = getIconIds(globalKey);
  if (ids.length && document.getElementById(ids[0])) {
    return;
  }

  const container = document.createElement('div');
  container.innerHTML = svgString;
  const svg = container.querySelector('svg');
  if (svg) {
    // 必须与 iconfont.js 官方注入保持同一套零尺寸样式：裸 `<svg>` 无 width/height 时按
    // 300×150 的默认替换元素尺寸参与布局（且是 inline），会在页面顶部撑出一片空白
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    document.body.insertBefore(svg, document.body.firstChild);
  }
};

/** 点击复制图标 ID 到剪贴板 */
export const copyIconId = (text: string) => {
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
