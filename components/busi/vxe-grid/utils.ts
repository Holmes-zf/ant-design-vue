/**
 * DcVxeGrid 独立工具方法（复刻自业务系统 src/hooks/utils.js 与依赖的基础工具）
 *
 * 解耦说明：
 * - copyTextToClipboard：原依赖 /@/utils/busi（含 i18n $message 提示）→ 本地实现，复制成功与否由调用方处理提示
 * - storageLocal：原依赖 /@/utils/storage（带系统前缀隔离）→ 本地实现，统一使用 `dcGrid-` 前缀
 */
import { isString } from 'lodash-es';

// ---------- 通用空值判断（复刻 /@/utils/dispose/packaging isEmptyValue） ----------
export const isEmptyValue = (value: any, options: any = {}) => {
  const { includeZero = false, includeFalse = false, includeNaN = true, includeTrim = true } = options;

  // null 或 undefined
  if (value == null) {
    return true;
  }

  // NaN
  if (includeNaN && Number.isNaN(value)) {
    return true;
  }

  // number: 0 是否视为空？
  if (typeof value === 'number') {
    if (includeZero && value === 0) return true;
    return false; // 其他数字非空
  }

  // boolean
  if (typeof value === 'boolean') {
    return includeFalse ? true : false;
  }

  // string：去除空白后是否为空
  if (typeof value === 'string') {
    return includeTrim ? value.trim() === '' : value === '';
  }

  // array
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // object（普通对象）
  if (typeof value === 'object') {
    // 排除 Date、RegExp 等特殊对象
    if (value instanceof Date || value instanceof RegExp) {
      return false; // 这些对象即使"空"也有意义
    }
    return Object.keys(value).length === 0;
  }

  // function 等其他类型视为非空
  return false;
};

// ---------- 剪贴板（复刻 /@/utils/busi copyTextToClipboard） ----------
export function copyTextToClipboard(
  input: string,
  { target = document.body, keepSelectState = true }: any = {}
) {
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement;
  element.value = input;

  element.setAttribute('readonly', '');

  element.style.contain = 'strict';
  (element.style as any).position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt';

  const selection = document.getSelection();
  let originalRange: Range;
  if (selection && selection.rangeCount > 0) {
    originalRange = selection.getRangeAt(0);
  }

  target.append(element);
  element.select();

  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch (e) {
    throw e;
  }

  element.remove();

  if (keepSelectState && originalRange && selection) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  if (previouslyFocusedElement) {
    (previouslyFocusedElement as HTMLElement).focus();
  }
  return isSuccess;
}

// ---------- 本地存储（复刻 /@/utils/storage ProxyStorage，前缀隔离） ----------
const STORAGE_PREFIX = 'dcGrid-';

class ProxyStorage {
  storage: Storage;
  constructor(storageModel: Storage) {
    this.storage = storageModel;
  }
  // 取
  getItem(key: string) {
    try {
      return JSON.parse(this.storage.getItem(`${STORAGE_PREFIX}${key}`));
    } catch (e) {
      return undefined;
    }
  }
  // 存
  setItem(key: string, value: any) {
    this.storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  }
  // 删
  removeItem(key: string) {
    this.storage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
  // 清空
  clear() {
    this.storage.clear();
  }
  // 获取命名key值, 仅用于对象数据可用
  getNamespaceItem(namespace: string, key: string) {
    const item = this.getItem(namespace);
    if (!item || Object.prototype.toString.call(item) !== '[object Object]') return;
    return item[key];
  }
  // 设置命名key值，仅用于对象数据可用
  setNamespaceItem(namespace: string, key: string, value: any) {
    let item = this.getItem(namespace);
    // 为空或者非对象，则重置为对象
    if (!item || Object.prototype.toString.call(item) !== '[object Object]') {
      item = {};
    }
    item[key] = value;
    this.setItem(namespace, item);
  }
}

export const storageSession = new ProxyStorage(sessionStorage);
export const storageLocal = new ProxyStorage(localStorage);

// ---------- 表格列宽缓存（复刻 src/hooks/utils.js） ----------
// 表格列宽缓存
export const storageColumns = ($grid: any, id: string) => {
  const cacheColumns = $grid.getColumns().map((item: any) => {
    // 先仅只进行缓存需要，后续可扩展
    return {
      field: item.field,
      title: item.title,
      renderWidth: item.renderWidth,
    };
  });
  storageLocal.setNamespaceItem('tableColumnsConfig', id, cacheColumns);
};

// 修改列宽
export const repairColumnWidth = (menuCode: string, item: any) => {
  const cacheColumns = storageLocal.getNamespaceItem('tableColumnsConfig', menuCode) || [];
  const title = getColumnTitle(item.title);
  const cItem = cacheColumns.find(
    (cache: any) => (item.field && cache.field == item.field) || cache?.title == title
  );
  return getColumnWidth(item, cItem);
};

// 动态计算每列列宽 优化调整为独立项去处理
export const getColumnWidth = (item: any, cItem: any) => {
  // 如果该列title是computed，则需要手动获取title才能计算宽度
  const title = getColumnTitle(item.title);
  // 统一序号，选中框为46px
  if (['seq', 'checkbox'].includes(item.type)) {
    item.minWidth = item.minWidth || 46;
    item.width = item.width || 46;
  }
  // 序号，checkbox，操作列 业务中自定义列宽
  if (!['seq', 'checkbox'].includes(item.type) && item.field) {
    let width = getTextWidth(title);
    width = width > 100 ? width : 100;
    item.minWidth = item.minWidth && item.minWidth > width ? item.minWidth : width;
  }
  // renderWidth为0或者不存在则不处理
  if (cItem && cItem.renderWidth) {
    item.width = cItem && cItem.renderWidth;
  }
  return item;
};

// 获取文本宽度
export const getTextWidth = (str: string, font = '14px sans-serif') => {
  let width = 0,
    _width = 60; // 60表示padding加上排序的宽度
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(str);
  return Math.ceil(metrics.width + _width); // 返回像素宽度;
};

// 获取title 兼容title是computed，则需要手动获取title才能计算宽度
export const getColumnTitle = (title: any) => {
  return title && typeof title === 'object' ? title.value : title;
};

// 双击头复制列
export const gridHeaderCellDblclick = (opts: any, formatter?: (row: any, opts: any) => any) => {
  const { column, $grid } = opts;
  if (column?.slots?.default == 'operate') return;
  const { visibleData } = $grid.getTableData() || {};
  const text = visibleData
    ?.map((item: any) => {
      return formatter ? formatter(item, opts) : item[column.field];
    })
    .join('\n');
  const isCopy = copyTextToClipboard(text, {
    keepSelectState: false,
  });
  return isCopy;
};

// ---------- 表格字段默认格式化函数（复刻 custom/render/utils defaultFormatter） ----------
export const defaultFormatter = ({ cellValue, column }: any) => {
  const { field } = column;
  const excludes = ['createTime'];
  if (/time|date|Time|Date/.test(field) && !excludes.includes(field)) {
    const zhDateReg = new RegExp(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(:\d{2})$/);
    const enDateReg = new RegExp(/^(\d{2}:\d{2})(:\d{2})( \d{4}-\d{2}-\d{2})$/);
    if (!isString(cellValue) || isEmptyValue(cellValue) || cellValue == '-') {
      return cellValue || '-';
    }
    return String(cellValue).replace(zhDateReg, '$1').replace(enDateReg, '$1$3');
  }
  return isEmptyValue(cellValue) ? '-' : cellValue;
};
