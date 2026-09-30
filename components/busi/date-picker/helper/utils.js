import Dayjs from './dayjs';
import dayjsFormat from './format';

/**
 * 业务组件无 i18n/cookie 基建：语言恒为 zh_CN。
 * 显示格式表的双语能力保留在 format.js / getDisplayFormat 内，
 * 将来接入语言服务时只需改这里一处。
 */
export const getLang = () => 'zh_CN';

/**
 * 取「当前语言的显示格式」：`props.format` 反查 dayjsFormat.correct → 按语言取对应显示格式
 *
 * 值通道恒用 `props.format`，显示通道用本函数的结果（中英双语显示格式）。
 * 抽成共享函数的理由：`FormDatePicker`（外壳，负责 `:format` 绑定）与 `FormUTCDatePicker`
 * （包装层，负责按显示文本判定"输入框候选值"是否完整）都需要同一口径。
 *
 * @param {string} format 值格式（如 "YYYY-MM-DD HH:mm"）
 * @param {string} lang   当前语言（如 "zh_CN" / "en"）
 */
export const getDisplayFormat = (format, lang) => {
  const formatObj = lang == 'zh_CN' ? dayjsFormat.zh : dayjsFormat.en;
  const key = Object.keys(dayjsFormat.correct).find(k => dayjsFormat.correct[k] == format);
  return key ? formatObj[key] : format;
};

/**
 * 只能选择目的口岸时区范围 精细化逻辑控制
 * @param {*} current 控件当前时间
 * @param {*} timeLimit 后台接口配置的小时
 * @param {*} timeZone 时区
 * @param {*} extObj 扩展对象
 * 目前默认时间格式为YYYY-MM-DD HH:mm，后续如果有其他格式需扩展支持
 * @returns
 */
export const disTimeZone = (current, timeLimit, timeZone, extObj) => {
  if (!current) return;
  const cur = Dayjs.getCurrentTimeZone(timeZone);
  // 原控制数据数据 TimeLimit 不存在或者0表示没有上限限制
  const upperLimit = timeLimit ? Dayjs.getSomeDate(cur, 'subtract', timeLimit, 'hour') : undefined;
  // second minute
  const lowerLimit = cur.endOf('minute');
  // 格式化数据
  const currentFmt = current.format('YYYY-MM-DD');
  const upperLimitFmt = Dayjs.getDayjsTime(upperLimit?.format('YYYY-MM-DD'));
  const lowerLimitFmt = Dayjs.getDayjsTime(lowerLimit?.format('YYYY-MM-DD'));
  // 24小时这个需要支持配置（配置项：要不要限制，要限制多少个小时），下次客户调整时间范围限制不需要重新发版
  const current1 = Dayjs.getDayjsTime(`${currentFmt} 00:00`);
  const current2 = Dayjs.getDayjsTime(`${currentFmt} 23:59`);
  // 则动态控制
  if (
    timeLimit &&
    extObj?.validateValue &&
    currentFmt == extObj?.validateValue.format('YYYY-MM-DD') &&
    (extObj?.validateValue > lowerLimit || extObj?.validateValue < upperLimit)
  ) {
    extObj?.callback && extObj?.callback(true);
    return true;
  }
  return current && (current1 > lowerLimitFmt || (upperLimit && current2 < upperLimitFmt));
};

const rangeTime = (start, end) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

/**
 * 只能选择目的口岸时区时间 精细化范围控制
 * @param {*} current 控件当前时间
 * @param {*} timeLimit 后台接口配置的小时
 * @param {*} timeZone 时区
 * @returns
 */
export const disTimeZoneTime = (current, timeLimit, timeZone) => {
  if (!current) return;
  const cur = Dayjs.getCurrentTimeZone(timeZone);
  const upperLimit = timeLimit ? Dayjs.getSomeDate(cur, 'subtract', timeLimit, 'hour') : undefined;
  // second minute
  const lowerLimit = cur.endOf('minute');
  return {
    disabledHours: () =>
      rangeTime(0, 24)
        .map(h => {
          const m = Dayjs.dayjs().minute();
          const s = Dayjs.dayjs().second();
          const t = Dayjs.getDayjsTime(`${current.format('YYYY-MM-DD')} ${h}:${m}:${s}`);
          return (t > lowerLimit || (upperLimit && t < upperLimit)) && h;
        })
        .filter(o => o == 0 || !!o),
    disabledMinutes: () =>
      rangeTime(0, 60)
        .map(m => {
          const s = Dayjs.dayjs().second();
          const t = Dayjs.getDayjsTime(`${current.format('YYYY-MM-DD HH')}:${m}:${s}`);
          return (t > lowerLimit || (upperLimit && t < upperLimit)) && m;
        })
        .filter(o => o == 0 || !!o),
    disabledSeconds: () =>
      rangeTime(0, 60)
        .map(s => {
          const t = Dayjs.getDayjsTime(`${current.format('YYYY-MM-DD HH:mm')}:${s}`);
          return (t > lowerLimit || (upperLimit && t < upperLimit)) && s;
        })
        .filter(o => o == 0 || !!o),
  };
};

/**
 * 尺寸口径统一工具（复刻自外部系统 `/@/utils/dispose/packaging` 的 `toCssSize`）
 *
 * 数字/纯数字串补 px；带单位与 CSS 关键字透传；空值与非有限数值不设宽度。
 * @param {*} value 宽度值
 * @param {*} fallback 给不出尺寸时的兜底（不传即 undefined，宽度不生效）
 */
export const toCssSize = (value, fallback) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return fallback;
  }
  if (typeof value === 'number') {
    // 数值通道语义 = 像素数；非有限数在 CSS 里没有对应的长度表达，
    // 透传只会往内联样式写一个必然失效的值 ⇒ 视同"给不出尺寸"
    return Number.isFinite(value) ? `${value}px` : fallback;
  }
  const num = Number(value);
  // 字符串通道：纯数字串按 px 补齐，其余视为 CSS 表达式原样透传
  return Number.isFinite(num) ? `${num}px` : value;
};

/**
 * 下拉搜索过滤（复刻自外部系统 `/@/utils/busi` 的 `filterOption`，供 Group 系列传给 FormSelect）
 *
 * 按 option 的 valueLabel / label / value 做不区分大小写的包含匹配。
 */
export const filterOption = (inputValue, option) => {
  const valueLabel = option.valueLabel || option.label || option.value || '';
  const value = valueLabel.toLowerCase().trim();
  const input = inputValue.toLowerCase().trim();
  if (value.indexOf(input) !== -1) return true;
};
