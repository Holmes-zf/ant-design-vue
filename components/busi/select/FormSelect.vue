<template>
  <a-select
    allow-clear
    :class="className"
    :placeholder="'请选择'"
    :getPopupContainer="methods.getPopupContainer"
    :mode="$attrs.multiple"
    v-model:open="open"
    @dropdownVisibleChange="methods.dropdownVisibleChange"
    v-bind="$attrs"
    v-model:value="selectValue"
    @change="methods.handleChange"
  >
    <a-select-option
      v-for="item in options"
      :item="item"
      :label="item.label"
      :value="item.value"
      :key="item.value"
      :disabled="item.disabled"
    >
      <span :title="item.label">
        {{ item.label }}
      </span>
    </a-select-option>
    <template #suffixIcon>
      <slot name="suffixIcon">
        <SvgIcon
          :icon="open ? 'icon-YTupward' : 'icon-YTdownward'"
          size="10px"
          @click="() => (open = !open)"
        />
      </slot>
    </template>
  </a-select>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';

const props = defineProps({
  // ① 数据绑定
  value: {
    type: [String, Array, Number],
    default: undefined,
  },
  // options 的 value 为数组时，合并拼接为字符串用于下拉展示
  joinArrayValue: {
    type: Boolean,
    default: false,
  },
  // ② 数据源
  options: {
    type: Array,
    default: () => [],
  },
  // ③ 展示
  formType: {
    type: String,
    default: '',
    validator: value => {
      return ['', 'fail'].includes(value);
    },
  },
  heightClass: {
    // 暂时独立性扩展，后续需要统一规划集成
    type: String,
    default: 'nowrap',
  },
  // ④ 扩展（低频/历史兼容）
  fieldNames: {
    type: Object,
    default: _ => {
      return { label: 'label', value: 'value' };
    },
  },
  dictCode: {
    type: String,
    default: '',
  },
  filterValues: {
    type: Array,
    default: () => [],
  },
  showAll: {
    // 是否显示全部
    type: Boolean,
    default: true,
  },
  // 数据只有一条时，是否默认显示
  defaultSelect: {
    type: Boolean,
    default: false,
  },
  // 值不符合，是否清除错误值 默认不清除
  isClearErrorValue: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:value', 'change']);

// 内部状态
const open = ref(false);
const selectValue = ref(props.value ?? undefined);

// 计算属性
const className = computed(() => {
  return [
    'form-select',
    { 'fail-form-select': props.formType == 'fail' },
    props.heightClass,
  ];
});

const options = computed(() => {
  let list = props.options || [];
  if (props.dictCode) {
    // 原实现：$useStore.getters.getDictByKey(props.dictCode)
    // 业务组件版本未接入字典服务，dictCode 暂不生效，直接使用 props.options
    list = list.slice();
    if (props.filterValues.length) {
      list = list.filter(v => props.filterValues.includes(v.value));
    }
    if (!props.showAll) {
      list = list.filter(v => String(v.value) != '');
    }
  }
  if (props.joinArrayValue) {
    list = list.map(item => {
      return {
        ...item,
        [props.fieldNames.value]: Array.isArray(item[props.fieldNames.value])
          ? item[props.fieldNames.value].join(',')
          : item[props.fieldNames.value],
        // 原实现优先使用 $t(item['langKey']) 国际化翻译，业务组件版本无 i18n 服务，直接使用 label
        [props.fieldNames.label]: item[props.fieldNames.label],
      };
    });
  }
  return list;
});

const methods = {
  // 初始化检测一次错误值
  init() {
    if (props.isClearErrorValue) {
      methods.clearErrorValue(selectValue.value);
    }
  },
  // dom节点容器处理
  getPopupContainer(triggerNode) {
    return triggerNode.parentNode;
  },
  // 下拉切换：同步开合状态（Ant Design 的 open 为单向 prop，需手动同步）
  dropdownVisibleChange(val) {
    open.value = val;
  },
  // 用户选择 → 转发给外部（selectValue 由内部 v-model 自动更新，此处仅转发事件）
  handleChange(value, option) {
    emits('update:value', value);
    emits('change', value, option);
  },
  // 获取匹配的错误值：类型容错（数字/字符串互转），排除空值误匹配（0==""、null==undefined 等）
  getErrorValue(val) {
    const isMatch = (optValue, cur) =>
      optValue != null && cur != null && String(optValue) === String(cur);
    return options.value.find(v => isMatch(v.value, val))?.value;
  },
  // 清除非匹配错误值，并主动同步外部 v-model（避免组件显示与父组件数据割裂）
  clearErrorValue(newVal) {
    // 数组多选场景不校验，避免清空为 undefined 破坏数组类型
    if (Array.isArray(newVal)) return;
    const errorValue = methods.getErrorValue(newVal);
    // 仅"未匹配到"（undefined）才清理，避免 0/"" 等合法值被误清
    if (errorValue === undefined) {
      selectValue.value = errorValue;
      // 编程式赋值不会触发 <a-select> 的 @change，需主动 emit 同步父组件
      emits('update:value', errorValue);
      emits('change', errorValue);
    }
  },
};

// ========== 状态同步 watch 区 ==========

// 外部 v-model → 内部（初始值已由 ref(props.value) 同步，无需 immediate）
watch(
  () => props.value,
  v => {
    selectValue.value = v;
  },
);

// 自动选中：options 只有 1 条 + 当前无值时自动选中，并主动同步外部 v-model
watch(
  options,
  list => {
    if (props.defaultSelect && list.length === 1 && selectValue.value == null) {
      const first = list[0];
      selectValue.value = first.value;
      // 编程式赋值不会触发 <a-select> 的 @change，需主动 emit 同步父组件
      emits('update:value', first.value);
      emits('change', first.value, {
        label: first.label,
        value: first.value,
        item: first,
      });
    }
  },
  { immediate: true },
);

// 值变更错误校验
watch(selectValue, newVal => {
  if (props.isClearErrorValue) {
    methods.clearErrorValue(newVal);
  }
});

onMounted(() => {
  methods.init();
});
</script>

<style lang="less" scoped>
@primary-color: #0032a0;
@error-color: #f6530f;

.form-select {
  background: transparent;

  &.ant-select:not(.ant-select-disabled) {
    :deep(.ant-select-selector) {
      border-radius: 4px;
      background-color: #fff;
      border-color: #d9d9d9;
    }
  }

  &.ant-select-disabled {
    :deep(.ant-select-selector) {
      background: #f5f5f5;
    }
  }

  &.ant-select-open,
  &.ant-select-focused:not(.ant-select-disabled):not(
      .ant-select-customize-input
    ) {
    :deep(.ant-select-selector) {
      border-color: @primary-color;
      box-shadow: none;
    }
  }

  &.fail-form-select {
    :deep(.ant-select-selector) {
      border-color: @error-color;
      color: @error-color;

      input,
      input::placeholder,
      .ant-select-selection-placeholder {
        color: @error-color;
      }
    }
  }

  &.nowrap {
    &.ant-select[multiple='multiple'] {
      :deep(.ant-select-selector) {
        width: 100%;
        .ant-select-selection-overflow {
          flex-wrap: nowrap;
          min-width: 0;
          width: 0;
          word-break: break-word;
          overflow: auto;
          text-overflow: ellipsis;
          scrollbar-width: none;
          &::-webkit-scrollbar {
            display: none;
          }
        }
      }
    }
  }
}
</style>
