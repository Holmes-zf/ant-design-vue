<template>
  <div class="steps-box" role="list">
    <div
      v-for="(item, index) in steps"
      :key="index"
      class="step-item"
      role="listitem"
      :aria-current="index === activeMax ? 'step' : undefined"
    >
      <!-- 连接点：首个节点左侧没有前置节点 -->
      <StepSpotIcon v-if="index > 0" :value="index" :current="activeMax" />
      <Step
        :title="item.title"
        :description="item.description"
        :text="index + 1"
        :active="isActive(index)"
      >
        <!-- 当前节点（最大点亮索引）显示完成图标，其余节点显示序号 -->
        <SvgIcon
          v-if="index === activeMax"
          class="steps-box__complete"
          icon="icon-core-completeWhite"
          size="22"
        />
      </Step>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Step from './internal/Step.vue';
import StepSpotIcon from './internal/StepSpotIcon.vue';

interface StepOption {
  /** 标题 */
  title?: string;
  /** 副标题（如节点时间） */
  description?: string;
}

const props = defineProps({
  /** 节点列表：本组件唯一的内容来源（不接受插槽） */
  steps: {
    type: Array as PropType<StepOption[]>,
    default: () => [],
  },
  /** 显式点亮：命中的索引点亮（传空数组 = 一个都不点亮）；只要传了就以它为准，忽略 current */
  value: {
    type: Array as PropType<number[]>,
    default: undefined,
  },
  /** 顺序点亮：0..current 全部点亮（仅未传 value 时生效） */
  current: {
    type: Number,
    default: undefined,
  },
});

/**
 * 合法点亮集合 = 落在节点范围内的整数索引。
 * 越界 / 非整数一律丢弃（否则会摊成 NaN，终态是「静默全灭」）。
 * null 表示未走 value 通路（此时看 current）。
 */
const activeIndexes = computed<number[] | null>(() => {
  if (props.value == null) return null;
  return props.value.filter(
    index => Number.isInteger(index) && index >= 0 && index < props.steps.length,
  );
});

/** 当前节点 = 最大点亮索引；-1 表示没有当前节点 */
const activeMax = computed(() => {
  if (activeIndexes.value) {
    return activeIndexes.value.length ? Math.max(...activeIndexes.value) : -1;
  }
  const current = Math.trunc(Number(props.current));
  if (!Number.isFinite(current)) return -1;
  return Math.min(Math.max(current, -1), props.steps.length - 1);
});

/** 节点是否点亮 */
const isActive = (index: number) =>
  activeIndexes.value ? activeIndexes.value.includes(index) : index <= activeMax.value;
</script>

<style lang="less" scoped>
.steps-box {
  width: 100%;
  display: flex;
  position: relative;
  padding: 16px 0;

  .step-item {
    // 连接点几何显式锚定在节点左边界
    position: relative;

    // 首末节点「贴边」= 整块外探，不压窄内容盒。
    // 外探量 = 节点半宽 104px − 贴边距 60px = 44px。
    // 贴边距必须大于 description 文案的半宽，否则首节点文字会越过容器左边界被裁掉。
    &:first-child > .step {
      margin-left: -44px;
    }

    &:last-child > .step {
      margin-right: -44px;
    }
  }

  // 连接点：88px 宽不进流，圆心压在相邻节点的边界上
  .step-spot-icon {
    position: absolute;
    left: 0;
    transform: translateX(-50%);
  }
}

// 完成图标在 44px 圆内略微下沉
.steps-box__complete {
  padding-top: 2px;
}
</style>
