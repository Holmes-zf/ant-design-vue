<template>
  <a-input
    v-model:value="inputValue"
    :class="className"
    :placeholder="placeholder || '请输入'"
    allow-clear
    :readonly="!autoFlag"
    autoComplete="off"
    v-bind="$attrs"
    @blur="handleBlur"
    @change="handleChange"
    @mouseenter="mouseenter"
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </a-input>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({
  // ① 数据绑定
  value: {
    type: String,
    default: '',
  },
  trim: {
    type: Boolean,
    default: true,
  },
  // ② 展示相关
  placeholder: {
    type: String,
    default: '',
  },
  formType: {
    type: String,
    default: '',
    validator: value => {
      return ['', 'fail'].includes(value);
    },
  },
  // ③ 行为控制
  isAutoComplete: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['blur', 'update:value', 'change']);

const autoFlag = ref(props.isAutoComplete);
const inputValue = ref(props.value ?? undefined);

const className = computed(() => {
  return ['form-input', { 'fail-form-input': props.formType == 'fail' }];
});

const mouseenter = () => {
  if (!autoFlag.value) autoFlag.value = true;
};

const handleBlur = e => {
  let value = e.target.value;
  if (props.trim) {
    value = value.trim();
    if (value !== inputValue.value) {
      emits('update:value', value);
    }
  }
  emits('blur', e);
};

const handleChange = e => {
  emits('update:value', inputValue.value);
  emits('change', e);
};

watch(
  () => props.value,
  newVal => {
    if (inputValue.value !== newVal) {
      inputValue.value = newVal;
    }
  },
);
</script>

<style lang="less" scoped>
@primary-color: #0032a0;
@error-color: #f6530f;

.form-input {
  // Base: normal state
  &.ant-input-affix-wrapper {
    border-radius: 4px;
    background-color: #fff;
    border-color: #d9d9d9;
  }

  // Focus state
  &.ant-input-affix-wrapper.ant-input-affix-wrapper-focused {
    border-color: @primary-color;
    box-shadow: none;
  }

  // Error state
  &.fail-form-input.ant-input-affix-wrapper {
    border-color: @error-color;

    .ant-input {
      color: @error-color;
    }

    .ant-input::placeholder {
      color: @error-color;
    }

    &.ant-input-affix-wrapper-focused {
      border-color: @error-color;
    }
  }

  // Disabled state
  &.ant-input-affix-wrapper-disabled.ant-input-affix-wrapper {
    background: #f5f5f5;

    .ant-input[disabled] {
      color: rgba(0, 0, 0, 0.85);
    }
  }
}
</style>
