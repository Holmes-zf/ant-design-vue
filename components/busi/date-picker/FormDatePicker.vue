<template>
  <a-date-picker
    :show-time="state.showTime"
    placeholder="请选择"
    v-bind="$attrs"
    v-model:value="state.value"
    :format="state.currentFormat"
    :class="state.className"
    :inputRender="methods.renderInput"
    @change="methods.onChange"
    @ok="methods.onOk"
  >
    <template #suffixIcon>
      <slot name="suffixIcon">
        <SvgIcon icon="icon-core-shijianriqi" size="12"></SvgIcon>
      </slot>
    </template>
    <template #renderExtraFooter>
      <slot name="renderExtraFooter"></slot>
    </template>
  </a-date-picker>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：显式透传 $attrs 时必须关掉自动继承，
// 否则 $attrs 会被自动落到根元素（本组件根元素就是 a-date-picker）再应用一次
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { h, computed, reactive, useAttrs, watch } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Dayjs from './helper/dayjs';
import { getLang, getDisplayFormat } from './helper/utils.js';

// 外部原实现：$t('common.pleaseSelect') 走 i18n 服务；业务组件版按
// 外部语言文件 src/utils/i18n/modules/common.js 的准确值直接写中文「请选择」

const props = defineProps({
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm',
  },
  // 是否展示时间面板：不传则按 format 推导（含 H/h 即时间面板），传了以传入值为准
  showTime: {
    type: [Boolean, Object],
    default: undefined,
  },
  value: {
    type: String,
    default: '',
  },
  formType: {
    type: String,
    default: '',
    validator: (value: string) => {
      return ['', 'fail', 'checked'].includes(value);
    },
  },
});
const attrs = useAttrs();
const state = reactive({
  value: undefined,
  // 是否展示时间面板：默认按 format 推导（纯日期 format 走纯日期面板），调用方传 show-time 可覆盖
  showTime: computed(() => {
    if (props.showTime !== undefined) return props.showTime;
    return /[Hh]/.test(props.format);
  }),
  className: computed(() => {
    return [
      'form-date-picker',
      'light-form-date-picker',
      { 'fail-form-date-picker': props.formType == 'fail' },
    ];
  }),
  // 当前的显示格式（跟随语言状态，cookie 兜底）：取共享 helper，包装层（FormUTCDatePicker）用同一份
  // 业务组件版无 i18n/cookie 基建，语言恒取 helper.getLang()（zh_CN）
  currentFormat: computed(() => getDisplayFormat(props.format, getLang())),
});
// `input`：把输入框的原生输入事件抛给上层（FormUTCDatePicker 的包装层需要它做"候选值"判定）。
// 纯 additive：本组件自身仍走 inputRender 的粘贴同步，实测外部 166 个调用点 0 处监听 `@input`。
const emit = defineEmits(['update:value', 'change', 'ok', 'input']);

// 值（dayjs）→ 文本（恒为 props.format 的标准串）
const toText = value => {
  return value ? Dayjs.getTimeText(value, props.format) : undefined;
};

const methods = {
  onChange(value) {
    const date = toText(value);
    emit('update:value', date);
    emit('change', date);
  },
  onOk(value) {
    const date = toText(value);
    emit('update:value', date);
    emit('ok', date);
  },
  /**
   * 接管输入框渲染：只为拿到 input 的原生输入事件
   *
   * antd 在 showTime 下失焦会回滚手输文本（vc-picker/hooks/usePickerInput.js:88-98），
   * 这里在「粘贴/拖入」发生时主动把值同步出去，避免"粘完不回车就白粘"。
   * 不做全局 DOM 查询、不注册且不累积监听，作用域就是本组件渲染出的这个 input。
   */
  renderInput(inputProps) {
    return h('input', {
      ...inputProps,
      onInput: e => {
        // 先让 antd 走它自己的文本处理（text → 内部值），再补一次粘贴文本的同步
        inputProps.onInput && inputProps.onInput(e);
        methods.syncTypedText(e);
        // 再抛给上层：包装层（FormUTCDatePicker）据此记录"输入框候选值"，
        // 用于越界时「确定」灰显 —— 它拿不到本组件的 inputRender（绑定排在 $attrs 之后会被顶掉）
        emit('input', e);
      },
    });
  },
  syncTypedText(e) {
    // 只处理「一次性完整文本」（粘贴 / 拖入）：逐字输入会产生 new Date("2025") 这类
    // 合法但残缺的中间态，不应写进表单
    const inputType = (e && e.inputType) || '';
    if (!/^(insertFromPaste|insertFromDrop)$/.test(inputType)) return;
    const text = (e && e.target && e.target.value) || '';
    if (!text) return;
    // 与「当前显示文本」同口径比较：没有实质变化就不 emit（回显/默认值场景零副作用）
    if (text === Dayjs.getTimeText(props.value, state.currentFormat)) return;
    const date = Dayjs.getTimeText(text, props.format);
    if (!date || date == 'Invalid Date') return;
    // 与面板同口径：超出 disabledDate 的时间串同样不接受（antd 的 onSubmit 也是这么判的）
    if (methods.isDisabledByAttrs(Dayjs.getDayjsTime(date))) return;
    emit('update:value', date);
    emit('change', date);
  },
  // disabledDate 由调用方经 $attrs 透传（`disabled-date` / `disabledDate` 两种写法都收）
  isDisabledByAttrs(date) {
    const disabledDate = attrs.disabledDate || attrs['disabled-date'];
    return typeof disabledDate === 'function' ? !!disabledDate(date) : false;
  },
};

// format 变化：按新格式重新格式化并回传
watch(
  () => props.format,
  () => {
    emit('update:value', toText(state.value));
  },
);
// 外部值 → 内部 dayjs（单一方向镜像；外部字符串永远是唯一真值来源）
watch(
  () => props.value,
  value => {
    try {
      if (value && value != 'Invalid Date') {
        state.value = Dayjs.getDayjsTime(value);
      } else {
        state.value = undefined;
      }
    } catch (err) {
      state.value = undefined;
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.form-date-picker.ant-picker {
  width: 100%;
  border-radius: var(--border-radius-base, 4px);
  &.light-form-date-picker {
    border-color: var(--border-color-line, #d9d9d9);
  }
  &.ant-picker-focused {
    box-shadow: none;
    border-color: var(--primary-color, #0032a0);
  }
  &.fail-form-date-picker {
    border-color: var(--error-color, #f6530f);
    color: var(--error-color, #f6530f);
    // 内层 input 由 antd 渲染，作用域属性选择器命中不到 → 必须 :deep()
    :deep(input),
    :deep(input)::placeholder {
      color: var(--error-color, #f6530f);
    }
  }
}
</style>
