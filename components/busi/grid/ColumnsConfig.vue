<template>
  <div class="columns-config">
    <RadiusButton title="列配置" class="columnBtn" :minWidth="32" @click="methods.open">
      <SvgIcon icon="icon-core-a-bianzu8beifen"></SvgIcon>
    </RadiusButton>

    <Modal
      :visible="state.visible"
      :loading="state.loading"
      title="列配置"
      :width="980"
      :bodyStyle="{ padding: '0' }"
      @ok="methods.confirm"
      @cancel="methods.close"
    >
      <div class="columns-body">
        <!-- 左侧：字段列表 -->
        <div class="left-panel">
          <div class="panel-title-row">
            <span class="panel-title">选择字段</span>
            <FormInput
              v-model:value="state.searchKeyword"
              class="search-input"
              placeholder="输入关键字搜索"
            ></FormInput>
          </div>
          <div v-if="state.filteredColumns.length" class="select-all-row">
            <a-checkbox
              :checked="state.selectAllState === 'all'"
              :indeterminate="state.selectAllState === 'some'"
              class="select-all"
              @change="methods.toggleSelectAll"
            >
              全部
            </a-checkbox>
          </div>
          <div class="field-grid" v-if="state.filteredColumns.length">
            <a-checkbox
              v-for="item in state.filteredColumns"
              :key="item.key"
              :checked="item.checked"
              class="field-item"
              @change="methods.onLeftCheck(item, $event)"
            >
              {{ item.title }}
            </a-checkbox>
          </div>
          <Empty v-else />
        </div>

        <!-- 右侧：已选字段 -->
        <div
          class="right-panel"
          ref="rightPanelRef"
          @dragover="methods.handleListDragOver"
          @dragleave="methods.handlePanelDragLeave"
          @drop="methods.handleDrop"
        >
          <div class="panel-title panel-title-row panel-title-row-right">
            <span class="panel-title">当前已选字段</span>
            <span class="reset-btn" title="重置" @click="methods.reset">
              <SvgIcon icon="icon-core-a-bianzu13-1" size="16px"></SvgIcon>
            </span>
          </div>
          <div
            class="selected-list"
            v-if="state.selectedColumns.length"
            :class="{ 'is-sorting': state.dragIndex !== -1 }"
          >
            <div
              v-for="(item, index) in state.selectedColumns"
              :key="item.key"
              draggable="true"
              :class="[
                'selected-item',
                {
                  'is-dragging': state.dragIndex === index,
                  'drag-over-top':
                    state.dragOverIndex === index &&
                    state.dragOverPos === 'top' &&
                    state.dragIndex !== index,
                  'drag-over-bottom':
                    state.dragOverIndex === index &&
                    state.dragOverPos === 'bottom' &&
                    state.dragIndex !== index,
                },
              ]"
              @dragstart="methods.handleDragStart($event, index)"
              @dragend="methods.handleDragEnd"
            >
              <SvgIcon class="drag-handle" icon="icon-core-drag" size="14px"></SvgIcon>
              <span class="selected-title">{{ item.title }}</span>
              <SvgIcon
                class="delete-btn"
                icon="icon-core-delete"
                size="14px"
                @click="methods.removeSelected(item)"
              ></SvgIcon>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, unref, type PropType } from 'vue';
import { message } from 'ant-design-vue';
import RadiusButton from '../button/RadiusButton.vue';
import SvgIcon from '../icon/SvgIcon.vue';
import FormInput from '../input/FormInput.vue';
import Empty from '../decoration/Empty.vue';
import Modal from '../modal/Modal.vue';

/**
 * 列配置项（确认时回传 / 传给 requestSave 的结构，与外部 menuJson 记录一致）
 */
interface ColumnConfigItem {
  key: string;
  sort: number;
  checked: boolean;
}

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  menuCode: {
    type: String,
    default: '',
  },
  // 已选字段 key 列表（宿主从自己的存储传入）：
  // 非空 → 视为有历史配置，仅勾选其中字段、顺序即 sort；空 → 视为无历史配置，默认全勾选。
  // 原实现来自 Vuex useStore().getters.columnsItem(menuCode).menuJson，本件解耦为 prop 注入。
  defaultChecked: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  // 可选保存接口：传入时沿用原确认流程（loading → 保存 → 成功/失败提示 → emit confirm + 关闭）；
  // 未传时确认直接 emit confirm(已选列)，由宿主自行持久化并关闭。
  // 原实现调业务接口 createMenuTable / modifyMenuTable，本件解耦为 prop。
  requestSave: {
    type: Function as PropType<(menuCode: string, columns: ColumnConfigItem[]) => Promise<any>>,
    default: undefined,
  },
});

// 拖拽容器（右侧面板整块接管落点判断）
const rightPanelRef = ref();
// 拖拽期间的行几何缓存：非响应式，避免每帧读布局 / 触发无谓更新
const dragRects = { scrollTop: 0, rects: [] };

// 原实现：columnsFilter 由 Vuex columnsItem(menuCode).menuJson 解析而来（{key,checked,sort} 列表）。
// 本件由 defaultChecked 推导出同构数据：宿主传入的已选字段顺序即 sort。
const columnsFilter = computed(() =>
  (props.defaultChecked || []).map((key, index) => ({
    key,
    checked: true,
    sort: index,
  })),
);

const state = reactive({
  visible: false,
  loading: false,
  searchKeyword: '',
  allColumns: [], // 左侧平铺的完整字段列表
  selectedColumns: [], // 右侧已勾选字段（按 sort 排序）
  dragIndex: -1,
  dragOverIndex: -1,
  dragOverPos: '', // 'top' | 'bottom' | ''
  // 搜索过滤后的字段列表
  filteredColumns: computed(() => {
    const keyword = (state.searchKeyword || '').trim().toLowerCase();
    if (!keyword) return state.allColumns;
    return state.allColumns.filter(item => (item.title || '').toLowerCase().includes(keyword));
  }),
  // 全选状态：'all' 全部勾选、'some' 部分勾选、'none' 全不勾选（基于 filteredColumns）
  selectAllState: computed(() => {
    const list = state.filteredColumns || [];
    if (!list.length) return 'none';
    const checkedCount = list.filter(item => item.checked).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === list.length) return 'all';
    return 'some';
  }),
});

const $emit = defineEmits(['confirm']);

const methods = {
  // 打开弹窗（原实现的 state.id = columnsItem.id 已随接口解耦删除）
  open() {
    methods.displayFilter(props.columns);
    state.visible = true;
  },
  // 关闭弹窗
  close() {
    if (state.loading) return;
    state.visible = false;
  },
  // 重置：撤销本次操作 —— 直接按「当前 props.columns + defaultChecked 配置」重新回显。
  // 不持有任何快照：勾选与拖拽只写活的 allColumns，重置时重算即可，
  // 天然不会出现「快照被写脏 / 第二次重置失效」的问题。
  reset() {
    methods.displayFilter(props.columns);
  },
  // 确认保存
  confirm() {
    if (state.loading) return;
    if (!state.selectedColumns.length) {
      // 原 i18n：$t("common.selectFields") + $t("virtual.cannotBeEmpty")（均待核对）
      message.warning(`选择字段 不能为空`);
      return;
    }
    // 提交所有字段（含选中的和未选中的），勾选的字段按右侧当前顺序赋予递增 sort，未勾选的排在后面
    const selectedMap = new Map(state.selectedColumns.map((item, idx) => [item.key, idx]));
    const selectedLen = state.selectedColumns.length;
    let uncheckIdx = 0;
    let list: ColumnConfigItem[] = state.allColumns.map(item => {
      if (selectedMap.has(item.key)) {
        return {
          key: item.key,
          sort: selectedMap.get(item.key),
          checked: true,
        };
      }
      return {
        key: item.key,
        sort: selectedLen + uncheckIdx++,
        checked: false,
      };
    });
    methods.modifyColumns(list);
  },
  // 处理回显列表
  displayFilter(list) {
    // 列唯一键只认 field：vxe 列与 updateColumns 的匹配口径都是 field。
    // 没有 field 的列（勾选框 / 展开 / 操作 / 占位空白）本就不参与列配置，
    // 也永远进不了 menuJson，这里直接排除（历史兼容的 key / dataIndex 分支已删除）。
    state.allColumns = (list || [])
      .filter(item => item.field)
      .map((item, index) => {
        const find = columnsFilter.value.find(citem => citem.key == item.field);
        const hasConfig = columnsFilter.value.length > 0;
        // 无历史配置：默认全部勾选（表格侧 updateColumns 无配置时也是全量展示）
        // 有历史配置：仅按 defaultChecked 中的记录勾选，未保存过的列默认不勾选
        const checked = hasConfig ? !!(find && find.checked) : item.visible !== false;
        // 无历史配置：sort 取传入顺序；有历史配置：取 defaultChecked 中的顺序（缺失则排最后）
        const sort = !hasConfig
          ? index
          : find && (find.sort || find.sort === 0)
          ? find.sort
          : undefined;
        return { ...item, key: item.field, sort, checked };
      });
    // 左侧按 props.columns 传入顺序固定展示，不依赖 sort 排序
    methods.syncSelected();
  },
  // 同步右侧已选字段：按 sort 升序（无 sort 时按 allColumns 顺序兜底）
  syncSelected() {
    const orderMap = new Map(state.allColumns.map((item, idx) => [item.key, idx]));
    state.selectedColumns = state.allColumns
      .filter(item => item.checked)
      .sort((a, b) => {
        const sa = a.sort;
        const sb = b.sort;
        if (sa == null && sb == null) {
          return Number(orderMap.get(a.key) ?? 0) - Number(orderMap.get(b.key) ?? 0);
        }
        if (sa == null) return 1;
        if (sb == null) return -1;
        return sa - sb;
      });
  },
  // 重置拖拽状态
  resetDragState() {
    state.dragIndex = -1;
    state.dragOverIndex = -1;
    state.dragOverPos = '';
    dragRects.rects = [];
  },
  // 左侧 checkbox 勾选/取消
  // 勾选新字段时严格保留原始 sort 顺序，只在拖拽时才改序：
  // 勾选仅在右侧不存在该字段时追加到末尾（赋一个大于当前最大 sort 的值），不重写已有项的 sort
  onLeftCheck(item, { target }) {
    item.checked = target.checked;
    if (item.checked) {
      // 追加到右侧末尾（去重），保留已有项 sort 不变
      if (!state.selectedColumns.find(c => c.key === item.key)) {
        // 新字段无 sort 时，追加一个比当前所有已选字段都大的 sort，保证排到末尾
        if (item.sort == null) {
          const maxSort = state.selectedColumns.reduce(
            (max, c) => (c.sort != null && c.sort > max ? c.sort : max),
            -1,
          );
          item.sort = maxSort + 1;
        }
        state.selectedColumns.push(item);
        // 保持右侧按 sort 升序展示
        state.selectedColumns.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      }
    } else {
      state.selectedColumns = state.selectedColumns.filter(c => c.key !== item.key);
      // 不重写剩余项的 sort，保留原始 sort 顺序
    }
  },
  // 全选/取消全选：作用于当前 filteredColumns（含搜索过滤）
  toggleSelectAll({ target }) {
    const shouldCheck = target.checked;
    state.filteredColumns.forEach(item => {
      if (item.checked === shouldCheck) return;
      item.checked = shouldCheck;
      if (shouldCheck) {
        if (!state.selectedColumns.find(c => c.key === item.key)) {
          if (item.sort == null) {
            const maxSort = state.selectedColumns.reduce(
              (max, c) => (c.sort != null && c.sort > max ? c.sort : max),
              -1,
            );
            item.sort = maxSort + 1;
          }
          state.selectedColumns.push(item);
        }
      } else {
        state.selectedColumns = state.selectedColumns.filter(c => c.key !== item.key);
      }
    });
    if (shouldCheck) {
      state.selectedColumns.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    }
  },
  // 右侧删除，联动左侧取消勾选；不重写剩余项的 sort，保留原始 sort 顺序
  removeSelected(item) {
    const left = state.allColumns.find(c => c.key === item.key);
    if (left) left.checked = false;
    state.selectedColumns = state.selectedColumns.filter(c => c.key !== item.key);
  },
  // 拖拽开始：状态初始化 + 缓存每行几何（拖拽期间布局不变，后续 dragover 不再读布局）
  handleDragStart(e, index) {
    if (!state.selectedColumns[index]) {
      e.preventDefault();
      return;
    }
    state.dragIndex = index;
    state.dragOverIndex = -1;
    state.dragOverPos = '';
    e.dataTransfer.effectAllowed = 'move';
    // Firefox 必须 setData 才会真正进入拖拽流程
    e.dataTransfer.setData('text/plain', String(index));
    methods.cacheDragRects();
  },
  // 缓存右侧每行的 top / bottom / mid：指示线是绝对定位、不改变布局，
  // 所以一次测量即可支撑整段拖拽，避免每次 dragover 都触发重排
  cacheDragRects() {
    const panel = unref(rightPanelRef);
    if (!panel) return;
    dragRects.scrollTop = panel.scrollTop;
    dragRects.rects = Array.from(panel.querySelectorAll('.selected-item')).map((el: Element) => {
      const { top, bottom, height } = el.getBoundingClientRect();
      return { top, bottom, mid: top + height / 2 };
    });
  },
  // 拖拽经过：整块右面板接管落点判断
  // 行与行之间的间隙、列表下方的空白都算有效落点，不再依赖每行的 dragover
  handleListDragOver(e) {
    if (state.dragIndex === -1) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const panel = unref(rightPanelRef);
    if (!panel) return;
    // 拖到边缘时浏览器会滚动容器，滚动后缓存的位置失效，重新测量
    if (panel.scrollTop !== dragRects.scrollTop) methods.cacheDragRects();
    const rects = dragRects.rects;
    if (!rects.length) return;
    // 默认落到最后一项之后；命中某行则按上半/下半决定插到它前面还是后面
    let nextIndex = rects.length - 1;
    let nextPos = 'bottom';
    for (let i = 0; i < rects.length; i++) {
      if (e.clientY < rects[i].bottom) {
        nextIndex = i;
        nextPos = e.clientY < rects[i].mid ? 'top' : 'bottom';
        break;
      }
    }
    if (state.dragOverIndex !== nextIndex || state.dragOverPos !== nextPos) {
      state.dragOverIndex = nextIndex;
      state.dragOverPos = nextPos;
    }
  },
  // 拖拽离开面板：只在真正离开面板本身时清除（子元素之间的移动不处理，
  // 这正是旧版用 relatedTarget 判断时「恒为 null → 反复清空 → 指示线闪烁」的根因）
  handlePanelDragLeave(e) {
    if (e.target !== e.currentTarget) return;
    state.dragOverIndex = -1;
    state.dragOverPos = '';
  },
  // 拖放：插入位置完全由 dragOverIndex / dragOverPos 表达
  handleDrop(e) {
    if (state.dragIndex === -1) return;
    e.preventDefault();
    const from = state.dragIndex;
    const target = state.dragOverIndex;
    if (target === -1) {
      methods.resetDragState();
      return;
    }
    // top 表示放到该项之前，bottom 表示放到该项之后
    let to = state.dragOverPos === 'bottom' ? target + 1 : target;
    if (to > from) to -= 1;
    if (to !== from) {
      const [record] = state.selectedColumns.splice(from, 1);
      state.selectedColumns.splice(to, 0, record);
      state.selectedColumns.forEach((item, idx) => {
        item.sort = idx;
      });
    }
    // 注意：拖拽只影响右侧 selectedColumns，不反向改写左侧 allColumns 的顺序
    methods.resetDragState();
  },
  // 拖拽结束
  handleDragEnd() {
    methods.resetDragState();
  },
  // 保存（原实现调 createMenuTable / modifyMenuTable，本件解耦为 requestSave prop）：
  // 传入 requestSave → 沿用原确认流程（loading → 保存 → 成功/失败提示 → emit confirm + 关闭）；
  // 未传 → 直接 emit confirm(已选列)，由宿主自行持久化并关闭。
  modifyColumns(list) {
    if (!props.requestSave) {
      state.visible = false;
      $emit('confirm', list);
      return;
    }
    state.loading = true;
    props
      .requestSave(props.menuCode, list)
      .then(res => {
        if (res.code == 200) {
          // 原实现 $t(res.message)；本件直接展示接口返回文案
          message.success(res.message);
          // 重置搜索关键词与拖拽状态，避免下次打开弹窗残留
          state.searchKeyword = '';
          state.dragIndex = -1;
          state.dragOverIndex = -1;
          state.dragOverPos = '';
          state.visible = false;
          $emit('confirm');
        } else {
          message.warning(res.message);
        }
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  },
};
</script>

<style lang="less" scoped>
.columns-config {
  display: inline-block;
  .columnBtn {
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    border: 1px solid var(--border-color-line);
    font-size: 18px;
    &:hover {
      background: transparent;
      color: var(--primary-color);
    }
  }
  :deep(.define-modal .ant-modal-body) {
    padding: 0;
  }
}
.columns-body {
  display: flex;
  height: 500px;
  border-top: 1px solid var(--border-color-base);

  .left-panel,
  .right-panel {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  .left-panel {
    flex: 2;
    border-right: 1px solid var(--border-color-base);
    display: flex;
    flex-direction: column;
  }
  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--heading-color);
    flex-shrink: 0;
  }
  .panel-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    .search-input {
      flex: 1;
      min-width: 0;
    }
  }
  .panel-title-row-right {
    justify-content: space-between;
    .reset-btn {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      color: var(--primary-color);
      line-height: 1;
      user-select: none;
      padding: 2px;
      &:hover {
        opacity: 0.8;
      }
    }
  }
  .select-all-row {
    margin-bottom: 12px;
    flex-shrink: 0;
    .select-all {
      font-weight: normal;
      margin-left: 0;
    }
  }
  .field-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    align-content: start;
    .field-item {
      display: flex;
      align-items: baseline;
      overflow: hidden;
      margin-left: 0;
      :deep(span) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .selected-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    // 拖拽过程中统一抓取手型，避免指针在行/间隙间跳变时 cursor 抖动
    &.is-sorting .selected-item {
      cursor: grabbing;
    }
    .selected-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      // 拖拽整行时不希望顺带选中行内文字
      user-select: none;
      transition: background-color 0.2s;
      &:hover {
        background: var(--select-bg-color);
        cursor: move;
      }
      &.is-dragging {
        opacity: 0.4;
      }
      &.drag-over-top::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: -3px;
        height: 2px;
        background: var(--primary-color);
        border-radius: 1px;
      }
      &.drag-over-bottom::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -3px;
        height: 2px;
        background: var(--primary-color);
        border-radius: 1px;
      }
      .drag-handle {
        cursor: move;
        color: var(--primary-color);
        flex-shrink: 0;
      }
      .selected-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--heading-color);
      }
      .delete-btn {
        cursor: pointer;
        color: var(--gray-color);
        flex-shrink: 0;
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
}
</style>
