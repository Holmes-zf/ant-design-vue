<template>
  <a-input
    v-bind="$attrs"
    v-model:value="state.inputValue"
    auto-complete="off"
    :class="state.className"
    :placeholder="placeholder"
    allow-clear
    :readonly="!state.autoFlag"
    @mouseenter="mouseenter"
    @blur="handleBlur"
    @change="handleChange"
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}"></slot>
    </template>
  </a-input>
</template>

<script setup lang="ts">
import { reactive, watch, computed, inject, unref, ref } from 'vue';

// 定义属性
interface Props {
  mode?: 'light' | 'dark' | '';
  placeholder?: string;
  formType?: '' | 'fail';
  isAutoComplete?: boolean;
  value?: string;
  trim?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: '',
  placeholder: '',
  formType: '',
  isAutoComplete: true,
  value: '',
  trim: true,
});

// 定义事件
const emit = defineEmits<{
  (e: 'blur', event: FocusEvent): void;
  (e: 'update:value', value: string): void;
  (e: 'change', event: Event): void;
}>();

// 注入表单盒子属性
const formBoxProps = inject('formBoxProps', ref(null));

// 组件状态
const state = reactive({
  autoFlag: props.isAutoComplete,
  inputValue: props.value || undefined,
  boxMode: computed(() => {
    return (unref(formBoxProps) && unref(formBoxProps).mode) || undefined;
  }),
  className: computed(() => {
    const mode = props.mode || 'light';
    const baseClasses = ['form-input', `${mode}-form-input`];

    if (props.formType === 'fail') {
      baseClasses.push('fail-form-input');
    }

    return baseClasses;
  }),
});

// 鼠标悬停事件
const mouseenter = () => {
  if (!state.autoFlag) {
    state.autoFlag = true;
  }
};

// 失焦处理
const handleBlur = (e: FocusEvent) => {
  let value = (e.target as HTMLInputElement).value;

  if (props.trim) {
    value = value.trim();
    // 仅失焦触发 v-model 同步更新
    emit('update:value', value);
  }

  // 原始 blur 事件
  emit('blur', e);
};

// 变化处理
const handleChange = (e: Event) => {
  // 实时输入保持原值同步
  emit('update:value', state.inputValue);
  emit('change', e);
};

// 监听外部值的变化
watch(
  () => props.value,
  newVal => {
    if (state.inputValue !== newVal) {
      state.inputValue = newVal;
    }
  },
);
</script>

<style lang="less">
@primary-color: #0032a0; // 全局主色
@link-color: #0032a0; // 链接色 1890ff
@success-color: #52c41a; // 成功色
@warning-color: #faad14; // 警告色
@error-color: #f6530f; // 错误色
@danger-color: #f5222d; // 危险色
.form-input {
  border-radius: 4px !important;

  &.light-form-input {
    background-color: #fff !important;
    border-color: #d9d9d9 !important;
  }

  &.dark-form-input {
    background-color: #f5f5f5 !important;
    border-color: #ccc !important;
  }

  &.ant-input-affix-wrapper-focused {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%) !important;
  }

  &.light-form-input,
  &.dark-form-input {
    &.fail-form-input,
    &.fail-form-input input {
      border-color: @error-color !important;
      color: @error-color !important;

      &:focus {
        border-color: @error-color !important;
        color: @error-color !important;
      }

      &::placeholder {
        color: @error-color !important;
      }
    }
  }

  &.ant-input-affix-wrapper-disabled {
    background: #f5f5f5 !important;

    .ant-input[disabled] {
      color: rgba(0, 0, 0, 0.85) !important;
    }
  }
}
</style>
