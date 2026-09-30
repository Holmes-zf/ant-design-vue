<template>
  <a-range-picker
    ref="rangePickerRef"
    v-model:value="state.value"
    :format="state.currentFormat"
    class="define-range-picker"
    :disabled-date="disabledDate"
    v-bind="$attrs"
    @openChange="onOpenChange"
    @calendarChange="onCalendarChange"
    @change="methods.changeRangePicker"
    @focus="methods.focus"
  >
    <template #suffixIcon>
      <SvgIcon icon="icon-core-shijian-biao"></SvgIcon>
    </template>
  </a-range-picker>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：$attrs 已显式透传给 a-range-picker，必须同时关掉自动继承，
// 否则同一份属性会被 Vue 再落到根元素（本组件根元素即 a-range-picker）上一次（同 FormDatePicker 的处理）
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Dayjs from './helper/dayjs';
import dayjsFormat from './helper/format.js';
import { getLang } from './helper/utils.js';
import { dateHook } from './helper/dateHooks';

// 外部原实现经 Vuex（$useStore.state.lang.language）+ cookie 取语言；业务组件版
// 无该基建，恒取 helper.getLang()（zh_CN），显示格式表能力保留

const props = defineProps({
  start: {
    type: String,
    default: undefined,
  },
  end: {
    type: String,
    default: undefined,
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD',
  },
  // 跨度上限（天）：含头含尾最多可选 span 天，30 为全系统规格；传 0 表示不限制
  span: {
    type: Number,
    default: 30,
  },
  pointTime: {
    type: Number,
    default: 0,
  },
  // 方向限制：max 禁未来 / min 禁过去 / no 不限制（本组件默认 no，家族包装组件显式传 max）
  curLimit: {
    type: String,
    default: 'no',
  },
});

// 触发框实例：只用于在「本组件根节点作用域内」定位输入段下标（侧别来源）
const rangePickerRef = ref();

const state = reactive({
  value: [] as any[],
  // 当前语言的显示格式表（跟随语言状态，cookie 兜底）
  currentFormatObj: computed(() => {
    const lang = getLang();
    return lang === 'zh_CN' ? dayjsFormat.zh : dayjsFormat.en;
  }),
  // 当前的format key
  currentFormat: computed(() => {
    let key = Object.keys(dayjsFormat.correct).find(key => {
      return dayjsFormat.correct[key] === props.format;
    });
    return key ? state.currentFormatObj[key] : props.format;
  }),
  // 当前操作侧别（0 起始 / 1 结束）：由触发框 focus 事件的目标输入段直接给出，
  // 不再读 antd 渲染产物（.ant-picker-input-active），也不做全局 DOM 查询
  focusFlag: undefined as number | undefined,
  // 当前内部值在值通道上的快照（字符串对）：判断外部回写的值、格式化后要重放的值
  // 是否就是已知的同一个值 —— 是则不覆盖内部值、不重放 emit
  lastValue: null as any,
});
const $emit = defineEmits([
  'update:start',
  'update:end',
  'change',
  'focus',
  // 这两个事件由 dateHook 接管（它要用 open / 落笔时机），声明后不再走 $attrs，
  // 必须由下面的转发方法对外透出
  'openChange',
  'calendarChange',
]);
const methods = {
  // 被 hook 接管的 openChange：透出
  openChange(open) {
    $emit('openChange', open);
  },
  focus(e) {
    methods.syncSide(e);
    $emit('focus', e);
  },
  /**
   * 侧别 = 事件目标所在输入段的下标
   *
   * antd 每次切换操作端都会聚焦对应 input（input 聚焦 / 打开面板 / 落笔后自动切对端），
   * 且回调发生在它写好内部 activeIndex 之后，故此处拿到的就是当前真实侧别。
   * 只在本组件根节点作用域内按下标取，不查全局 DOM、不依赖 antd 的样式类名，同页多实例互不干扰。
   */
  syncSide(e) {
    // focus 事件的 target 即原生 input（antd 把处理器绑在 input 元素上），
    // 与根节点内的两个 input 全等比较即可取到下标；取不到（-1）时保持原侧别
    const inputs = rangePickerRef.value?.$el?.querySelectorAll('.ant-picker-input input') || [];
    const index = Array.prototype.indexOf.call(inputs, e?.target);
    if (index >= 0) state.focusFlag = index;
  },
  // 被 hook 接管的 calendarChange：透出（候选记录与越界拉回都在 hook 内完成）
  calendarChange(...args) {
    $emit('calendarChange', ...args);
  },
  changeRangePicker(value) {
    methods.updateMethod(value);
  },
  // 传入的值（字符串对）是否就是已知值
  isSameAsLast(list) {
    const [start, end] = list || [];
    return (
      state.lastValue !== null &&
      (start || undefined) === state.lastValue[0] &&
      (end || undefined) === state.lastValue[1]
    );
  },
  updateMethod(value) {
    let list = [];
    if (value && value.length >= 2) {
      list = Dayjs.getTimeText(value, props.format);
    }
    state.lastValue = [list[0] || undefined, list[1] || undefined];
    $emit('update:start', list[0] || undefined);
    $emit('update:end', list[1] || undefined);
    $emit('change', list);
  },
};
const { disabledDate, onOpenChange, onCalendarChange } = dateHook(
  {
    span: props.span,
    pointTime: props.pointTime,
    curLimit: props.curLimit,
  },
  methods,
  state,
);

watch(
  () => props.format,
  () => {
    // 格式变化只影响字符串表现：按新格式算出来的值若与已知值一致，不重放 emit
    const list =
      state.value && state.value.length >= 2 ? Dayjs.getTimeText(state.value, props.format) : [];
    if (methods.isSameAsLast(list)) return;
    methods.updateMethod(state.value);
  },
);
watch(
  () => [props.start, props.end],
  list => {
    // 外部传进来的就是已知值（多为本次 emit 的等值回写）⇒ 不覆盖内部值，避免打断选取
    if (methods.isSameAsLast(list)) return;
    state.value = list[0] && list[1] ? Dayjs.getDayjsTime([list[0], list[1]]) : [];
    state.lastValue = [list[0] || undefined, list[1] || undefined];
  },
  { immediate: true },
);
</script>

<style lang="less">
// 目标元素由 antd 渲染 ⇒ 用本组件独有的类名做钩子（非 scoped）
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.define-range-picker.ant-picker-range {
  border-radius: var(--border-radius-base, 4px);
  input {
    text-align: center;
  }
}
</style>
