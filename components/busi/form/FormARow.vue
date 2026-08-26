<template>
  <div class="form-arow">
    <a-row :gutter="gutter">
      <a-col
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="form-col"
        v-bind="getColProps(item)"
      >
        <component :is="item" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import { filterEmpty } from '../../_util/props-util';

/**
 * FormARow — 基于 antd a-row / a-col 的表单行布局
 *
 * 与 FormRow（纯 CSS）的差异：
 * - 等分列：用 a-col 的 flex 属性（`flex: 0 1 ${100/col}%`），任意列数
 * - 跨列：用 a-col 的 span 属性（24 栅格，继承 antd 栅格能力）
 * - 间距：用 a-row gutter（默认 16）
 *
 * 跨列声明（属性契约，两种写法等价）：
 * - FormACol 的 props：<FormACol colspan="2"> / <FormACol span="12">
 * - 普通子项的 data-*：<a-form-item data-colspan="2"> / <a-form-item data-span="12">
 */
const props = defineProps({
  // 每行列数
  colNum: {
    type: [String, Number],
    default: '4',
  },
  // 列间距
  gutter: {
    type: [String, Number],
    default: 16,
  },
});

const slots = useSlots();
const col = computed(() => Math.max(1, Math.trunc(Number(props.colNum) || 1)));
const gutter = computed(() => Number(props.gutter) || 0);
const items = computed(() => filterEmpty(slots?.default?.() ?? []));

// key 优先级：VNode 自带 key > 字段 name（数组以 . 拼接）> 索引兜底
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

// 计算每个子项对应的 a-col 属性：跨列走 span（24 栅格），等分走 flex（任意列数）
// 统一读属性契约，不依赖组件身份判断（FormACol 解耦）
const getColProps = (item) => {
  const vnodeProps = item.props || {};
  const colspan = Number(vnodeProps.colspan ?? vnodeProps['data-colspan']) || 0;
  const span = Number(vnodeProps.span ?? vnodeProps['data-span']) || 0;
  if (colspan > 0) {
    // 相对逻辑列 → 24 栅格换算，并 clamp 防超界
    return { span: Math.min(24, Math.round((24 * colspan) / col.value)) };
  }
  if (span > 0) {
    return { span: Math.min(24, span) };
  }
  // 等分列固定为 1/col 宽度（grow=0，避免换行后单独成行被拉伸占满整行）
  return { flex: `0 1 ${100 / col.value}%` };
};
</script>

<style lang="less" scoped>
.form-arow {
  width: 100%;
  padding: 0 20px;
}
</style>
