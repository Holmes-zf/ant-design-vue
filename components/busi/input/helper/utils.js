/**
 * 批量文本的分隔符工具（复刻自外部系统 `/@/utils/busi`）
 * + 弹层挂载容器（复刻自 `/@/utils/dispose/packaging` 的 `getPopupContainer`）
 *
 * 三个函数共用同一份分隔符规则：折行（`foldTextareaSeparators`）与拆分
 * （`formatTextaeraToArray`）必须是同一份规则，否则折好的文本会拆不回来。
 */

/**
 * 批量文本的默认分隔符规则：换行 / 空白（含空格、Tab）/ 加号 / 逗号 / 分号（半角 + 全角）。
 */
export const TEXTAREA_SEPARATORS = /[\s+,，；;]+/g;

/**
 * 分隔符规则归一 → 带 `g` 的正则（供 `replace` / `split` 直接用）。
 *
 * 不传（或空值）→ 返回内置默认 `TEXTAREA_SEPARATORS`（含 `\s`，已覆盖换行）。
 * 支持：`RegExp`（缺 `g` 补 `g`，`/g` 实例原样复用）/ 字面量字符串 `','` /
 * 字面量数组 `[',', '，']`（按字面量处理，不做正则解释）。
 * **约定：自定义规则必须能匹配换行**——折行会把分隔符换成换行，规则不含换行就拆不回来。
 */
export const normalizeSeparators = separators => {
  if (!separators) return TEXTAREA_SEPARATORS;
  if (separators instanceof RegExp) {
    // 复用 /g 实例（replace / split 各自管理 lastIndex）；缺 g 或带 y 时重建
    return separators.global && !separators.sticky
      ? separators
      : new RegExp(separators.source, `${separators.flags.replace(/[gy]/g, '')}g`);
  }
  const list = [].concat(separators).filter(item => typeof item === 'string' && item);
  if (!list.length) return TEXTAREA_SEPARATORS;
  // 字面量按"字符"用，必须转义正则元字符：不转义时 "." 会变成"任意字符"（整串被吃掉）、
  // "|" 会变成"或"（空分支在每个位置都命中）、"*" 直接抛错
  const escape = item => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:${list.map(escape).join('|')})+`, 'g');
};

/**
 * 把分隔符折叠成换行，用于 textarea 内「一项一行」展示（批量录入弹窗）。
 */
export const foldTextareaSeparators = (str, separators) => {
  if (typeof str !== 'string') return str;
  return str.replace(normalizeSeparators(separators), '\n');
};

/**
 * 按分隔符拆分、去空、去重（批量录入确认时归一为数组）。
 */
export const formatTextaeraToArray = (str, separators) => {
  let strArr = [];
  if (str) {
    strArr = str.split(normalizeSeparators(separators)).filter(i => i !== '');
  }
  return [...new Set(strArr)];
};

/**
 * 弹层挂载容器：挂在「合成框（anchor）的上一层」，避免被定高容器裁切。
 * 用锚点定位而不是 `parentNode.parentNode`：内部再加 wrapper 也不会错位。
 */
export const getPopupContainer = (triggerNode, anchor) => {
  if (!anchor) return document.body;
  const root = triggerNode?.closest?.(anchor);
  const container = root?.parentElement ?? triggerNode?.parentElement;
  return container ?? document.body;
};
