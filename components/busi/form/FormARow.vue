<template>
  <div class="form-a-row">
    <a-row :gutter="gutter">
      <a-col
        v-for="(item, index) in items"
        :key="methods.getItemKey(item, index)"
        class="form-a-col"
        v-bind="methods.getColProps(item)"
      >
        <component :is="item" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue';
import type { VNode } from 'vue';
import { filterEmpty } from '../../_util/props-util';

/**
 * FormARow —— 基于 a-row / a-col 的表单行布局（colNum 默认 4、gutter 默认 16）：等分任意列数（1~6），
 * 跨列用 FormACol 的 colspan / span，或普通子项的 data-colspan / data-span（旧写法）。
 *
 * 用法：<FormARow colNum="3">
 *         <FormACol colspan="2" label="xxx" name="xxx">…</FormACol>
 *         <a-form-item>…</a-form-item>          <!-- 默认等分 1/3 -->
 *         <a-form-item data-colspan="2">…</a-form-item>
 *       </FormARow>
 */
const props = defineProps({
  colNum: {
    type: [String, Number],
    default: '4',
  },
  gutter: {
    type: [String, Number],
    default: 16,
  },
});
const slots = useSlots();
// colNum 允许运行时变化（如按产品类型切列数）⇒ 必须是 computed，普通常量只会在 setup 求值一次
const col = computed(() => Math.max(1, Math.trunc(Number(props.colNum) || 1)));
const gutter = computed(() => Number(props.gutter) || 0);
const items = computed<VNode[]>(() => filterEmpty(slots?.default?.() ?? []));

const methods = {
  // key 优先级：VNode 自带 key > 字段 name > 索引兜底
  getItemKey(item: VNode, index: number) {
    const name = item?.props?.name;
    return item?.key != null
      ? item.key
      : name != null
      ? Array.isArray(name)
        ? name.join('.')
        : String(name)
      : index;
  },
  // 计算每个子项对应的 a-col 属性：跨列走 span（24 栅格），等分走 flex（任意列数）
  // 统一读属性契约，不依赖组件身份判断（FormACol 解耦 + 消除 type 比较脆弱性）
  getColProps(item: VNode) {
    const vnodeProps: Record<string, any> = item.props || {};
    const colspan = Number(vnodeProps.colspan ?? vnodeProps['data-colspan']) || 0;
    const span = Number(vnodeProps.span ?? vnodeProps['data-span']) || 0;
    if (colspan > 0) {
      // 相对逻辑列 → 24 栅格换算，并 clamp 防超界（colspan 超 colNum 时不再溢出）
      return { span: Math.min(24, Math.round((24 * colspan) / col.value)) };
    }
    if (span > 0) {
      return { span: Math.min(24, span) };
    }
    // flex: 0 1 X% —— grow=0 不拉伸：换行后若某行只剩一个等分项，保持自身 1/N 宽，
    // 不会像 grow=1 那样被 antd 栅格拉伸占满整行（与 FormRow 固定 width 行为一致）
    return { flex: `0 1 ${100 / col.value}%` };
  },
};
</script>

<style lang="less" scoped>
.form-a-row {
  width: 100%;
  padding: 0 20px;
}
</style>
