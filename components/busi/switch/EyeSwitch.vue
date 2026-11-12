<!--
  敏感字段「值 + 眼睛」单元格（掩码字段的查看 / 隐藏入口）

  契约：
    props  row（数据行，必须是响应式对象）/ field（展示与请求字段名）/ stateSuffix（开关状态字段后缀，默认 "__eye"）
    emit   toggle(next) —— next = 点击后的目标态

  开关状态由组件自己托管在行对象上：键名 = field + stateSuffix（如 email__eye）。
  业务侧零样板：不用传 visible、不用手动赋值；状态跟着行走 ⇒ 排序 / 翻页 / 数据换新天然正确。
  这个键属于组件私有状态（与 vxe 的 _X_ROW_KEY 同性质），不是业务字段，组件不会改任何业务字段。
  组件不感知接口成败：失败提示与"是否弹回闭眼"都归业务，外部要读/改这个键直接碰
  row[field + "__eye"]（默认后缀是公开契约）。
-->
<template>
  <div class="eye-switch">
    <span class="eye-switch__value" :title="row[field]">{{ row[field] }}</span>
    <button
      type="button"
      class="eye-switch__toggle"
      :aria-pressed="visible"
      :aria-label="visible ? '隐藏' : '显示'"
      @click.stop="onToggle"
    >
      <SvgIcon :icon="visible ? 'icon-core-eyes' : 'icon-core-closeEyes'" size="18px" />
    </button>
    <slot name="icon"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SvgIcon from '../icon/SvgIcon.vue';

interface Props {
  /** 数据行（响应式对象；组件只写自己的状态键，不动业务字段） */
  row: Record<string, any>;
  /** 展示与请求字段名 */
  field: string;
  /** 开关状态字段后缀，默认 "__eye" ⇒ 键名 = field + stateSuffix */
  stateSuffix?: string;
}

const props = withDefaults(defineProps<Props>(), { stateSuffix: '__eye' });

const emit = defineEmits<{ (e: 'toggle', next: boolean): void }>();

/** 组件私有状态键：field + 后缀，业务字段重名时由调用方改 stateSuffix */
const stateKey = computed(() => `${props.field}${props.stateSuffix}`);

const visible = computed(() => !!props.row?.[stateKey.value]);

const onToggle = () => {
  if (!props.row) return;
  const next = !visible.value;
  // 刻意写 props.row 的深层：写的是组件私有状态键（field + 后缀），不是业务字段，
  // 与 vxe 往数据行写 _X_ROW_KEY 同性质；业务侧因此无需任何开关态样板。
  // eslint-disable-next-line vue/no-mutating-props
  props.row[stateKey.value] = next;
  emit('toggle', next);
};
</script>

<style lang="less" scoped>
.eye-switch {
  display: flex;
  align-items: center;
  gap: 10px;

  &__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__toggle {
    display: inline-flex;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}
</style>
