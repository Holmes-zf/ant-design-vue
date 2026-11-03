<template>
  <FormSelect
    v-bind="$attrs"
    :value="selected"
    :options="options"
    @update:value="methods.handleInnerUpdate"
    @change="methods.handleInnerChange"
  >
    <template #option="{ item }">
      <span :title="item.label" class="default-set">
        <span class="label-left">{{ item.label }}</span>
        <span class="label-right">
          <template v-if="methods.isItemDefault(item)">
            <span
              v-if="allowCancelSet"
              class="action is-cancel"
              :class="{ 'is-pending': methods.isPending(item) }"
              @click.stop="methods.runCancel(item)"
            >
              取消默认
            </span>
            <span v-else class="action is-default">已为默认</span>
          </template>
          <span
            v-else
            class="action"
            :class="{ 'is-pending': methods.isPending(item) }"
            @click.stop="methods.runSet(item)"
          >
            设为默认
          </span>
        </span>
      </span>
    </template>
    <template v-if="slots.suffixIcon" #suffixIcon>
      <slot name="suffixIcon" />
    </template>
  </FormSelect>
</template>

<script>
export default {
  name: 'FormSelectDefault',
  // 属性已显式 v-bind="$attrs" 投给 FormSelect，关闭默认继承避免同一份属性/事件落两次
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, reactive, ref, useSlots, watch } from 'vue';
import FormSelect from './FormSelect.vue';

const props = defineProps({
  // 受控值（显式声明才能支持「默认值回填」时反推给父级）
  value: {
    type: [String, Number, Array],
    default: undefined,
  },
  // 选项（回填时需要它把默认值翻译成 change 事件的第二个参数）
  options: {
    type: Array,
    default: () => [],
  },
  // 是否允许取消默认项：开启后「已默认」项显示可点的「取消默认」，否则只显示「已为默认」
  allowCancelSet: {
    type: Boolean,
    default: false,
  },
  // 扩展点：默认值数据 + 动作的实现（缺省走内置 legacy，行为与内置一致）
  defaultHooks: {
    type: Object,
    default: undefined,
  },
  // 外部权威值是否已就绪：详情请求期间置 false，回填会等它变 true 再做判断
  valueReady: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:value', 'change', 'setDefault', 'cancelDefault']);

// 仅用于「父级传了 suffixIcon 才往下转发」
const slots = useSlots();

// ===================== 状态 =====================
const selected = ref(props.value ?? undefined);
// 默认值回填是否已「定音」：一旦定音（赋值过 / 权威值已在 / 用户动过）就不再回填
const applied = ref(false);
// 动作进行中的行（防连点），key 见 methods.rowKey
const pendingMap = reactive({});

// 内置 legacy：不传 hooks 时用它与历史行为对齐（选项自带 isDefault + 抛事件）
const legacyHooks = {
  isDefault: item => item.isDefault,
  setDefault: item => emit('setDefault', item),
  cancelDefault: item => emit('cancelDefault', item),
};

// 插拔离合的唯一取值点：传了用外部的，没传用内置，全件只有这一处判断
const hooks = computed(() => props.defaultHooks || legacyHooks);

// ===================== 方法 =====================
const methods = {
  // ---------- 值 ----------
  isEmptyValue(val) {
    return (
      val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)
    );
  },
  // options 里的值可能是数字也可能是字符串，统一按字符串比对
  findOption(val) {
    const target = String(val);
    return (props.options || []).find(opt => String(opt?.value) === target);
  },
  // 把值翻译成 change 的第二个参数（业务 @change 里有拿 opt.item 派生的用法，如取 code）
  buildChangeOption(val) {
    if (Array.isArray(val)) {
      const items = val.map(v => methods.findOption(v)).filter(Boolean);
      return { value: val, items, item: items[0] };
    }
    const item = methods.findOption(val);
    return { label: item?.label, value: val, item };
  },
  // 组件内改值的唯一出口：同步内部 + 推给父级 + 触发 @change（联动照旧跑）
  // 幂等：值已经是它了就直接返回，避免业务 @change 的联动被执行两遍
  applyValue(val) {
    if (applied.value && methods.isSameValue(selected.value, val)) return;
    applied.value = true;
    selected.value = val;
    emit('update:value', val);
    emit('change', val, methods.buildChangeOption(val));
  },
  // 值比较（数字/字符串容错；多选按浅比较）
  isSameValue(a, b) {
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      return a.every((v, i) => String(v) === String(b[i]));
    }
    return a === b;
  },
  // FormSelect 冒上来的用户操作
  handleInnerUpdate(v) {
    selected.value = v ?? undefined;
    // 用户一旦动过值，就永不再自动回填（避免手动清空后被塞回来）
    applied.value = true;
    emit('update:value', v);
  },
  handleInnerChange(v, option) {
    emit('change', v, option);
  },

  // ---------- 默认态 ----------
  // 渲染期调用 ⇒ hook 内部的 reactive 数据变化会自动驱动重渲染
  isItemDefault(item) {
    const ret = hooks.value.isDefault?.(item);
    return ret === undefined ? !!item?.isDefault : ret;
  },

  // ---------- 动作 ----------
  rowKey(item) {
    return String(item?.value ?? item?.id ?? item?.label ?? '');
  },
  isPending(item) {
    return !!pendingMap[methods.rowKey(item)];
  },
  async runAction(kind, item) {
    const key = methods.rowKey(item);
    if (pendingMap[key]) return;
    pendingMap[key] = true;
    try {
      if (kind === 'set') {
        await hooks.value.setDefault?.(item);
        // 接了 hook：设为默认后顺带选中该项（值 + @change 联动一起走）；
        // 存量 legacy 仍只抛事件、不改值，保证历史行为不变
        if (props.defaultHooks) {
          methods.applyValue(item?.value ?? item?.id);
        }
      } else {
        await hooks.value.cancelDefault?.(item);
      }
    } catch (e) {
      // 提示与回滚由 hook 自己负责（业务文案各不相同），这里只保证不打挂组件
    } finally {
      pendingMap[key] = false;
    }
  },
  runSet(item) {
    return methods.runAction('set', item);
  },
  runCancel(item) {
    return methods.runAction('cancel', item);
  },
};

// ===================== 状态同步 =====================
// 外部值变化 → 同步内部；变成「有值」即视为已定音，默认值不再参与
watch(
  () => props.value,
  v => {
    selected.value = v ?? undefined;
    if (!methods.isEmptyValue(v)) applied.value = true;
  },
);

// 业务把 valueReady 置回 false（= 又要开始一次新操作）⇒ 重新允许回填
watch(
  () => props.valueReady,
  ready => {
    if (!ready) applied.value = false;
  },
);

// ===================== 默认值回填 =====================
// 拆成「纯计算候选值」+「唯一副作用」，不在一个 effect 里既读又写
const defaultCandidate = computed(() => {
  if (applied.value) return undefined;
  // 未接 hook ⇒ 不接管回填
  if (!props.defaultHooks) return undefined;
  // 业务权威值未就绪 ⇒ 不做判断
  if (!props.valueReady) return undefined;
  // 已有值 ⇒ 默认值出局（权威值永远赢）
  if (!methods.isEmptyValue(selected.value)) return undefined;
  // hook 给不出默认值：可能「本来没有」，也可能「数据还在路上」⇒ 继续等
  const raw = props.defaultHooks.getDefaultValue?.();
  if (methods.isEmptyValue(raw)) return undefined;
  // 用 options 里的真实 value 落值（保类型：字典是字符串、口岸是数字）
  const dv = Array.isArray(raw)
    ? raw.map(v => methods.findOption(v)?.value).filter(v => v !== undefined)
    : methods.findOption(raw)?.value;
  // 命中不了 ⇒ 选项还没到、或默认值已失效（历史脏数据）⇒ 不回填
  return methods.isEmptyValue(dv) ? undefined : dv;
});

watch(
  defaultCandidate,
  dv => {
    if (methods.isEmptyValue(dv) || applied.value) return;
    methods.applyValue(dv);
  },
  { flush: 'post' },
);
</script>

<style lang="less" scoped>
.default-set {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.label-left {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 默认隐藏、悬停选项行才出现（保持原有观感：动作平时不占位）
.label-right {
  display: none;
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--primary-color, #0032a0);
}

.ant-select-item-option:hover .label-right {
  display: block;
}

.action {
  cursor: pointer;

  // 动作进行中：不可再点（防连点），轻微降透明
  &.is-pending {
    pointer-events: none;
    opacity: 0.6;
  }
}

// 「已为默认 / 取消默认」沿用原有的警示红
.is-cancel,
.is-default {
  color: var(--error-color, #f6530f);
}
</style>
