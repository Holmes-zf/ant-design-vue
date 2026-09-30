<template>
  <div class="dc-date-panel" :class="`dc-date-panel--${position}`">
    <!-- 日期视图：离开网格统一清预览（禁用格不触发 td 的 mouseleave，靠这层兜底） -->
    <div v-if="viewMode === 'date'" class="dc-date-panel__main" @mouseleave="$emit('hover', null)">
      <PanelHeader
        :position="position"
        :title="headerTitle"
        :show-super-prev="position === 'left'"
        :show-prev="position === 'left'"
        :show-next="position === 'right'"
        :show-super-next="position === 'right'"
        @prev="$emit('prev')"
        @next="$emit('next')"
        @super-prev="$emit('super-prev')"
        @super-next="$emit('super-next')"
      />
      <RangeContextProvider :value="state.rangeContext">
        <PickerPanel
          class="dc-date-panel__grid"
          :prefix-cls="PANEL_PREFIX_CLS"
          :locale="state.locale"
          :generate-config="generateConfig"
          picker="date"
          mode="date"
          :value="state.sideValue"
          :picker-value="pickerValue"
          :hide-header="true"
          :show-today="false"
          :disabled-date="methods.getDisabledDate"
          :date-render="methods.renderDate"
          @select="methods.onSelect"
        />
      </RangeContextProvider>
    </div>

    <!-- 时间视图 -->
    <div v-else class="dc-date-panel__main dc-date-panel__main--time">
      <DateTimeColumns
        :format="timeFormat"
        :value="timeValue"
        :disabled-time="disabledTime"
        @select="methods.onTimeSelect"
      />
    </div>

    <!-- 底部视图切换：日期格 + 时间格（每个面板各一组，双面板合为四格） -->
    <div v-if="showTime" class="dc-date-panel__tabs">
      <div
        class="dc-date-panel__tab"
        :class="{ 'is-active': viewMode === 'date' }"
        @click="$emit('view-change', 'date')"
      >
        <SvgIcon icon="icon-core-shijianriqi" :size="12" />
        <span class="dc-date-panel__tab-text">{{ state.dateText }}</span>
      </div>
      <div
        class="dc-date-panel__tab"
        :class="{ 'is-active': viewMode === 'time' }"
        @click="$emit('view-change', 'time')"
      >
        <SvgIcon icon="icon-core-shijian-biao" :size="12" />
        <span class="dc-date-panel__tab-text">{{ state.timeText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, computed, reactive } from 'vue';
import SvgIcon from '../../icon/SvgIcon.vue';
import {
  PANEL_PREFIX_CLS,
  PickerPanel,
  RangeContextProvider,
  generateConfig,
  useAntPickerLocale,
  useProvidePanel,
} from '../helper/antPanel.js';
import PanelHeader from './PanelHeader.vue';
import DateTimeColumns from './DateTimeColumns.vue';

const props = defineProps({
  /** 面板位置：left = 起始侧，right = 结束侧 */
  position: {
    type: String,
    default: 'left',
    validator: value => ['left', 'right'].includes(value),
  },
  /** 面板标题（如 2026-09） */
  headerTitle: {
    type: String,
    default: '',
  },
  /** 面板显示月份 */
  pickerValue: {
    type: Object,
    default: undefined,
  },
  /** 范围值 [start, end]，用于范围高亮 */
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
  disabledTime: {
    type: Object,
    default: undefined,
  },
  /** 是否展示时间（决定底部是否出现视图切换格） */
  showTime: {
    type: Boolean,
    default: true,
  },
  /** 当前视图：date | time，左右面板共享 */
  viewMode: {
    type: String,
    default: 'date',
  },
  /** 该侧时间值 */
  timeValue: {
    type: Object,
    default: undefined,
  },
  /** 时间列格式 */
  timeFormat: {
    type: String,
    default: 'HH:mm:ss',
  },
});

const $emit = defineEmits([
  'select',
  'prev',
  'next',
  'super-prev',
  'super-next',
  'view-change',
  'time-select',
  'hover',
]);

/**
 * 单元格悬停 → 供上层做「拖动选日期时的区间预览」
 *
 * 双通道：
 * ① antd 的 PanelContext.onDateMouseenter（只对未禁用格触发，覆盖常规格子）；
 * ② dateRender 自定义格子内容（自己绑 mouseenter，覆盖禁用格 —— 越界预览必需）。
 * 同一格两者给出同一日期，重复 emit 无副作用；任一通道失效都还有另一条兜底。
 */
useProvidePanel({
  onDateMouseenter: date => $emit('hover', date),
  onDateMouseleave: () => $emit('hover', null),
});

const pickerLocale = useAntPickerLocale();

const state = reactive({
  locale: pickerLocale,
  /**
   * 本侧受控值 → 喂给 PickerPanel 的 `value`
   *
   * 必须显式给，且空值要给 `null`（不能是 undefined）：PickerPanel 的 `value` 是
   * `useMergedState(null, { value })`，只有「value 有定义」时受控才生效；一旦是 undefined
   * 它就退回自己的内部值 —— 而内部值会被每次落笔的 `triggerSelect → setInnerValue(date)`
   * 改写（`vc-picker/PickerPanel.js:209-228`），于是 `-selected`（实底主色）会永久留在
   * 「该面板里最后点过的那一天」上，表现为另一侧月份里冒出个赖着不走的深色格子。
   * 传我们的值后，`-selected` 只跟随本侧端点，空侧为空。
   */
  sideValue: computed(() => {
    const index = props.position === 'left' ? 0 : 1;
    return props.rangeValue?.[index] ?? null;
  }),
  // 传给 ant 的 range 上下文：驱动范围高亮与悬停预览
  rangeContext: computed(() => ({
    inRange: true,
    panelPosition: props.position,
    rangedValue: props.rangeValue,
    hoverRangedValue: props.hoverValue,
  })),
  // 该侧日期格文案（与 arco 一致，固定 YYYY-MM-DD）
  dateText: computed(() => {
    const value = props.rangeValue?.[props.position === 'left' ? 0 : 1];
    return value ? value.format('YYYY-MM-DD') : '--';
  }),
  // 该侧时间格文案（与 arco 一致，固定 HH:mm:ss）
  timeText: computed(() => (props.timeValue ? props.timeValue.format('HH:mm:ss') : '00:00:00')),
});

const methods = {
  /**
   * 单元格禁用判据 = 上层判据（方向 / 顺序 / 跨度）∪「非本月」
   *
   * 双面板各自锁定自己的月份（pickerValue 受控），网格首尾的上下月补位格只是排版补位：
   * 不参与点选、也不参与端点 / 区间高亮 —— 否则会出现「在 8 月面板里 9 月 4 号被画成端点」，
   * 而且点它还能把值改成 9 月（月份又不跟着走），看起来就是渲染和交互一起错。
   * 置灰由 `.ant-picker-cell-disabled` 样式接管（底色 --disabled-bg-color、文案 --disabled-color）。
   */
  getDisabledDate(current) {
    if (!current) return false;
    if (props.pickerValue && !current.isSame(props.pickerValue, 'month')) {
      return true;
    }
    return props.disabledDate ? props.disabledDate(current) : false;
  },
  onSelect(date) {
    $emit('select', date);
  },
  onTimeSelect(value) {
    $emit('time-select', value);
  },
  /**
   * 自定义日期格内容：沿用 antd 的 inner 类名与日期文本（今日圆点 / 端点实底等
   * 仍由 cell 上的类驱动），只是把手动 hover 事件接上 —— 禁用格也能触发，
   * 越界预览才能延伸过去。
   */
  renderDate({ current }) {
    return h(
      'div',
      {
        class: 'ant-picker-cell-inner',
        onMouseenter: () => $emit('hover', current),
        // inner 只有 30px、格子更大，指针从 inner 挪进本格 padding 时 relatedTarget 还在本 td 内，
        // 这时清预览会让预览闪一下；只有真的离开这一格才清
        onMouseleave: e =>
          e.currentTarget.parentElement?.contains(e.relatedTarget) || $emit('hover', null),
      },
      current.date(),
    );
  },
};
</script>

<style lang="less" scoped>
// 业务主题变量在文档站点无定义：var() 内联回落值取自外部系统 light 主题基线，接入业务主题后仍可被覆盖
.dc-date-panel {
  display: flex;
  flex-direction: column;
  width: 296px;

  &__main {
    padding: 0 12px;

    &--time {
      padding-top: 4px;
      padding-bottom: 8px;
    }
  }

  &__tabs {
    display: flex;
    margin-top: 4px;
    border-top: 1px solid var(--divider-color, #eeeeee);
  }

  &__tab {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 38px;
    font-size: 13px;
    color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    & + & {
      border-left: 1px solid var(--divider-color, #eeeeee);
    }

    &:hover {
      color: var(--primary-color, #0032a0);
    }

    &.is-active {
      color: var(--primary-color, #0032a0);
      background: var(--select-bg-color, #f5f7fa);
    }
  }

  &__tab-text {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ========== 视觉对齐：覆盖 ant 面板网格样式 ==========
.dc-date-panel__grid {
  width: 100%;

  :deep(.ant-picker-content th) {
    padding: 4px 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
  }

  :deep(.ant-picker-cell) {
    padding: 2px 0;

    .ant-picker-cell-inner {
      width: 30px;
      height: 30px;
      line-height: 30px;
      font-size: 13px;
      color: var(--text-color, rgba(0, 0, 0, 0.65));
      border-radius: 4px;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    &:not(.ant-picker-cell-in-view) .ant-picker-cell-inner {
      color: var(--disabled-color, #999999);
    }

    &:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(
        .ant-picker-cell-range-end
      ) {
      .ant-picker-cell-inner {
        background: var(--select-bg-color, #f5f7fa);
        background: color-mix(in srgb, var(--range-hover-bg-color, #5489ff) 12%, transparent);
      }
    }

    // 已选区间底纹：滑动预览底色的浅色档（同一蓝，弱于预览）
    &.ant-picker-cell-in-range::before {
      background: var(--select-bg-color, #f5f7fa);
      background: color-mix(
        in srgb,
        var(--range-hover-bg-color, #5489ff) 35%,
        var(--bg-color-white, #fff)
      );
    }

    // 滑动预览（拖动选日期时的区间）：
    // - 落在已选区间内（-in-range）→ 直接用 --range-hover-bg-color 实色（比已选区间亮）
    //   带上 -range-hover-start/-end 后缀两个变体：滑到的那一格（= 滑动端点）实际带的常是这两个
    //   后缀类，只匹配 -range-hover 会漏掉它，那格就退回已选底纹（浅色）
    // - 超出已选区间 → 不填色，交给 antd 原生 -range-hover:not(-in-range) 的 ::after 虚线
    &.ant-picker-cell-in-range.ant-picker-cell-range-hover:not(.ant-picker-cell-disabled)::before,
    &.ant-picker-cell-in-range.ant-picker-cell-range-hover-start:not(
        .ant-picker-cell-disabled
      )::before,
    &.ant-picker-cell-in-range.ant-picker-cell-range-hover-end:not(
        .ant-picker-cell-disabled
      )::before {
      background: var(--range-hover-bg-color, #5489ff);
    }

    // antd 还会给「滑动格 / 紧邻已选端点的预览格」在 inner::after 补一层实心预览色
    // （会伸出格子外），视觉上像把格子涂蓝或溢出，这里统一去掉
    &.ant-picker-cell-range-hover-start .ant-picker-cell-inner::after,
    &.ant-picker-cell-range-hover-end .ant-picker-cell-inner::after,
    &.ant-picker-cell-range-start-near-hover .ant-picker-cell-inner::after,
    &.ant-picker-cell-range-end-near-hover .ant-picker-cell-inner::after {
      display: none;
    }

    // 端点：主色实底
    &.ant-picker-cell-range-start .ant-picker-cell-inner,
    &.ant-picker-cell-range-end .ant-picker-cell-inner,
    &.ant-picker-cell-selected .ant-picker-cell-inner {
      font-weight: 500;
      color: var(--bg-color-white, #fff);
      background: var(--primary-color, #0032a0);
    }

    // 端点格 inner 铺满整格：与相邻格的区间底纹无缝衔接。
    // 否则主色块（固定 30px）两边会露出底纹边条，看起来像蓝块溢出格子
    &.ant-picker-cell-range-start .ant-picker-cell-inner,
    &.ant-picker-cell-range-end .ant-picker-cell-inner {
      width: 100%;
    }

    // 今日：日期下方圆点（覆盖 ant 的方框）
    &.ant-picker-cell-today .ant-picker-cell-inner::after {
      top: auto;
      right: auto;
      bottom: 3px;
      left: 50%;
      width: 4px;
      height: 4px;
      margin-left: -2px;
      border: none;
      border-radius: 50%;
      background: var(--primary-color, #0032a0);
    }

    &.ant-picker-cell-today.ant-picker-cell-range-start .ant-picker-cell-inner::after,
    &.ant-picker-cell-today.ant-picker-cell-range-end .ant-picker-cell-inner::after,
    &.ant-picker-cell-today.ant-picker-cell-selected .ant-picker-cell-inner::after {
      background: var(--bg-color-white, #fff);
    }

    // 禁用格（含越界 / 超跨度）：文案置灰 + 底色取主题的禁用背景（--disabled-bg-color），
    // 不参与区间底纹 / 端点实底
    // 必须放在区间底纹、端点实底、今日圆点规则之后 —— 同特异性时靠后者生效
    &.ant-picker-cell-disabled {
      cursor: not-allowed;

      .ant-picker-cell-inner {
        // 仅内层恢复 hover 命中（点击仍被 antd 的 disabled 判断拦住）：越界格要能触发悬停
        pointer-events: auto;
        color: var(--disabled-color, #999999);
        background: transparent;
      }

      &::before {
        background: var(--disabled-bg-color, #eceeed);
      }

      &.ant-picker-cell-today .ant-picker-cell-inner::after {
        background: var(--disabled-color, #999999);
      }
    }
  }

  // 滑动 band 内的格子（含刚滑到的那一格）：antd 会给「已选区间内 + -range-hover」的格子
  // 在 inner::after 补一层浅色（会向外扩 6px），把这一格涂得比 band 里其它格浅。
  // 这条带 .ant-picker-date-panel 前缀，特异性比上面那条高，必须按同前缀 + 更宽的匹配压掉，
  // 保证 band 内每一格同色（-range-hover 已覆盖 -range-hover-start / -end）
  :deep(
      .ant-picker-date-panel
        .ant-picker-cell-in-range.ant-picker-cell-range-hover
        .ant-picker-cell-inner::after
    ) {
    display: none;
  }
}
</style>
