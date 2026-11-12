<template>
  <div class="dc-qry-form">
    <div class="dc-qry-form__row" :class="{ 'dc-qry-form__row--collapsed': isCollapsed }">
      <div
        v-for="item in selectedItems"
        :key="item.field"
        class="dc-qry-form__item"
        :class="methods.resolveItemUi(item.className, item)"
      >
        <span class="dc-qry-form__label">
          {{ item.showTitle === false ? '' : `${item.title}：` }}
        </span>
        <div
          class="dc-qry-form__control"
          :class="[
            methods.resolveItemUi(item.contentClassName, item),
            { 'dc-qry-form__control--builtin': isBuiltinItem(item) },
          ]"
          :style="methods.resolveItemUi(item.contentStyle, item)"
        >
          <template v-if="isBuiltinItem(item)">
            <FormSelect
              v-if="item.itemRender.name === '$select'"
              v-model:value="form[item.field]"
              :options="item.itemRender.options"
              :multiple="item.itemRender.props?.multiple ? 'multiple' : undefined"
              :placeholder="item.itemRender.props?.placeholder"
            />
            <FormInput
              v-else-if="item.itemRender.name === '$input'"
              v-model:value="form[item.field]"
              :placeholder="item.itemRender.props?.placeholder"
            />
          </template>
          <slot v-else :name="getSlotName(item)" :data="form" :field="item.field" />
        </div>
        <span class="dc-qry-form__remove" @click="methods.handleRemove(item.field)">×</span>
      </div>

      <div class="dc-qry-form__actions">
        <a-dropdown
          class="dc-qry-form__add"
          v-if="showAddBtn && allFields.length > selectedFields.length"
          :trigger="['click']"
          placement="bottomLeft"
          :visible="dropdownVisible"
          @visibleChange="methods.handleVisibleChange"
        >
          <RadiusButton class="dc-qry-form__btn" type="dashed">+ 添加条件</RadiusButton>
          <template #overlay>
            <div class="dc-qry-form__panel" @click.stop>
              <FormInput v-model:value="searchText" allowClear />
              <div class="dc-qry-form__options">
                <div
                  v-for="item in dropdownFields"
                  :key="item.field"
                  class="dc-qry-form__option"
                  :class="{
                    'dc-qry-form__option--selected': selectedFields.includes(item.field),
                  }"
                  @click="methods.handleAdd(item.field)"
                >
                  {{ item.title }}
                </div>
                <Empty v-if="!dropdownFields.length" />
              </div>
            </div>
          </template>
        </a-dropdown>

        <div
          class="dc-qry-form__toolbar"
          :class="{ 'dc-qry-form__toolbar--floating': isCollapsed }"
        >
          <RadiusButton
            :minWidth="40"
            type="primary"
            @click="methods.handleQuery"
            class="dc-qry-form__btn"
          >
            <SvgIcon icon="icon-core-search" size="16" />
          </RadiusButton>
          <RadiusButton @click="methods.handleReset" class="dc-qry-form__btn" :minWidth="40">
            <SvgIcon icon="icon-core-a-bianzu13-1" size="16" />
          </RadiusButton>

          <span class="dc-qry-form__collapse" @click="methods.toggleCollapse">
            <SvgIcon
              :icon="isCollapsed ? 'icon-core-doubleDown' : 'icon-core-doubleUp'"
              size="12"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'DcGridQryForm' };
</script>

<script setup lang="ts">
import { ref, computed, reactive, watch, useSlots, onMounted } from 'vue';
import { isFunction, cloneDeep } from 'lodash-es';
import FormSelect from '../select/FormSelect.vue';
import FormInput from '../input/FormInput.vue';
import RadiusButton from '../button/RadiusButton.vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Empty from '../decoration/Empty.vue';

const props = defineProps({
  // 直接传入 gridOptions.formConfig，组件内部取 formConfig.items 作为字段列表
  formConfig: { type: Object, default: () => ({ items: [] }) },
  queryParams: { type: Object, default: () => ({}) },
  // vxe-grid 实例（或含 commitProxy / getProxyInfo 方法的 mock 对象）
  grid: { type: Object, default: () => ({}) },
  // 菜单标识（如 "orderList"），用于条件缓存，不传则不缓存
  menuCode: { type: String, default: '' },
  // 默认选中的字段列表（缓存未命中时回退使用）
  defaultSelectedFields: { type: Array, default: () => [] },
  // 动态字段，外部传入后自动加入 selectedFields
  dynamicFields: { type: Array, default: () => [] },
  // 是否显示添加条件按钮
  showAddBtn: { type: Boolean, default: true },
  // 模式：grid（内嵌表格，查询走 grid.commitProxy）/ standalone（独立存在，不关联表格，查询由外部自省控制）
  mode: { type: String, default: 'grid' },
  // 固定排序：start 中的字段恒排最前、end 中的字段恒排最后（语义同 flex 的 start / end），
  // 其余保持添加顺序。只约束位置，不改变字段本身的任何行为（照常增删、照常进缓存、照常出现在下拉）
  fixedFields: {
    type: Object,
    default: () => ({ start: [], end: [] }),
  },
});
const emit = defineEmits([
  'update:queryParams',
  'beforeQueryCallback',
  'queryCallback',
  'resetCallback',
  'removeField',
]);

const slots = useSlots();
const searchText = ref('');
const dropdownVisible = ref(false);

// ---------- 内部选中的字段名列表 ----------
const selectedFields = ref([]);

// ---------- 动态注入的临时字段（不应被缓存）----------
const noCacheFields = ref([]);

// ---------- 字段缓存（一个变量即所有可选字段）----------
const allFields = computed(() => props.formConfig?.items || []);

// ---------- 当前已选中的字段对象（模板渲染用，顺序即 selectedFields 顺序）----------
const selectedItems = computed(() =>
  selectedFields.value.map(f => allFields.value.find(it => it.field === f)).filter(Boolean),
);

// ---------- 下拉面板字段（全部字段 + 搜索过滤）----------
const dropdownFields = computed(() => {
  if (!searchText.value) return allFields.value;
  const kw = searchText.value.trim().toLowerCase();
  return allFields.value.filter(it => (it.title || '').toLowerCase().includes(kw));
});

// ---------- 伸缩 ----------
const isCollapsed = ref(false);

// ---------- 表单数据（formConfig.items 的 defaultValue 初始化）----------
const form = ref({});
const initialQueryParams = cloneDeep(props.queryParams);

// ---------- slot 匹配 ----------
const hasSlot = item => !!item && (!!slots[item.slots?.default] || !!slots[item.field]);
const getSlotName = item => {
  if (!item) return '';
  const names = [item.slots?.default, item.field].filter(Boolean);
  return names.find(n => slots[n]) || names[0];
};
// 是否走组件内置渲染器（无 slot 的 $select / $input），决定内容区是否加 --builtin
const isBuiltinItem = item => !hasSlot(item) && !!item.itemRender;

// ---------- 条件缓存（localStorage 持久化）----------
// 原实现走 Vuex store.commit("setGridFormCondCache") + getters.getGridFormCondCache
// （由 createPersistedState 自动持久化到 localStorage）；本件解耦为直接读写 localStorage，
// key 形如 busi-grid-cond-${menuCode}，读写均 try/catch 包裹（隐私模式/超限时静默降级为不缓存）。
const condCacheKey = (menuCode: string) => `busi-grid-cond-${menuCode}`;

const methods = {
  // ---------- 工具 ----------
  isEmpty(value) {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      return true;
    return false;
  },

  // ---------- 表单项 UI 配置：对齐 vxe-form item 的 className / contentClassName / contentStyle ----------
  // 三者均支持「静态值 / 函数」两种写法，函数入参对齐 vxe：{ item, data, field }
  resolveItemUi(value, item) {
    return isFunction(value) ? value({ item, data: form.value, field: item.field }) : value;
  },

  // ---------- 固定排序：按 [start, 其余, end] 重组字段名数组 ----------
  // 初始化、添加、动态注入后各调一次即可，删除天然保序无需重组
  sortFields(fields) {
    const start = props.fixedFields?.start || [];
    const end = props.fixedFields?.end || [];
    return [
      ...start.filter(f => fields.includes(f)),
      ...fields.filter(f => !start.includes(f) && !end.includes(f)),
      ...end.filter(f => fields.includes(f)),
    ];
  },

  // ---------- 初始化 ----------
  init() {
    const temp = {};
    props.formConfig?.items?.forEach(item => {
      temp[item.field] = cloneDeep(item.itemRender?.defaultValue);
    });
    form.value = temp;
    methods.initConditionCache();
  },

  // ---------- 操作 ----------
  handleAdd(field) {
    if (selectedFields.value.includes(field)) return;
    selectedFields.value = methods.sortFields([...selectedFields.value, field]);
    noCacheFields.value = noCacheFields.value.filter(f => f !== field);
    methods.saveCondition();
    searchText.value = '';
    dropdownVisible.value = false;
  },
  handleRemove(field) {
    selectedFields.value = selectedFields.value.filter(f => f !== field);
    noCacheFields.value = noCacheFields.value.filter(f => f !== field);
    methods.saveCondition();
    emit('removeField', field);
  },
  handleVisibleChange(visible) {
    dropdownVisible.value = visible;
    if (!visible) searchText.value = '';
  },
  syncFormToGrid() {
    // standalone 模式不关联表格，无需同步
    if (props.mode === 'standalone') return;
    const proxyForm = props.grid?.getProxyInfo?.()?.form;
    if (proxyForm) {
      Object.assign(proxyForm, form.value);
    }
  },
  search() {
    // standalone 模式不关联表格，查询由外部自省控制（emit queryCallback 触发）
    if (props.mode === 'standalone') return;
    isFunction(props.grid.commitProxy) && props.grid.commitProxy('_init');
  },
  // 原实现里的 updateTodoCount("") 副作用已删除：交宿主监听 queryCallback / resetCallback 自行处理
  handleQuery() {
    methods.saveCondition();
    // methods.syncFormToGrid();
    emit('beforeQueryCallback');
    methods.search();
    emit('queryCallback');
  },
  handleReset() {
    const temp = {};
    props.formConfig?.items?.forEach(item => {
      temp[item.field] = cloneDeep(item.itemRender?.defaultValue);
    });
    form.value = temp;
    methods.syncFormToGrid();
    // 回调更新异步，先暂时这样处理，单点逻辑，影响不大
    // 父组件的 v-model:queryParams 回写对 reactive 对象会被丢弃（编译为 isRef ? .value = $event : null），
    // 且 emit 是异步的，后续 search() 会拿到旧值，故此处有意原地重置 props，不走 update:queryParams
    Object.keys(props.queryParams).forEach(key => {
      // eslint-disable-next-line vue/no-mutating-props
      props.queryParams[key] = cloneDeep(initialQueryParams[key]);
    });
    methods.search();
    emit('resetCallback');
  },

  // ---------- 伸缩 ----------
  toggleCollapse() {
    isCollapsed.value = !isCollapsed.value;
  },

  // ---------- 条件缓存 ----------
  saveCondition() {
    if (!props.menuCode) return;
    try {
      localStorage.setItem(
        condCacheKey(props.menuCode),
        JSON.stringify(selectedFields.value.filter(f => !noCacheFields.value.includes(f))),
      );
    } catch {
      // 读写失败（隐私模式 / 存储超限）静默降级为不缓存
    }
  },
  loadCondition(menuCode) {
    try {
      const raw = localStorage.getItem(condCacheKey(menuCode));
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  initConditionCache() {
    const validFields = allFields.value.map(it => it.field);
    if (props.menuCode) {
      const cached = methods.loadCondition(props.menuCode);
      if (cached?.length) {
        const filtered = cached.filter(f => validFields.includes(f));
        if (filtered.length) {
          selectedFields.value = methods.sortFields(filtered);
          return;
        }
      }
    }
    // 缓存未命中或无 menuCode → 三来源自动推断默认选中字段
    const defaultSet = new Set();
    props.formConfig?.items?.forEach(item => {
      if (!methods.isEmpty(item.itemRender?.defaultValue)) {
        defaultSet.add(item.field);
      }
    });
    Object.keys(props.queryParams || {}).forEach(key => {
      if (!methods.isEmpty(props.queryParams[key])) {
        defaultSet.add(key);
      }
    });
    (props.defaultSelectedFields || []).forEach(f => defaultSet.add(f));
    selectedFields.value = methods.sortFields([...defaultSet].filter(f => validFields.includes(f)));
  },
};

// ---------- 生命周期 ----------
onMounted(() => {
  methods.init();
});

watch(
  () => form,
  () => {
    methods.syncFormToGrid();
  },
  { deep: true },
);

watch(
  () => props.dynamicFields,
  val => {
    // 1. 先清理上一次 dynamicFields 注入的临时字段
    selectedFields.value = selectedFields.value.filter(f => !noCacheFields.value.includes(f));
    noCacheFields.value = [];

    // 动态字段为空 → 结束
    if (!val?.length) return;

    // 2. 注入本次 dynamicFields 中尚未选中的字段
    const validFields = allFields.value.map(it => it.field);
    val.forEach(f => {
      if (!validFields.includes(f)) return;
      if (!selectedFields.value.includes(f)) {
        selectedFields.value = [...selectedFields.value, f];
        noCacheFields.value = [...noCacheFields.value, f];
      }
    });
    // 3. 注入后重组顺序，保证固定项位置
    selectedFields.value = methods.sortFields(selectedFields.value);
  },
  { deep: true },
);
</script>

<style lang="less" scoped>
.dc-qry-form {
  background: var(--bg-color-white);
  border-radius: 4px;
  padding: 4px 0;
  position: relative;

  // ---------- 条件行 ----------
  &__row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    position: relative;
    max-height: 500px;
    transition: max-height 0.3s ease;

    // ---------- 折叠态 ----------
    &--collapsed {
      max-height: 24px;

      .dc-qry-form__item,
      .dc-qry-form__add {
        opacity: 0;
        pointer-events: none;
      }
    }
  }

  // ---------- 条件项 ----------
  &__item {
    display: flex;
    align-items: center;
    padding: 4px 6px;
    background: var(--select-bg-color);
    border-radius: 4px;
    flex: 0 1 auto;
    max-width: 100%;
    position: relative;
    transition: opacity 0.3s ease;

    &:hover .dc-qry-form__remove {
      opacity: 1;
    }
  }

  &__label {
    color: var(--text-color);
    font-size: 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__control {
    min-width: 120px;
    max-width: 100%;

    // 内置渲染器填充的内容区（无 slot，走 itemRender 的 $select / $input）需给内部控件下限：
    // 容器的 min-width 只是容器宽度、内部控件不继承，故用 min-width:100% 让控件至少铺满内容区
    // （多选仍可随标签继续变宽）。限定在 --builtin 下，避免误伤 slot 里消费者自带的组件
    &--builtin {
      :deep(.form-select),
      :deep(.form-input) {
        min-width: 100%;
      }
    }

    // 多选标签区封顶两行（24px 标签 + 上下各 2px margin = 28px/行），超出纵向滚动，
    // 避免全选几百项把条件栏撑满整屏；箭头 absolute 挂在 selector 上，故只压标签区不压 selector
    :deep(.form-select[multiple='multiple'] .ant-select-selection-overflow) {
      max-height: 56px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
  }

  &__remove {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    // 灰底刻意用字面量：主题里只有告警灰 / 滚动条灰，语义错位
    background: #bcbec8;
    color: var(--bg-color-white);
    border-radius: 50%;
    font-size: 10px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    border: none;
    line-height: 13px;
    padding: 0;
    z-index: 1;
  }

  // ---------- 操作区 ----------
  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    white-space: nowrap;
    transition: opacity 0.3s ease;
  }

  // ---------- 工具栏 ----------
  &__toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    // 折叠时悬浮到右侧
    &--floating {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%) scale(0.75);
      transform-origin: right center;
      z-index: 2;
    }
  }

  &__collapse {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 1px solid var(--border-color-line);
    border-radius: 4px;
    cursor: pointer;
    background: var(--bg-color-white);
    flex-shrink: 0;
    transition: all 0.2s;

    &:hover {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
  }

  // 按钮型操作的小内边距（添加条件 / 查询 / 重置）
  &__btn {
    padding: 0 10px;
  }
}

// ---------- 下拉面板 ----------
// 面板渲染在 dropdown 的 overlay 里（默认挂到 body），不是 block 的 DOM 后代，故不嵌进 .dc-qry-form
.dc-qry-form__panel {
  width: 220px;
  background: var(--bg-color-white);
  border-radius: 4px;
  box-shadow: var(--box-shadow-base);
  padding: 8px;

  input {
    padding: 4px;
  }

  .dc-qry-form__options {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 8px;
  }

  .dc-qry-form__option {
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;

    &:hover {
      background: var(--select-bg-color);
    }

    &.dc-qry-form__option--selected {
      color: var(--disabled-color);
      cursor: not-allowed;
      background: var(--disabled-bg-color);

      &:hover {
        background: var(--disabled-bg-color);
      }
    }
  }
}
</style>
