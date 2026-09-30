import Dayjs from './dayjs';

/**
 * 日期范围「可用性」规则（DateTimeRangePicker 的置灰内核）
 *
 * 两类限制，都是纯函数、不持有状态（候选值由 `getRangeValue` 从宿主读）：
 * 1. 方向：`curLimit` / `pointTime` —— 与当前选了什么都不相干，只跟今天有关
 * 2. 相对：顺序（本端不得越过对端）+ 跨度（离基准端不超过 span - 1 天，即含头含尾 span 天）
 *
 * 侧别由调用方显式传入（`side`），不去猜「当前操作哪一侧」：面板/宿主本来就知道。
 * 推断法（旧 dateHook 依赖宿主 `state.focusFlag` + `.ant-picker-input-active` DOM 类）既有时序坑、
 * 同页多实例还会互相串。antd 3.x 的 `disabledDate(current)` 只传候选值本身、不带侧别
 * （vc-picker 各调用点均为单参），所以侧别只能由宿主给出；这也让规则与「当前操作哪一侧」
 * 这个状态解耦 —— 状态错了改状态，规则本身可单独验证。
 *
 * 跨度基准取「**本端当前值**」，不是对端：本端为空时该侧不设跨度限制，
 * 落笔后若越界，由宿主 `clampOtherSide` 把另一端拉回边界（两端同口径：自然日、含头含尾）。
 *
 * @param {Object}   [options]
 * @param {string}   [options.curLimit='max'] max 禁未来 / min 禁过去 / no 不限制；
 *                                             仅 min / max 产生限制，其余值（no、空串、大小写或拼写偏差）
 *                                             走同一条「不限制」路径
 * @param {number}   [options.span=0]         跨度上限（天），0 表示不限制
 * @param {number}   [options.pointTime=0]    限制边界整体前移的天数（配合 curLimit 生效）
 * @param {Function} [options.getRangeValue]  读当前范围，返回 [start, end]（Dayjs | undefined）
 * @returns {{ disabledDate: (current: Dayjs, side?: 'start' | 'end') => boolean }}
 */
export const useRangeLimit = ({
  curLimit = 'max',
  span = 0,
  pointTime = 0,
  getRangeValue = () => [],
} = {}) => {
  /**
   * 方向：边界取「当天减 pointTime 天」的日终（与旧 dateHook 同口径）
   *
   * 只认 `min` / `max` 两个字面量：其余值（`no`、空串、拼错的大小写变体等）一律不限制。
   * 非法值降级成 `max` 会「静默禁掉未来一片日期」，属于有副作用的猜测；
   * 降级成不限制只是少做一件事，行为可预期、排查成本低。
   */
  const isOutOfDirection = current => {
    if (curLimit !== 'min' && curLimit !== 'max') return false;
    const boundary = Dayjs.getDayjsTime().subtract(pointTime, 'day').endOf('day');
    return curLimit === 'min' ? current.isBefore(boundary) : !current.isBefore(boundary);
  };

  /** 顺序：本端不得越过对端（按自然日比，不受两端时分影响） */
  const isCrossedOther = (current, side, other) => {
    if (!other) return false;
    return side === 'start' ? current.isAfter(other, 'day') : current.isBefore(other, 'day');
  };

  /** 跨度：只限基准端（本端当前值）的远端那一侧，按自然日；两端最大天数差 = span - 1 */
  const isOutOfSpan = (current, side, anchor) => {
    if (!span || !anchor) return false;
    const distance = current.startOf('day').diff(anchor.startOf('day'), 'day');
    return side === 'start' ? distance > span - 1 : -distance > span - 1;
  };

  const disabledDate = (current, side = 'start') => {
    if (!current) return false;
    const [start, end] = getRangeValue() || [];
    return (
      isOutOfDirection(current) ||
      isCrossedOther(current, side, side === 'start' ? end : start) ||
      isOutOfSpan(current, side, side === 'start' ? start : end)
    );
  };

  return { disabledDate };
};
