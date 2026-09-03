/**
 * 表格排序方法（复刻自业务系统 src/utils/sort/columnsSort.js 与 index.js）
 *
 * 解耦说明：
 * - 时间排序原依赖 /@/utils/dayjs（封装 dayjs）→ 直接使用 dayjs
 * - dictSort（字典排序）依赖 Vuex store 字典 getter → 移除，字典排序场景
 *   请使用 customSort 传入 formatter 自行处理
 */
import dayjs from 'dayjs';
import { isEmptyValue } from './utils';

// 语言不标准会报错，暂不使用
// const localeCompare = Intl.Collator('zh-CN');

// 分类函数
const getDataType = (str: any) => {
  // 1. 全面数字判断（支持科学计数法、正负号、小数）
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(str)) {
    return 'number';
  }
  // 2. 精准时间正则（覆盖中英文常见格式：2025-12-03 / 2025/12/03 / 2025年12月3日 / 03-12-2025 / 14:30:45 / ISO 等）
  const timePattern =
    /^(\d{4}[-\/年](0[1-9]|1[0-2])[-\/月](0[1-9]|[12]\d|3[01])[日]?|(0[1-9]|[12]\d|3[01])[-\/](0[1-9]|1[0-2])[-\/]\d{4}|([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)?|\d{4}[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12]\d|3[01])[T\s]([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)?)$/;
  if (timePattern.test(str)) {
    return 'time';
  }
  // 默认排序
  return 'default';
};

export const emptySort = (order: string, aEmpty: boolean, bEmpty: boolean) => {
  if (aEmpty && bEmpty) {
    return 0;
  }
  // 判断一个即可
  if (order == 'desc') {
    return aEmpty ? 1 : -1;
  }
  return aEmpty ? -1 : 1;
};

// 自动排序
export const autoSort = (order: string, a: any, b: any) => {
  const type = getDataType(a);
  if (type == 'number') {
    return numberSort(order, a, b);
  }
  if (type == 'time') {
    return timeSort(order, a, b);
  }
  return stringSort(order, a, b);
};

// 默认排序 Unicode字典序
export const defaultSort = (order: string, a: any, b: any) => {
  if (a == b) {
    return 0;
  }
  if (order == 'desc') {
    return b > a ? 1 : -1;
  }
  return a > b ? 1 : -1;
};

// 字符串排序 统一采用感知排序 根据语言自然顺序处理
export const stringSort = (order: string, a: string, b: string) => {
  if (order == 'desc') {
    return a.localeCompare(b);
  }
  return b.localeCompare(a);
};

// 数字排序
export const numberSort = (order: string, a: any, b: any) => {
  if (order == 'desc') {
    return Number(b) - Number(a);
  }
  return Number(a) - Number(b);
};

// 时间排序
const toDay = (v: any) => {
  const d = dayjs(v);
  return d.isValid() ? d : dayjs(0);
};
export const timeSort = (order: string, a: any, b: any) => {
  if (order == 'desc') {
    return toDay(b).isAfter(toDay(a)) ? 1 : -1;
  }
  return toDay(a).isAfter(toDay(b)) ? 1 : -1;
};

// 自定义排序
export const customSort = (order: string, a: any, b: any, opts: any) => {
  const { formatter } = opts || {};
  const aVal = formatter?.(a) || a;
  const bVal = formatter?.(b) || b;
  return autoSort(order, aVal, bVal);
};

/**
 * 仅单次排序
 * @param {Array} data - 数据
 * @param {Array} sortList - 排序配置
 * @param {Array} columns - 列配置
 *  @param {String} field - 字段key
 *  @param {Object} _sortOpts - 字段排序设置
 *    @param {string} [type] - 排序类型 number / time / custom
 *    @param {Object} [sortOpts] - 字段排序设置（custom 时需提供 formatter）
 */
export const columnsSort = (data: any[], sortList: any[], columns?: any[]) => {
  const field = sortList[0].field;
  const order = sortList[0].order;
  const config = columns?.find((item: any) => item.field === field);
  return data.sort((a: any, b: any) => {
    // 空判断逻辑
    const isEmptyA = isEmptyValue(a[field]);
    const isEmptyB = isEmptyValue(b[field]);
    if (isEmptyA || isEmptyB) {
      return emptySort(order, isEmptyA, isEmptyB);
    }
    try {
      // 无配置，默认自动化排序
      if (!config?._sortOpts) return autoSort(order, a[field], b[field]);
      const sortType = config?._sortOpts?.type;
      // 数字
      if (sortType == 'number') {
        return numberSort(order, a[field], b[field]);
      }
      // 时间
      if (sortType == 'time') {
        return timeSort(order, a[field], b[field]);
      }
      // 字典（原 dictSort 依赖 Vuex 字典，解耦后请使用 custom 传入 formatter）
      // 自定义函数
      if (sortType == 'custom') {
        return customSort(order, a[field], b[field], config.sortOpts);
      }
      // 未扩展的 默认Unicode字典序
      return defaultSort(order, a[field], b[field]);
    } catch (error) {
      // 数据不可控的意外报错 走默认Unicode字典序
      return defaultSort(order, a[field], b[field]);
    }
  });
};
