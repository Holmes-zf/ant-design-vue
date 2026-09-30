<template>
  <div ref="columnsRef" class="dc-time-columns">
    <div v-for="column in columns" :key="column.type" class="dc-time-columns__col">
      <div
        v-for="item in column.list"
        :key="item.value"
        class="dc-time-columns__cell"
        :class="{ 'is-selected': item.selected, 'is-disabled': item.disabled }"
        @click="methods.pick(column.type, item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Dayjs from '../helper/dayjs';

const props = defineProps({
  /** 时间格式，决定出几列（H/h → 时，m → 分，s → 秒） */
  format: {
    type: String,
    default: 'HH:mm:ss',
  },
  /** 当前时间值 */
  value: {
    type: Object,
    default: undefined,
  },
  /** 禁用时间：返回 { disabledHours, disabledMinutes, disabledSeconds } */
  disabledTime: {
    type: Function,
    default: undefined,
  },
});

const $emit = defineEmits(['select']);

const columnsRef = ref(null);

const state = reactive({
  // 当前时间值，缺省时以当前时刻兜底，保证列始终有选中项
  current: computed(() => props.value || Dayjs.getDayjsTime()),
  disabledProps: computed(() => (props.disabledTime && props.disabledTime(state.current)) || {}),
});

const methods = {
  /** 生成某列的候选项 */
  buildList(type, currentValue, disabledList) {
    const total = type === 'hour' ? 24 : 60;
    return Array.from({ length: total }, (_, index) => ({
      value: index,
      label: String(index).padStart(2, '0'),
      selected: index === currentValue,
      disabled: (disabledList || []).includes(index),
    }));
  },
  pick(type, item) {
    if (item.disabled) return;
    let next = state.current.clone();
    if (type === 'hour') next = next.hour(item.value);
    if (type === 'minute') next = next.minute(item.value);
    if (type === 'second') next = next.second(item.value);
    $emit('select', next);
  },
};

const columns = computed(() => {
  const format = props.format || '';
  const defs = [];
  if (/[Hh]/.test(format)) defs.push('hour');
  if (/m/.test(format)) defs.push('minute');
  if (/s/.test(format)) defs.push('second');

  const current = state.current;
  const disabledProps = state.disabledProps;

  return defs.map(type => {
    const currentValue = current[type]();
    const disabledList =
      type === 'hour'
        ? disabledProps.disabledHours
        : type === 'minute'
        ? disabledProps.disabledMinutes
        : disabledProps.disabledSeconds;
    return {
      type,
      list: methods.buildList(type, currentValue, disabledList),
    };
  });
});

/**
 * 把各列的选中项滚到列首
 *
 * 时间列内容远高于可视区（小时 24 格、分/秒 60 格 × 28px，列高仅 224px），
 * 停在 scrollTop = 0 时当前时间（如 18:00）根本不在视野内。对齐 antd TimePanel 的行为：
 * 打开时间视图时把当前值滚到列首（`vc-picker/panels/TimePanel/TimeUnitColumn.js:28-44`）。
 * 只在「时间视图挂载」时执行一次，之后不再动 scrollTop —— 用户手动滚动、点选其它列都不打断；
 * 点自己那一格时格子本来就在视野里，也不需要回位。
 */
const scrollSelectedToTop = () => {
  columnsRef.value?.querySelectorAll('.dc-time-columns__col').forEach(col => {
    const cell = col.querySelector('.dc-time-columns__cell.is-selected');
    if (!cell) return;
    col.scrollTop += cell.getBoundingClientRect().top - col.getBoundingClientRect().top;
  });
};

onMounted(() => scrollSelectedToTop());
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.dc-time-columns {
  display: flex;
  gap: 4px;
  height: 224px;
  overflow: hidden;

  &__col {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 0 4px;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--divider-color, #eeeeee);
      border-radius: 2px;
    }
  }

  &__cell {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--text-color, rgba(0, 0, 0, 0.65));
    border-radius: 3px;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: var(--select-bg-color, #f5f7fa);
      color: var(--primary-color, #0032a0);
    }

    &.is-selected {
      background: var(--select-bg-color, #f5f7fa);
      color: var(--primary-color, #0032a0);
      font-weight: 600;
    }

    &.is-disabled {
      color: var(--disabled-color, #999999);
      cursor: not-allowed;
    }
  }
}
</style>
