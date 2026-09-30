<template>
  <div class="dc-range-panel">
    <div class="dc-range-panel__panels">
      <DatePanel
        position="left"
        :header-title="state.leftTitle"
        :picker-value="headerValue[0]"
        :range-value="rangeValue"
        :hover-value="hoverValue"
        :disabled-date="disabledDate"
        :disabled-time="state.leftDisabledTime"
        :show-time="showTime"
        :view-mode="viewMode"
        :time-value="timeValue[0]"
        :time-format="timeFormat"
        @select="$emit('select', $event)"
        @prev="$emit('prev')"
        @next="$emit('next')"
        @super-prev="$emit('super-prev')"
        @super-next="$emit('super-next')"
        @view-change="$emit('view-change', $event)"
        @time-select="$emit('time-select', 0, $event)"
        @hover="$emit('hover', $event)"
      />
      <DatePanel
        position="right"
        :header-title="state.rightTitle"
        :picker-value="headerValue[1]"
        :range-value="rangeValue"
        :hover-value="hoverValue"
        :disabled-date="disabledDate"
        :disabled-time="state.rightDisabledTime"
        :show-time="showTime"
        :view-mode="viewMode"
        :time-value="timeValue[1]"
        :time-format="timeFormat"
        @select="$emit('select', $event)"
        @prev="$emit('prev')"
        @next="$emit('next')"
        @super-prev="$emit('super-prev')"
        @super-next="$emit('super-next')"
        @view-change="$emit('view-change', $event)"
        @time-select="$emit('time-select', 1, $event)"
        @hover="$emit('hover', $event)"
      />
    </div>
    <div class="dc-range-panel__footer">
      <a-button type="primary" size="small" :disabled="confirmDisabled" @click="$emit('confirm')">
        确定
      </a-button>
    </div>
  </div>
</template>

<script setup>
// 外部原实现经 i18nMixins 取 $t("common.determine")；业务组件版无 i18n 服务，按
// 外部语言文件 src/utils/i18n/modules/common.js 的准确值直接写中文「确认」
import { computed, reactive } from 'vue';
import DatePanel from './DatePanel.vue';

const props = defineProps({
  /** 左右面板显示月份 [left, right] */
  headerValue: {
    type: Array,
    default: () => [],
  },
  /** 范围值 [start, end] */
  rangeValue: {
    type: Array,
    default: () => [],
  },
  /** 悬停预览区间 */
  hoverValue: {
    type: Array,
    default: null,
  },
  disabledDate: {
    type: Function,
    default: undefined,
  },
  /** 禁用时间工厂：(index) => disabledTimeProps */
  disabledTime: {
    type: Function,
    default: undefined,
  },
  showTime: {
    type: Boolean,
    default: true,
  },
  viewMode: {
    type: String,
    default: 'date',
  },
  timeValue: {
    type: Array,
    default: () => [],
  },
  timeFormat: {
    type: String,
    default: 'HH:mm:ss',
  },
  confirmDisabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'select',
  'prev',
  'next',
  'super-prev',
  'super-next',
  'view-change',
  'time-select',
  'hover',
  'confirm',
]);

const state = reactive({
  leftTitle: computed(() => props.headerValue?.[0]?.format('YYYY-MM') || ''),
  rightTitle: computed(() => props.headerValue?.[1]?.format('YYYY-MM') || ''),
  leftDisabledTime: computed(() => (props.disabledTime ? props.disabledTime(0) : undefined)),
  rightDisabledTime: computed(() => (props.disabledTime ? props.disabledTime(1) : undefined)),
});
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.dc-range-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-color-white, #fff);

  &__panels {
    display: flex;
    gap: 8px;
    padding: 8px 4px 4px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 12px;
    border-top: 1px solid var(--divider-color, #eeeeee);
  }
}
</style>
