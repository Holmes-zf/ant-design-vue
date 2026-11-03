<template>
  <div :class="['step-spot-icon', { active }]" aria-hidden="true">
    <div class="left-spot"></div>
    <div class="center-spot"></div>
    <div class="right-spot"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * 节点之间的「三圆点」连接件（`StepsBox` 的内部件，纯装饰，`aria-hidden`）。
 *
 * 点亮语义：`current >= value` 点亮 —— 连接点严格跟随它指向的那个节点，没有半态。
 * 几何：宽 88px（StepsBox 以 `left: 0` + `translateX(-50%)` 压在节点左边界上）、
 *      高 44px = `StepIcon` 直径。
 */
import { computed } from 'vue';

const props = defineProps<{
  /** 当前节点索引（`StepsBox` 的 activeMax；`-1` 表示无点亮项） */
  current?: number;
  /** 自身索引（连接点排在该索引节点之前，故恒 > 0） */
  value?: number;
}>();

const active = computed(
  () => props.current != null && props.value != null && props.current >= props.value,
);
</script>

<style lang="less" scoped>
.step-spot-icon {
  width: 88px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.active {
    .left-spot,
    .right-spot,
    .center-spot {
      background: var(--primary-color, #0032a0);
    }
  }

  .left-spot,
  .right-spot,
  .center-spot {
    background-color: var(--text-color-deep, rgba(0, 0, 0, 0.85));
    border-radius: 50%;
  }

  .left-spot,
  .right-spot {
    width: 7px;
    height: 7px;
  }

  .center-spot {
    width: 11px;
    height: 11px;
  }
}
</style>
