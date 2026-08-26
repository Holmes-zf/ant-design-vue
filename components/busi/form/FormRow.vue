<template>
  <div class="form-row" :style="{ '--form-row-col': col }">
    <div
      v-for="(item, index) in items"
      class="form-col"
      :key="getItemKey(item, index)"
    >
      <component :is="item" />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import { filterEmpty } from '../../_util/props-util';

const props = defineProps({
  // 每行列数
  colNum: {
    type: [String, Number],
    default: '4',
  },
});

const slots = useSlots();
const col = computed(() => Math.max(1, Math.trunc(Number(props.colNum) || 1)));
const items = computed(() => filterEmpty(slots?.default?.() ?? []));

// key 优先级：VNode 自带 key > 字段 name > 索引兜底
const getItemKey = (item, index) => {
  const name = item?.props?.name;
  return item?.key != null
    ? item.key
    : name != null
      ? Array.isArray(name)
        ? name.join('.')
        : String(name)
      : index;
};
</script>

<style lang="less" scoped>
.form-row {
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--form-col-gap);
  --form-col-gap: 20px;
}
.form-col {
  width: calc(
    (100% - (var(--form-row-col, 4) - 1) * var(--form-col-gap)) /
      var(--form-row-col, 4)
  );
}
</style>
