<template>
  <!-- data-active-index 供本组件样式定位当前操作端；
       active-picker-index 把「操作端」交给 antd 自己的激活段状态（底部 active-bar / -input-active /
       下拉箭头对齐），这是 antd 原生面板落笔后自动切换的同一套状态，面板整体接管后必须显式喂回去，
       否则面板里换端了、触发框光标仍停在原段（详见 style 里 .is-panel-open 的注释）；
       data-hover 仅作本模板的响应式依赖，保证 hoverValue 变化时一定触发重渲染 -->
  <a-range-picker
    ref="rangePickerRef"
    v-bind="$attrs"
    class="dc-date-time-range-picker"
    :class="{ 'is-panel-open': state.open }"
    :data-active-index="state.writeIndex"
    :active-picker-index="state.writeIndex"
    :data-hover="state.hoverValue ? 1 : 0"
    :value="state.antValue"
    :open="state.open"
    :format="props.format"
    :separator="'-'"
    :panel-render="methods.renderPanel"
    @openChange="methods.onOpenChange"
    @change="methods.onAntChange"
    @focus="methods.onInputFocus"
    @click="methods.onInputClick"
  >
    <template #suffixIcon>
      <SvgIcon icon="icon-core-shijianriqi" :size="14" />
    </template>
  </a-range-picker>
</template>

<script setup>
/**
 * 日期时间范围选择器
 *
 * 面板结构与交互对齐 Arco Design 的 RangePicker（带时间）：
 * 双月联动 + 底部「日期 / 时间」四格 + 全局确定按钮。
 * 触发框与弹层复用 antd 的 a-range-picker，面板内容由 panelRender 整体接管，
 * 日期网格与时间列由 helper/antPanel.js 提供的 ant PickerPanel 作为渲染引擎。
 */
import { computed, h, reactive, ref, watch } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Dayjs from './helper/dayjs';
import { useRangeLimit } from './helper/useRangeLimit';
import RangePanel from './internal/RangePanel.vue';

const props = defineProps({
  start: { type: String, default: undefined },
  end: { type: String, default: undefined },
  /** 值格式（决定输入框展示） */
  format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
  /**
   * 时间配置（对齐 antd RangePicker 的 showTime）
   * - false：不带时间，选满两侧即自动确认
   * - true：带时间；未配置 defaultValue 时默认时分秒为当前时刻
   *   （对齐 antd / Arco 的优先级：已选值 > defaultValue > 当前时刻）
   * - Object：{ format?: 时间列格式, defaultValue?: 默认时间 }
   *   其中 defaultValue 支持单个值（两端共用）或 [start, end]，元素为 "HH:mm[:ss]" 字符串或 Dayjs
   */
  showTime: { type: [Boolean, Object], default: true },
  /** 跨度上限（天），0 表示不限制 */
  span: { type: Number, default: 0 },
  /** 相对当天的偏移天数 */
  pointTime: { type: Number, default: 0 },
  /** 日期限制方向：max 禁未来 / min 禁过去 / no 不限制 */
  curLimit: { type: String, default: 'max' },
});

const $emit = defineEmits(['update:start', 'update:end', 'change', 'ok', 'openChange', 'focus']);

const rangePickerRef = ref(null);

const state = reactive({
  open: false,
  // 已确认值
  selectedValue: [undefined, undefined],
  // 草稿值（面板内操作，点确定才生效）
  processValue: undefined,
  // 悬停预览区间
  hoverValue: null,
  // 当前操作端：0 起始 / 1 结束
  // 既是「下一次点选写入哪一端」，也是跨度置灰的基准侧 —— 由点触发框哪一段决定，落笔后自动交替
  writeIndex: 0,
  // 视图模式：date | time，左右面板共享
  viewMode: 'date',
  // 左右面板月份
  headerValue: [
    Dayjs.getDayjsTime().startOf('month'),
    Dayjs.getDayjsTime().startOf('month').add(1, 'month'),
  ],
  // 左右时间值（仅占位；真实值每次开面板由 resetPanel 重建）
  timeValue: [Dayjs.getDayjsTime(), Dayjs.getDayjsTime()],

  // ===== 派生 =====
  panelValue: computed(() => state.processValue || state.selectedValue),
  /**
   * 喂给 antd 的受控值 = 触发框里显示的值
   *
   * 面板展开时用面板当前值（草稿实时回显，对齐 antd / Arco：面板内点选立刻反映到输入框，
   * 只有「确定」/点面板外才提交）；关闭后回到已确认值 —— 草稿不完整则视为丢弃，
   * 输入框不会留着半边值（与 commit / onOpenChange 的语义一致）。
   */
  antValue: computed(() => {
    const [start, end] = state.open ? state.panelValue : state.selectedValue;
    return start || end ? [start, end] : [];
  }),
  // 是否展示时间
  hasTime: computed(() => !!props.showTime),
  // 时间列格式：优先 showTime.format，否则从值格式中提取时间段
  timeFormat: computed(() => {
    if (typeof props.showTime === 'object' && props.showTime.format) {
      return props.showTime.format;
    }
    const matched = props.format.match(/[HhmsAa][^YMD]*$/);
    return matched ? matched[0] : 'HH:mm:ss';
  }),
  // 默认时间对 [start, end]：数组按索引取，单值两端共用
  defaultTimePair: computed(() => {
    const preset = typeof props.showTime === 'object' ? props.showTime.defaultValue : undefined;
    if (Array.isArray(preset)) return [preset[0], preset[1]];
    if (preset) return [preset, preset];
    return [undefined, undefined];
  }),
  confirmDisabled: computed(() => {
    const [start, end] = state.panelValue;
    return !start || !end;
  }),
});

/**
 * 置灰判据（方向 / 顺序 / 跨度）统一由 helper/useRangeLimit 提供，规则说明见该文件；
 * 候选取面板当前值（草稿优先），侧别取当前操作端，与落笔自动修正 `clampOtherSide` 同口径
 */
const { disabledDate } = useRangeLimit({
  curLimit: props.curLimit,
  pointTime: props.pointTime,
  span: props.span,
  getRangeValue: () => state.panelValue,
});

const methods = {
  // ===== 面板渲染：整体替换 antd 原生面板 =====
  renderPanel() {
    return h(RangePanel, {
      headerValue: state.headerValue,
      rangeValue: state.panelValue,
      hoverValue: state.hoverValue,
      disabledDate: methods.getDisabledDate,
      disabledTime: methods.getPanelDisabledTime,
      showTime: state.hasTime,
      viewMode: state.viewMode,
      timeValue: state.timeValue,
      timeFormat: state.timeFormat,
      confirmDisabled: state.confirmDisabled,
      onSelect: methods.onPanelSelect,
      onHover: methods.onPanelHover,
      onPrev: () => methods.shiftMonth(-1),
      onNext: () => methods.shiftMonth(1),
      onSuperPrev: () => methods.shiftMonth(-12),
      onSuperNext: () => methods.shiftMonth(12),
      onViewChange: methods.onViewChange,
      onTimeSelect: methods.onPanelTimeSelect,
      onConfirm: methods.onConfirm,
    });
  },

  /** 面板置灰：规则在 useRangeLimit，侧别取当前操作端 */
  getDisabledDate(current) {
    return disabledDate(current, state.writeIndex === 0 ? 'start' : 'end');
  },

  /** 时间列禁用（预留：curLimit / pointTime 细化到时分秒） */
  getPanelDisabledTime() {
    return undefined;
  },

  // ===== 开合 =====
  onOpenChange(open) {
    state.open = open;
    if (open) {
      methods.resetPanel();
    } else {
      // 点面板外关闭：草稿完整则等同确认（否则跨度自动修正的结果会凭空丢失），不完整则丢弃
      if (state.processValue) methods.commit();
      methods.resetOnClose();
    }
    $emit('openChange', open);
  },

  /**
   * 触发框输入段点击 → 切换「当前操作端点」
   *
   * 用 click 而非 focus：input 已聚焦时再次点击不触发 focus，且弹层打开时 antd 会自行
   * 聚焦某一段，focus 事件会把操作端带偏（来回操作后基准错位即源于此）。
   * 定位只在本组件根节点作用域内按 input 下标取，不查全局 DOM、不依赖
   * `ant-picker-input-active` 类，同页多实例互不干扰。
   */
  onInputClick(e) {
    const inputs = rangePickerRef.value?.$el?.querySelectorAll('.ant-picker-input') || [];
    const box = e?.target?.closest?.('.ant-picker-input');
    const index = box ? Array.prototype.indexOf.call(inputs, box) : -1;
    if (index < 0) return;
    // 点哪一段就把「操作端」切到哪一端 → 跨度置灰基准随之切换；
    // 同时经 `:active-picker-index` 驱动 antd 的激活段指示（见模板注释）
    state.writeIndex = index;
  },

  onInputFocus(e) {
    $emit('focus', e);
  },

  resetPanel() {
    state.processValue = undefined;
    state.hoverValue = null;
    state.viewMode = 'date';
    // 注意：writeIndex 由触发框的点击段决定（onInputClick），此处不重置，
    // 否则点结束段打开面板时会被强制拉回起始端

    const [start, end] = state.selectedValue;
    const base = start || Dayjs.getDayjsTime();
    state.headerValue = [base.startOf('month'), base.startOf('month').add(1, 'month')];
    state.timeValue = [methods.resolveTime(start, 0), methods.resolveTime(end, 1)];
  },

  /** 已确认值优先取自身时分，否则取该侧默认时间（未配置为当前时刻，对齐 antd / Arco） */
  resolveTime(value, index) {
    if (value) return value.clone();
    const base = Dayjs.getDayjsTime();
    const preset = state.defaultTimePair[index];
    if (!preset) return base;
    if (Dayjs.dayjs.isDayjs(preset)) {
      return base.hour(preset.hour()).minute(preset.minute()).second(preset.second());
    }
    const [hour, minute, second] = String(preset).split(':').map(Number);
    return base
      .hour(hour || 0)
      .minute(minute || 0)
      .second(second || 0);
  },

  // ===== 日期选择 =====
  onPanelSelect(date) {
    const index = state.writeIndex;
    const merged = methods.mergeDateTime(date, state.timeValue[index]);

    const next = state.processValue ? [...state.processValue] : [...state.selectedValue];
    next[index] = merged;
    // 另一端若因本次落笔而超限，自动拉到边界（对齐旧 RangePicker 的自动跟随）
    methods.clampOtherSide(next, index);
    state.processValue = next;
    state.hoverValue = null;

    const complete = next[0] && next[1];
    if (!state.hasTime && complete) {
      methods.onConfirm();
      return;
    }
    // 落笔后写入端一律切到另一端（起始 ↔ 结束 交替，与 antd 的激活段一致）：
    // 若只在「补齐」时切换，编辑既有区间（两端都在）会一直改同一端。
    // 触发框的激活段跟随同一状态（`:active-picker-index`），故「选完起始自动跳到结束」无需另做聚焦。
    state.writeIndex = index === 0 ? 1 : 0;
  },

  mergeDateTime(date, time) {
    return date.hour(time.hour()).minute(time.minute()).second(time.second());
  },

  /**
   * 跨度修正：本次落笔的一端确定后，若另一端与它超出 span，把另一端拉到边界
   *
   * 对齐旧 `RangePicker.vue` 的 `calendarChange`「另一侧自动跟随」语义：
   * 改起始 → 结束被拉到边界；改结束 → 起始被拉到边界。
   *
   * 口径：**含头含尾 span 天、按自然日**（两端最大天数差 = span - 1）——
   * span = 7、起始 1 号 → 另一端最大到 7 号。两端各自保留自身时分；
   * 顺序颠倒（负差）不在此处理，留给确认时的兜底排序。
   *
   * 判据必须用 `startOf('day')` 后的自然日差，与面板置灰（useRangeLimit）同口径：
   * `diff('day')` 会把两端时分算进去再向下取整 —— 起始 15:45、结束 15:44 时
   * 「1 号 → 8 号」只算 6 天，等于放行了 8 天跨度；此后面板按自然日判它超限，
   * 就会把刚选的端点本身画成禁用格（灰底）、并把它之后整片日期一并禁掉。
   */
  clampOtherSide(range, index) {
    const { span } = props;
    if (!span) return;

    const [start, end] = range;
    if (!start || !end) return;

    const maxOffset = span - 1;
    if (end.startOf('day').diff(start.startOf('day'), 'day') <= maxOffset) return;

    if (index === 0) {
      range[1] = methods.mergeDateTime(start.add(maxOffset, 'day'), end);
    } else {
      range[0] = methods.mergeDateTime(end.subtract(maxOffset, 'day'), start);
    }
  },

  // ===== 悬停预览 =====
  /**
   * 拖动选日期时的区间预览：以「操作端的对端」为锚点
   *
   * 操作端在结束 → 锚点取起始；操作端在起始 → 锚点取结束。
   * 不能要求「另一端为空」——落笔后另一端常被跨度自动修正填上，那样预览会永远不出现。
   */
  onPanelHover(date) {
    const [start, end] = state.panelValue;
    const anchor = state.writeIndex === 0 ? end : start;
    if (!date || !anchor) {
      state.hoverValue = null;
      return;
    }
    state.hoverValue = date.isBefore(anchor) ? [date, anchor] : [anchor, date];
  },

  // ===== 时间选择 =====
  onPanelTimeSelect(index, time) {
    const list = [...state.timeValue];
    list[index] = time;
    state.timeValue = list;

    const next = state.processValue ? [...state.processValue] : [...state.selectedValue];
    if (next[index]) {
      next[index] = methods.mergeDateTime(next[index], time);
      state.processValue = next;
    }
  },

  onViewChange(mode) {
    state.viewMode = mode;
  },

  // ===== 翻页（双月联动） =====
  shiftMonth(offset) {
    const left = state.headerValue[0].add(offset, 'month');
    state.headerValue = [left, left.clone().add(1, 'month')];
  },

  // ===== 确认 / 清空 =====
  onConfirm() {
    const list = methods.commit();
    if (!list) return;
    $emit('ok', list);
    methods.closePanel();
  },

  /**
   * 草稿回填：把面板草稿（含跨度自动修正的结果）写成已确认值并回传
   *
   * 点「确定」与「点面板外关闭」共用 —— 后者若直接丢弃草稿，自动修正出来的另一端会凭空消失。
   * 草稿不完整（缺任一端）时返回 null；成功返回回传值数组。
   */
  commit() {
    const [start, end] = state.panelValue;
    if (!start || !end) return null;

    let [begin, finish] = start.isAfter(end) ? [end, start] : [start, end];
    // 兜底裁剪：与 clampOtherSide 同口径（含头含尾 span 天、按自然日 → 最大差 span - 1），
    // 裁剪时保留结束端自身时分（与 clampOtherSide 的 mergeDateTime 写法一致）
    if (
      props.span > 0 &&
      finish.startOf('day').diff(begin.startOf('day'), 'day') > props.span - 1
    ) {
      finish = methods.mergeDateTime(begin.add(props.span - 1, 'day'), finish);
    }

    state.selectedValue = [begin, finish];
    state.processValue = undefined;
    state.hoverValue = null;
    return methods.emitValue(begin, finish);
  },

  /**
   * 面板关闭复位：弃掉草稿预览、把「操作端」交还起始端
   *
   * 关闭有两条路径 —— ① 点「确定」→ closePanel()；② 点面板外 → antd 的 @openChange(false)。
   * `:open` 是受控 prop，antd 的 useMergedState 在 prop 变化时不会回调 onChange
   * （`_util/hooks/useMergedState.js`：prop 有值即直接采用，不触发 onChange），
   * 故 ① 不会经过 ② —— 复位必须由两条路径共用。
   *
   * 否则点「确定」关面板后操作端残留：下次点日历图标打开时 onInputClick 取不到输入段
   * （图标不在 `.ant-picker-input` 内，早退不改操作端），于是灰底、跨度基准、
   * `active-picker-index` 会全部指向错误的一端，且「回到起始端再选」的预期被破坏。
   */
  resetOnClose() {
    state.processValue = undefined;
    state.hoverValue = null;
    state.writeIndex = 0;
  },

  closePanel() {
    methods.resetOnClose();
    state.open = false;
    $emit('openChange', false);
  },

  emitValue(begin, finish) {
    const list = [begin.format(props.format), finish.format(props.format)];
    $emit('update:start', list[0]);
    $emit('update:end', list[1]);
    $emit('change', list);
    return list;
  },

  clear() {
    state.selectedValue = [undefined, undefined];
    state.processValue = undefined;
    state.hoverValue = null;
    state.writeIndex = 0;
    $emit('update:start', undefined);
    $emit('update:end', undefined);
    $emit('change', []);
  },

  // ===== 输入框手输 / 清除（antd 触发） =====
  onAntChange(value) {
    if (!value || !value.length || (!value[0] && !value[1])) {
      methods.clear();
      return;
    }
    const [begin, finish] = value;
    if (!begin || !finish) return;
    // 手输与面板落笔同口径：超跨度时以「当前输入侧」为基准把另一端拉回边界（自然日、含头含尾）
    const range = [begin, finish];
    methods.clampOtherSide(range, state.writeIndex);
    state.selectedValue = range;
    // 手输即新值，面板草稿作废（否则面板还停在旧草稿上，与框里不一致）
    state.processValue = undefined;
    state.hoverValue = null;
    methods.emitValue(range[0], range[1]);
  },
};

watch(
  () => [props.start, props.end],
  ([start, end]) => {
    if (start && end) {
      state.selectedValue = [Dayjs.getDayjsTime(start), Dayjs.getDayjsTime(end)];
    } else if (!start && !end) {
      state.selectedValue = [undefined, undefined];
      state.writeIndex = 0;
    }
  },
  { immediate: true },
);

defineExpose({ focus: () => rangePickerRef.value?.focus?.() });
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.dc-date-time-range-picker {
  &.ant-picker {
    width: 100%;
    border-radius: var(--border-radius-base, 4px);
    // 触发框视觉对齐项目输入控件（FormInput / FormSelect / FormDatePicker）：
    // 白底 + 同一边框变量
    background: var(--bg-color-white, #fff);
    border-color: var(--border-color-line, #d9d9d9);

    // 聚焦态只变边框色，去掉 antd 默认的淡蓝外发光（项目输入控件的统一约定）
    &.ant-picker-focused {
      border-color: var(--primary-color, #0032a0);
      box-shadow: none;
    }

    // 面板展开期间恒显聚焦态与底部激活条
    //
    // antd 的 `-focused` 类与 `.ant-picker-active-bar` 都取自「**物理聚焦**的那一段」
    // （`vc-picker/RangePicker.js`：`-focused` = mergedActivePickerIndex===0 ? startFocused : endFocused），
    // 而 `active-picker-index` 绑的是「**操作端**」——面板内换端时二者会错开（焦点仍在原段、操作端已切走），
    // 此时整框会掉聚焦态、激活条被 opacity:0 藏掉。故这里按「面板是否展开」兜住，
    // 让激活段（含 antd 的 2px 激活条）始终跟着操作端显示。
    &.is-panel-open {
      border-color: var(--primary-color, #0032a0);

      :deep(.ant-picker-active-bar) {
        opacity: 1;
      }
    }

    // 触发框内部为 antd DOM，须经 :deep() 才能命中（否则 scoped 属性选择器匹配不到）
    :deep(.ant-picker-input) > input {
      text-align: center;
    }

    // 当前操作端底色：跟随操作端（writeIndex），与跨度置灰基准同源；仅面板展开时显示
    // antd 3.2.20 的 DOM 顺序为 [起始 input] / [分隔符] / [结束 input]
    &.is-panel-open[data-active-index='0'] :deep(.ant-picker-input:nth-child(1)),
    &.is-panel-open[data-active-index='1'] :deep(.ant-picker-input:nth-child(3)) {
      background: var(--select-bg-color, #f5f7fa);
      border-radius: var(--border-radius-base, 4px);
    }

    :deep(.ant-picker-range-separator) {
      padding: 0 4px;
      color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
    }
  }
}
</style>
