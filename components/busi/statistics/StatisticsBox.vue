<template>
  <div
    :class="['statistics-box', { 'is-collapsible': collapsible, 'is-expanded': state.expanded }]"
  >
    <div
      ref="bodyRef"
      class="statistics-box__body"
      :style="{ '--statistics-columns': columnCount }"
    >
      <slot></slot>
    </div>
    <!-- 图标按钮：文案只进 title/aria-label，宽度因此与语言无关（固定列宽即可） -->
    <button
      v-if="showToggle"
      type="button"
      class="statistics-box__toggle"
      :title="toggleText"
      :aria-label="toggleText"
      :aria-expanded="state.expanded"
      @click="methods.toggle"
    >
      <!-- 双箭头两态换图：收起=doubleDown，展开=doubleUp -->
      <SvgIcon :icon="state.expanded ? 'icon-core-doubleUp' : 'icon-core-doubleDown'" size="12" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, reactive, ref } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';

const props = defineProps({
  /** 是否允许折叠：false（默认）= 不裁剪、全量展开，内容永不被静默截断 */
  collapsible: { type: Boolean, default: false },
  /** 一行几列（固定列数，条目自动换行成多行） */
  columns: { type: Number, default: 4 },
});

const bodyRef = ref<HTMLElement | null>(null);
const state = reactive({
  /** 已展开 */
  expanded: false,
  /** 收起态下内容是否真的超出一行（由 DOM 实测，不靠调用方猜测） */
  overflowing: false,
});

const columnCount = computed(() => Math.max(1, Math.trunc(Number(props.columns)) || 1));
/** 只有「允许折叠」且「确实溢出」时才出开关：恰好一行时不留假按钮 */
const showToggle = computed(() => props.collapsible && state.overflowing);
/** 开关只剩图标，文案走原生 title / aria-label（多语言只影响 tooltip，不影响布局） */
const toggleText = computed(() => (state.expanded ? '收起' : '更多'));

const methods = {
  /**
   * 收起态实测内容高度：scrollHeight > clientHeight 即溢出。
   * 只在收起态测量（展开时 clientHeight 随内容走，测了也恒等）。
   */
  measure() {
    const el = bodyRef.value;
    if (!el || !props.collapsible || state.expanded) return;
    state.overflowing = el.scrollHeight > el.clientHeight + 1;
  },
  toggle() {
    state.expanded = !state.expanded;
  },
};

onMounted(methods.measure);
onUpdated(methods.measure);
</script>

<style lang="less" scoped>
.statistics-box {
  // 行高单一源：喂 grid 行轨道、收起高度、开关高度三处
  --statistics-row-height: 48px;
  // 开关列宽：只有一枚图标，40px 足够点击区；文案在 title 里，不参与布局
  --statistics-toggle-width: 40px;

  display: flex;
  align-items: flex-start;
  width: 100%;
  border-bottom: 1px solid var(--divider-color, #f0f0f0);

  // 内容区：列几何只在这里定义，条目不带任何尺寸
  &__body {
    flex: 1 1 auto;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(var(--statistics-columns), minmax(0, 1fr));
    grid-auto-rows: var(--statistics-row-height);
    align-content: start;
    overflow: hidden;
  }

  // 裁剪只是折叠的产物：不可折叠时高度随内容，绝不静默丢条目
  &.is-collapsible &__body {
    height: var(--statistics-row-height);
  }

  &.is-expanded &__body {
    height: auto;
  }

  // 开关只有图标：固定列宽，文案走 title ⇒ 与语言长度无关
  &__toggle {
    flex: 0 0 var(--statistics-toggle-width);
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--statistics-row-height);
    padding: 0;
    color: var(--primary-color, #0032a0);
    background: none;
    border: 0;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &:focus-visible {
      outline: 2px solid var(--primary-color, #0032a0);
      outline-offset: -2px;
      border-radius: 2px;
    }
  }
}
</style>
