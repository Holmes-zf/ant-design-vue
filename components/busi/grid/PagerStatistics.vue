<template>
  <div class="pager-statistics">
    <div v-for="item in items" :key="item.uuid" class="pager-statistics__item">
      <span v-if="item.name" class="pager-statistics__name">
        {{ item.name }}
      </span>
      <span class="pager-statistics__value">{{ item.value }}</span>
      <span v-if="item.unit" class="pager-statistics__unit">
        {{ item.unit }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'PagerStatistics',
};
</script>
<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { uniqueId } from 'lodash-es';

/**
 * 统计项：数据由后端 count 接口原样下发（各页 countList），本件不做任何加工
 * - name：统计项名称（**宿主传入已翻译文本**，本件原样渲染，不做 i18n；空值/缺失时该项降级为「值 单位」）
 * - value / unit：原样展示，格式化由数据层负责
 */
interface StatisticItem {
  name?: string;
  value?: string | number;
  unit?: string;
}

const props = defineProps({
  statistics: {
    type: Array as PropType<StatisticItem[]>,
    default: () => [],
  },
});

// 条目没有 id、name 也不保证唯一 ⇒ 转一次列表给每项补个 uuid 作 v-for 的 key
const items = computed(() =>
  props.statistics.map(item => ({ ...item, uuid: uniqueId('_pager-statistics-') })),
);
</script>

<style lang="less" scoped>
.pager-statistics {
  display: flex;
  align-items: center;
  // 高度由宿主定：vxe 给 .vxe-pager--left-wrapper 定了 2.15em，本件随父级拉伸即可，不要自定高
  height: 100%;
  font-size: 14px;
  font-weight: bold;
  // 数值等宽，多组统计纵向对齐
  font-variant-numeric: tabular-nums;

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 5px;

    // 分隔符归样式：条目之间才有，不再走 v-if 分支
    &:not(:last-child)::after {
      content: ';';
    }
  }

  &__name {
    // 冒号归样式：不进文案、不参与 i18n
    &::after {
      content: '：';
    }
  }

  &__value {
    color: var(--warning-color);
  }
}
</style>
