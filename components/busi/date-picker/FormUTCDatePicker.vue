<template>
  <!--
    限时窗口包装层 = `FormDatePicker`（唯一外壳）+ 本文件的限时逻辑。
    外壳能力（双语显示格式、字符串 ⇄ dayjs、fail 态、粘贴同步、图标兜底、样式基类、`$attrs` 单通道）
    一律由 `FormDatePicker` 提供，本文件不再复刻。
    属性分流：内部合成项（`disabled-date` / `disabled-time` / `dropdownClassName`）绑在 `$attrs` **之后**
    ⇒ 内部生效，且不吞调用方传参（合成里已带上调用方的谓词/类名）。
  -->
  <FormDatePicker
    v-bind="$attrs"
    :value="props.value"
    :format="props.format"
    :show-time="props.showTime"
    :disabled-date="methods.disabledDate"
    :disabled-time="methods.disabledTime"
    :dropdown-class-name="state.dropdownClassName"
    @update:value="value => emit('update:value', value)"
    @change="value => emit('change', value)"
    @ok="value => emit('ok', value)"
    @input="methods.onInput"
    @select="methods.onPanelSelect"
    @blur="methods.onBlur"
  >
    <!--
      插槽透传：只透传外壳声明过的两个具名插槽，且**未传就不透传**
      —— 无条件透传会把外壳自己的图标兜底替换成空内容
    -->
    <template v-for="name in forwardedSlots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FormDatePicker>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：显式透传 $attrs 时必须关掉自动继承，
// 否则 $attrs 会被自动落到根元素（本组件根元素即 FormDatePicker）再应用一次
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
/**
 * FormUTCDatePicker —— 「限时窗口内的日期时间输入」
 *
 * 结构 = `FormDatePicker`（唯一外壳）+ 本文件的**限时窗口层**：
 *   · 日期格 / 时·分·秒列禁用：调用方谓词与限时窗口**显式取并集**（合成后经 `$attrs` 下传）
 *   · 候选值越界时「确定」灰显不可点（候选值 = 输入框完整文本 ＞ 面板点选值 ＞ 当前值）
 * 外壳不再复刻（收敛前两文件 ≈95% 逐行重复）。
 *
 * 契约（与外部实现逐字一致）：
 *   - 值：`v-model:value`（字符串进 / 字符串出，回传恒为 `props.format`）
 *   - 事件：`change` / `ok`（都只携带格式化字符串，**面板开关不会触发 change**）
 *   - 未声明的 `@openChange` / `@focus` 等经 `$attrs` 直通 antd 原生事件
 *   - `timeLimit` 为 falsy（`0` / 不传）时不做任何限时限制（与旧实现口径一致）
 */
import { computed, reactive, useAttrs, useSlots, watch } from 'vue';
import Dayjs from './helper/dayjs';
import FormDatePicker from './FormDatePicker.vue';
import { disTimeZone, disTimeZoneTime, getDisplayFormat, getLang } from './helper/utils.js';

const props = defineProps({
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm',
  },
  // 是否展示时间面板：不传则按 format 推导（含 H/h 即时间面板），传了以传入值为准 —— 原样透传给外壳
  showTime: {
    type: [Boolean, Object],
    default: undefined,
  },
  value: {
    type: String,
    default: '',
  },
  // 限时窗口：口岸时区「此刻」往前 timeLimit 小时内可选（falsy = 不限时）
  timeLimit: {
    type: Number,
    default: undefined,
  },
  // 限时窗口使用的时区（如 "UTC+8"）
  timeZone: {
    type: String,
    default: undefined,
  },
});
const attrs = useAttrs();
const slots = useSlots();
// 有意不声明 openChange / focus：调用方绑定它们时经 $attrs 直通 antd 原生事件（同外部实现）
const emit = defineEmits(['update:value', 'change', 'ok']);

// 只透传外壳声明过的具名插槽；未传则不透传，保留外壳自己的图标兜底
const forwardedSlots = computed(() =>
  ['suffixIcon', 'renderExtraFooter'].filter(name => !!slots[name]),
);

const state = reactive({
  // 显示格式：仅用于"输入框候选值"的完整性判定（与外壳同一口径，走共享 helper）
  // 业务组件版无 i18n/cookie 基建，语言恒取 helper.getLang()（zh_CN）
  currentFormat: computed(() => getDisplayFormat(props.format, getLang())),
  // 【备用实现，外部原版注释保留、未生效】把"值为空时点日期带出的时分秒"由**系统当前时间**改为**口岸此刻**
  // （`Dayjs.getCurrentTimeZone(timeZone)`，与 helper/utils.js 同一取法）——跨时区使用时兼容性更好，
  // `defaultValue` 仅在值为空时生效 ⇒ 对已有值/编辑回显零影响。语义：调用方显式传 show-time（对象/false）优先，
  // 其次口岸默认时刻，最后按调用方布尔值或 format 推导。
  // 包装层形态下的放开方式：把下面这段算出的结果作为 `:show-time` 传给外壳（其余不变，外壳只认 showTime 一个口）。
  // showTime: computed(() => {
  //   if (props.showTime !== undefined && typeof props.showTime !== 'boolean') return props.showTime;
  //   if (props.showTime === false) return false;
  //   if (state.limitActive && props.timeZone && /[Hh]/.test(props.format)) return { defaultValue: Dayjs.getCurrentTimeZone(props.timeZone) };
  //   return props.showTime !== undefined ? props.showTime : /[Hh]/.test(props.format);
  // }),
  // 限时窗口是否生效（falsy = 完全不限制，与旧实现 `if (!props.timeLimit) return` 口径一致）
  limitActive: computed(() => !!props.timeLimit),
  // 面板最后一次点选到的日期时间（`@select` 捕获）
  panelValue: undefined,
  // 输入框里"已输入未提交"的完整文本解析结果（`@input` 捕获）
  inputValue: undefined,
  // 「确定」按钮禁用：**候选值**超出窗口 ⇒ 灰显不可点
  //
  // 候选值优先级：输入框完整文本 ＞ 面板最后一次点选值 ＞ 当前值。
  // 为什么不能只看 props 值：antd 的面板/输入框跟随的是它自己的 `selectedValue`
  // （`vc-picker/Picker.js:78-90` 文本同步、`:324` 传给面板），它在「已输入未提交」等场景会**先于**
  // props 值变化 —— 外部实测出现过 `value = undefined` 而面板里已显示 `2026-09-24 13:54` 的情形；
  // 旧实现读 `.ant-picker-time-panel .ant-picker-header-view` 文案，读到的正是这个"面板候选值"，
  // 所以它能灰，只看 props 值的写法会漏。此处用外壳暴露的两个官方钩子覆盖同一场景（不查 DOM）：
  //   · `@select`：`Picker.js:327-328` 原样透传调用方 onSelect，`PickerPanel.triggerSelect` 在
  //     onChange 守卫**之前**无条件调用 ⇒ 每次面板点选都能拿到候选值；
  //   · `@input`：外壳 `inputRender` 抛出的原生输入事件，能拿到"已输入未提交"的完整文本。
  okDisabled: computed(() => {
    if (!state.limitActive) return false;
    const candidate =
      state.inputValue ||
      state.panelValue ||
      (props.value ? Dayjs.getDayjsTime(props.value) : undefined);
    if (!candidate) return false;
    return !!disTimeZone(candidate, props.timeLimit, props.timeZone, {
      validateValue: candidate,
    });
  }),
  // 弹层类名：组件基类（外部样式钩子）+ 调用方传入的（$attrs）+「确定」越界禁用标记
  dropdownClassName: computed(() => {
    const caller = attrs.dropdownClassName || attrs['dropdown-class-name'];
    return ['form-utc-date-picker', caller, state.okDisabled && 'form-utc-date-picker-ok-disabled']
      .filter(item => !!item)
      .join(' ');
  }),
});

const methods = {
  /**
   * 记录"输入框里的候选值"，供「确定」灰显判定使用
   *
   * 由外壳的 `input` 事件驱动（外壳的 `inputRender` 排在 `$attrs` 之后绑定，包装层直接传
   * `inputRender` 会被顶掉，故由外壳抛出原生事件）。只认"完整文本"：按当前显示格式渲染后
   * 与输入文本逐字一致才算，避免 `2026-09-24 13:5` 这类中间态误判。
   */
  onInput(e) {
    const text = String((e && e.target && e.target.value) || '').trim();
    if (!text) {
      state.inputValue = undefined;
      return;
    }
    const date = Dayjs.getTimeText(text, props.format);
    if (!date || date == 'Invalid Date') {
      state.inputValue = undefined;
      return;
    }
    const value = Dayjs.getDayjsTime(date);
    state.inputValue = Dayjs.getTimeText(value, state.currentFormat) === text ? value : undefined;
  },
  // 面板每次点选都会触发（antd `PickerPanel.triggerSelect` 在 onChange 守卫之前无条件调用 onSelect）
  onPanelSelect(date) {
    state.panelValue = date ? Dayjs.getDayjsTime(date) : undefined;
  },
  // 失焦即放弃"输入框候选值"（antd 在 showTime 下会把手输文本回滚，候选值随之作废）
  onBlur() {
    state.inputValue = undefined;
  },
  // 调用方谓词（`disabled-date` / `disabledDate` 两种写法都收）
  getCallerDisabledDate() {
    const fn = attrs.disabledDate || attrs['disabled-date'];
    return typeof fn === 'function' ? fn : undefined;
  },
  getCallerDisabledTime() {
    return attrs.disabledTime || attrs['disabled-time'];
  },
  /**
   * 日期禁用：调用方谓词 OR 限时窗口
   *
   * 不能靠"内部绑定放在 `$attrs` 之前/之后"决定谁生效——那会让调用方的 `disabled-date`
   * 与限时守卫互相顶掉；此处显式合成，未传 `timeLimit` 时结果与调用方原谓词逐字一致。
   */
  disabledDate(current) {
    if (methods.getCallerDisabledDate()?.(current)) return true;
    if (!state.limitActive) return undefined;
    return disTimeZone(current, props.timeLimit, props.timeZone);
  },
  /**
   * 时·分·秒列禁用：调用方规则与限时窗口**逐列取并集**
   * （antd 把 disabledTime 当函数调用：`vc-picker/panels/DatetimePanel/index.js:88`）
   */
  disabledTime(current) {
    const caller = methods.getCallerDisabledTime();
    const limit = state.limitActive
      ? disTimeZoneTime(current, props.timeLimit, props.timeZone)
      : undefined;
    if (!caller) return limit;
    const callerTime = typeof caller === 'function' ? caller(current) : caller;
    if (!limit) return callerTime;
    return methods.mergeDisabledTime(callerTime, limit);
  },
  mergeDisabledTime(callerTime, limitTime) {
    const merged = {};
    ['disabledHours', 'disabledMinutes', 'disabledSeconds'].forEach(key => {
      const fns = [callerTime?.[key], limitTime?.[key]].filter(fn => typeof fn === 'function');
      if (!fns.length) return;
      // 逐列取并集，并原样转发 antd 传入的参数（disabledMinutes 会收到当前小时）
      merged[key] = (...args) => fns.reduce((acc, fn) => acc.concat(fn(...args) || []), []);
    });
    return merged;
  },
};

// 值 / 值格式变化 ⇒ 此前的候选值（输入框文本 / 面板点选值）失效：props 值是权威来源
watch([() => props.value, () => props.format], () => {
  state.inputValue = undefined;
  state.panelValue = undefined;
});
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
// /**
//  * 「确定」按钮越界禁用态
//  *
//  * 为什么只能整体 :global()（外部实测，**勿改成 `.xxx :global(.yyy)` 这种"半全局"写法**）：
//  *   ① 弹层挂在 document.body（`vc-trigger/Trigger.js:481-482`），且其 DOM 由 antd 自己的 render
//  *      函数产出 ⇒ 不带本组件的 `data-v-hash`；`:deep()` 同样要求"带 scope 属性的祖先" ⇒ 都命中不到；
//  *   ② Vue 3.2.37 的 scoped 插件遇到 `:global()` 执行 `selectorRoot.removeChild(selector)`，
//  *      **只保留括号内部**：实测 `.a :global(.b .c)` 编译结果是 `.b .c`（前缀被丢弃 ⇒ 反而全站生效，比现在危险）。
//  * 因此"收窄"只能靠选择器本身，不能靠作用域：要求同一元素既是 antd 弹层根 `.ant-picker-dropdown`
//  *   又是本组件标记类（`vc-picker/PickerTrigger.js:66-71`：`popupClassName` 与 `-dropdown` 同元素），
//  *   再限定到 `.ant-picker-ok .ant-btn` ⇒ 爆炸半径 = 本组件标记过的弹层里的「确定」按钮。
//  *
//  * 注：若将来改成 getPopupContainer 把弹层收进组件子树，可改用 `:deep()` 去掉 :global()，
//  * 但那会改变多个站点（表格/弹窗内）的弹层定位与裁剪行为，需先评估。
//  */
:global(.ant-picker-dropdown.form-utc-date-picker-ok-disabled .ant-picker-ok .ant-btn) {
  pointer-events: none;
  color: var(--disabled-color, #999999);
  border-color: var(--border-color-line, #d9d9d9);
  background: var(--disabled-bg-color, #eceeed);
  text-shadow: none;
  box-shadow: none;
}
</style>
