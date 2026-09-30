import Dayjs from './dayjs';
import { ref } from 'vue';
import { isFunction } from 'lodash-es';

/*
 * span：时间跨度自然数，默认0不限制（含头含尾最多 span 天 → 两端最大天数差 span - 1）
 * curLimit: 当前限制 max min no 默认max
 * pointTime: 默认0-当天
 */
export const dateHook = (
  { curLimit = 'max', span = 0, pointTime = 0, calendarChange },
  methods = {},
  state = {},
) => {
  const dates = ref(null);

  /** 方向：只跟今天有关，与当前选了什么都不相干（边界 = 当天减 pointTime 天的日终） */
  const isOutOfDirection = current => {
    // 只有 min / max 两种取值产生方向限制，其余（no 及任何非法值）一律不限制
    if (curLimit != 'min' && curLimit != 'max') return false;
    const boundary = Dayjs.getDayjsTime().subtract(pointTime, 'day').endOf('day');
    return curLimit == 'min' ? current < boundary : current >= boundary;
  };

  /**
   * 跨度：只限「本端当前值」的远端那一侧，按自然日；两端最大天数差 = span - 1（含头含尾最多 span 天）
   *
   * 本端由宿主 state.focusFlag 给出（0 起始 / 1 结束），未定（非 0/1）时不施加跨度限制；
   * 操作起始只限更晚的一侧、操作结束只限更早的一侧，本端为空时该侧不限制（起始操作不限制结束）。
   */
  const isOutOfSpan = (current, start, end) => {
    if (!span) return false;
    const isStartSide = state.focusFlag == 0;
    const anchor = isStartSide ? start : state.focusFlag == 1 ? end : null;
    if (!anchor) return false;
    // 自然日差：不受两端时分影响（旧写法 'days' 含时分且向下取整，跨天时会少算一天）
    const distance = current.startOf('day').diff(Dayjs.getDayjsTime(anchor).startOf('day'), 'day');
    return isStartSide ? distance > span - 1 : -distance > span - 1;
  };

  // 置灰判据：两类规则分开、逐个判定，便于按类调试与后续扩展
  const disabledDate = current => {
    if (!current) return false;
    if (isOutOfDirection(current)) return true;
    // 候选为空（面板刚打开、还没落笔）：只剩方向限制，跨度无从判起
    const [start, end] = Array.isArray(dates.value) ? dates.value : [];
    if (!start && !end) return false;
    return isOutOfSpan(current, start, end);
  };

  // 面板打开：以宿主当前值初始化候选（拷贝一份，不与宿主的数组共享引用）
  // 事件被本 hook 占用，处理完交给宿主透出
  const onOpenChange = open => {
    if (open) {
      const value = state?.value;
      dates.value = Array.isArray(value) ? [...value] : [];
    }
    isFunction(methods?.openChange) && methods.openChange(open);
  };

  /** 取 `daySource` 的日期部分 + `timeSource` 的时分秒（被裁端保留自身时分，只改日期） */
  const setDayPart = (daySource, timeSource) =>
    Dayjs.getDayjsTime(daySource)
      .hour(timeSource.hour())
      .minute(timeSource.minute())
      .second(timeSource.second());

  /**
   * 落笔：更新候选，越界则把「另一端」拉到边界（另一端为空则补出），最后交给宿主透出
   *
   * 口径与置灰判据（isOutOfSpan）完全一致：自然日差、含头含尾 span 天 → 最大天数差 span - 1。
   * 远端参照：另一端已有值就用它；另一端为空（中间态）取当前时刻 —— 即保持既有
   * 「中间态自动补出另一端」行为（起/结束距今超过 span 时自动补出另一端）。
   *
   * 注意：`val` 与 antd 内部 `selectedValue` 是**同一个数组**（`vc-picker/RangePicker.js`
   * 的 `triggerChange`：先 `setSelectedValue(values)`，再把同一个 `values` 交给 onCalendarChange），
   * 故此处原地赋值会即时反映到面板高亮与该次提交值 —— 这正是「另一端自动跟随」生效的机制，
   * MUST NOT 为"避免共享引用"改成拷贝（会让拉回静默失效）；若要去掉共享，应改成把修正值交宿主写回受控值。
   */
  const onCalendarChange = (val, ...rest) => {
    dates.value = val;

    const [start, end] = Array.isArray(dates.value) ? dates.value : [];
    const isStartSide = state.focusFlag == 0;
    if (span > 0 && (isStartSide || state.focusFlag == 1)) {
      const maxOffset = span - 1;
      // 远端参照：另一端为空（中间态）时取当前时刻，与既有行为一致
      const begin = start || Dayjs.getDayjsTime();
      const finish = end || Dayjs.getDayjsTime();
      const distance = Dayjs.getDayjsTime(finish)
        .startOf('day')
        .diff(Dayjs.getDayjsTime(begin).startOf('day'), 'day');
      if (distance > maxOffset) {
        // 操作起始 → 拉/补结束；操作结束 → 拉/补起始。
        // 被裁端只换日期、保留自身时分；被裁端原本不存在（中间态补出）则沿用基准端时分
        if (isStartSide) {
          dates.value[1] = setDayPart(
            Dayjs.getDayjsTime(begin).add(maxOffset, 'day'),
            Dayjs.getDayjsTime(end || begin),
          );
        } else {
          dates.value[0] = setDayPart(
            Dayjs.getDayjsTime(finish).subtract(maxOffset, 'day'),
            Dayjs.getDayjsTime(start || finish),
          );
        }
      }
    }

    isFunction(methods?.calendarChange) && methods.calendarChange(val, ...rest);
  };

  return {
    dates,
    disabledDate,
    onOpenChange,
    onCalendarChange,
  };
};
