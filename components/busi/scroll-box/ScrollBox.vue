<template>
  <div class="scroll-box">
    <div class="scroll-box__arrow is-prev" :class="{ 'is-hidden': !showPrev }">
      <div v-if="props.veil" class="scroll-box__veil" aria-hidden="true"></div>
      <button
        type="button"
        class="scroll-box__trigger"
        aria-label="上一页"
        title="上一页"
        @click="methods.prev"
      >
        <slot name="prev">
          <span class="scroll-box__chip">
            <SvgIcon class="scroll-box__chip-icon" icon="icon-core-prev" size="12" />
          </span>
        </slot>
      </button>
    </div>

    <div
      ref="scrollBodyRef"
      class="scroll-box__body"
      @scroll.passive="methods.syncScroll"
      @wheel="methods.onWheel"
    >
      <div ref="scrollContentRef" class="scroll-box__content">
        <slot></slot>
      </div>
    </div>

    <div class="scroll-box__arrow is-next" :class="{ 'is-hidden': !showNext }">
      <div v-if="props.veil" class="scroll-box__veil" aria-hidden="true"></div>
      <button
        type="button"
        class="scroll-box__trigger"
        aria-label="下一页"
        title="下一页"
        @click="methods.next"
      >
        <slot name="next">
          <span class="scroll-box__chip">
            <SvgIcon class="scroll-box__chip-icon" icon="icon-core-next" size="12" />
          </span>
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance, PropType } from 'vue';
import { computed, onActivated, onBeforeUnmount, onMounted, reactive, ref, unref } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';

const props = defineProps({
  /** 点击箭头的滚动步长：`half`（默认）= 半个可视宽度，数字 = 像素 */
  step: {
    type: [Number, String] as PropType<'half' | number>,
    default: 'half',
  },
  /** 两端渐隐遮罩（默认关）：内容到边缘逐渐淡出容器底色；卡片/图片流需要时再开 */
  veil: {
    type: Boolean,
    default: false,
  },
  /** 纵向滚轮转横向滚动（仅内容溢出时接管，未溢出交还页面滚动） */
  wheel: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['scroll']);

const scrollBodyRef = ref<HTMLElement>();
const scrollContentRef = ref<HTMLElement>();

/**
 * 两个 ref 要到 mount 之后才有值，所以读取一律走取值函数，
 * 不能在 setup 阶段 unref 成常量（那会把 undefined 冻住）。
 */
const scrollBody = () => unref(scrollBodyRef);
const scrollContent = () => unref(scrollContentRef);

/** 只留两个量：真实滚动位置与「最多能滚多少」，箭头显隐由 scroll 事件驱动 */
const state = reactive({
  scrollLeft: 0,
  maxScroll: 0,
});

const showPrev = computed(() => state.maxScroll > 0 && state.scrollLeft > 1);
const showNext = computed(() => state.maxScroll > 0 && state.maxScroll - state.scrollLeft > 1);

const methods = {
  /** 重新测量可滚距离（内容/容器尺寸变化时由 ResizeObserver 触发） */
  measure() {
    const el = scrollBody();
    if (!el) return;
    state.maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    state.scrollLeft = el.scrollLeft;
  },
  syncScroll() {
    const el = scrollBody();
    if (!el) return;
    state.scrollLeft = el.scrollLeft;
    emit('scroll', state.scrollLeft);
  },
  stepWidth() {
    const el = scrollBody();
    if (!el) return 0;
    return typeof props.step === 'number' ? props.step : el.clientWidth / 2;
  },
  scrollTo(left: number, smooth = true) {
    const el = scrollBody();
    if (!el) return;
    // 上限实时取 DOM：不依赖 measure 是否已跑过
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({
      left: Math.min(Math.max(left, 0), max),
      behavior: smooth ? 'smooth' : 'auto',
    });
  },
  prev() {
    methods.scrollTo(state.scrollLeft - methods.stepWidth());
  },
  next() {
    methods.scrollTo(state.scrollLeft + methods.stepWidth());
  },
  /** 把目标滚进可视区（页面切换后定位激活页签等）；已完整可见则不动 */
  scrollIntoView(target: Element | ComponentPublicInstance | null, smooth = false) {
    const el = scrollBody();
    const node = (target as ComponentPublicInstance)?.$el ?? target;
    if (!el || !(node instanceof Element)) return;
    const bodyRect = el.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    // 左侧被裁 → 左对齐；右侧被裁 → 右对齐
    const overLeft = rect.left - bodyRect.left;
    if (overLeft < 0) return methods.scrollTo(el.scrollLeft + overLeft, smooth);
    const overRight = rect.right - bodyRect.right;
    if (overRight > 0) return methods.scrollTo(el.scrollLeft + overRight, smooth);
  },
  onWheel(event: WheelEvent) {
    const el = scrollBody();
    if (!props.wheel || !el || state.maxScroll <= 0) return;
    // 只接管纵向滚轮；横向滚轮是浏览器原生行为，不拦
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    // deltaMode=1（按行）时 deltaY 只是个位数，放大到像素量级
    const scale = event.deltaMode === 1 ? 16 : 1;
    const left = el.scrollLeft + event.deltaY * scale;
    // 到边把滚动交还页面，避免「滚到尽头后页面也滚不动」
    if (left <= 0 || left >= state.maxScroll) return;
    event.preventDefault();
    el.scrollLeft = left;
  },
};

let observer: ResizeObserver | null = null;

onMounted(() => {
  methods.measure();
  const el = scrollBody();
  const content = scrollContent();
  if (typeof ResizeObserver === 'undefined' || !el || !content) return;
  // 容器变宽 + 内容变长 两个方向都要盯（观察内容包裹层才能感知内容增长）
  observer = new ResizeObserver(() => methods.measure());
  observer.observe(el);
  observer.observe(content);
});

// keep-alive 切回时容器宽度可能已变（侧边栏折叠等）
onActivated(() => methods.measure());

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

defineExpose({
  prev: methods.prev,
  next: methods.next,
  scrollTo: methods.scrollTo,
  scrollIntoView: methods.scrollIntoView,
  refresh: methods.measure,
});
</script>

<style lang="less" scoped>
.scroll-box {
  position: relative;
  width: 100%;
  // 横向三段：左箭头槽 | 滚动区 | 右箭头槽
  display: flex;
  align-items: stretch;

  &__body {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    // 隐藏横向滚动条（标准 + webkit 两套写法），滚动仍由箭头 / 滚轮 / 触控板驱动
    scrollbar-width: none;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  // 内容包裹层：width:max-content 让宽度只由内容决定（不被「可用宽度」钳制），
  // 否则 inline-flex 类内容（如 a-space）会被压到容器宽度 ⇒ 不产生溢出 ⇒ 箭头不出现。
  &__content {
    display: inline-block;
    width: max-content;
    min-width: 100%;
    white-space: nowrap;
    vertical-align: top;
  }

  // 箭头槽：恒定占位（无论箭头是否可用都占满这一列），
  // 所以「有箭头 / 没箭头」滚动区宽度完全一致，内容不会跑到箭头下方。
  &__arrow {
    position: relative;
    flex: 0 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    // 不可用时只隐藏可见性，不 display:none —— 保证布局恒定
    &.is-hidden {
      visibility: hidden;
      pointer-events: none;
    }
  }

  // 可选渐隐（veil）：从箭头槽内侧向内容方向铺 100px，仅视觉，不吃事件
  &__veil {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100px;
    pointer-events: none;

    .is-prev & {
      left: 100%;
      background: linear-gradient(90deg, var(--bg-color-white, #fff), transparent);
    }

    .is-next & {
      right: 100%;
      background: linear-gradient(270deg, var(--bg-color-white, #fff), transparent);
    }
  }

  // 触发器是原生 button：键盘可达、无障碍标签由 aria-label 提供
  &__trigger {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  // 默认箭头：高度跟容器走，零配置可用；想要别的样子就传 #prev / #next 槽整体替换。
  &__chip {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2px;
    background: var(--bg-color-white, #fff);
    // 左右各一道同色淡线：内侧贴「内容被裁」的边，外侧与相邻元素分开
    border-left: 1px solid var(--border-color-base, #d9d9d9);
    border-right: 1px solid var(--border-color-base, #d9d9d9);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: var(--select-bg-color, #f5f5f5);
    }
  }
}
</style>
