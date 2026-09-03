/**
 * DcVxeGrid 通用配置与独立方法（复刻自业务系统 src/hooks/vxeGridConfig.js）
 *
 * 解耦说明：
 * - columnsSort / defaultFormatter / 列宽缓存 → ./sort、./utils 本地实现
 * - updateTodoCount（代办数量刷新）依赖业务基建 → 移除调用，相关事件保留为空实现，业务可覆盖
 * - queryColumnsDetail（查询菜单个性化列，依赖服务接口 + Vuex）→ 移除，
 *   updateColumns 不再读取服务端个性化列配置，如需个性化请业务侧自行处理
 * - PAGE 分页常量 → 本地定义（与 custom/const/render 保持一致）
 */
import { cloneDeep } from 'lodash-es';
import { columnsSort } from './sort';
import { copyTextToClipboard, defaultFormatter, gridHeaderCellDblclick, repairColumnWidth, storageColumns } from './utils';

// ---------- 默认分页常量（与业务系统 custom/const/render PAGE 一致） ----------
export const PAGE = {
  PAGE_INDEX: 1,
  PAGE_SIZE: 50,
  PAGE_LIST: [20, 50, 100, 200, 500],
};

export const gridComOptions = {
  border: 'border', // inner
  stripe: false,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: '',
  height: 'auto',
  rowConfig: {
    useKey: true,
    isHover: true,
    keyField: 'rowId',
  },
  columnConfig: {
    useKey: true,
    resizable: true,
  },
  sortConfig: {
    trigger: 'default',
    remote: false,
    sortMethod({ data, sortList }: any) {
      // 默认无配置自动排序 个性化排序如字典翻译排序等需要在业务中自行调用工具处理
      return columnsSort(data, sortList);
    },
  },
  pagerConfig: {
    className: 'pager-right',
    perfect: true,
    pagerCount: 5,
    pageSize: PAGE.PAGE_SIZE,
    pageSizes: PAGE.PAGE_LIST,
    layouts: [
      'Home',
      'PrevPage',
      'JumpNumber',
      'NextPage',
      'End',
      'Sizes',
      'FullJump',
      'Total',
    ],
    slots: {
      left: 'pagerLeft',
    },
  },
  checkboxConfig: {
    labelField: '',
    reserve: true,
    highlight: true,
    range: true,
    checkField: true,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
  },
  scrollX: {
    // enabled: false, // 横行虚拟与区域计算还存在兼容性，加上横向数据有限，对性能上限影响很小，可不用开启
    enabled: true,
    gt: 20,
    oSize: 10,
  },
  scrollY: {
    enabled: true,
    gt: 20,
    oSize: 10,
  },
  // 区域选择与复制验证（vxeCellArea 插件）：拖拽框选 + Ctrl+C 复制
  mouseConfig: {
    // area: true,
  },
  areaConfig: {
    // multiple: true,
  },
  keyboardConfig: {
    // isClip: true, // vxe 全局 copy 事件转交 handleCopyCellAreaEvent 的前置条件
  },
};

let _$grid: any = undefined;
export const gridComEvents = {
  // 双击单元格
  cellDblclick({ cell, column }: any) {
    if (!cell.innerText || column?.slots?.default == 'operate') return;
    const isCopy = copyTextToClipboard(cell.innerText, {
      keepSelectState: false,
    });
    return isCopy;
  },
  // 双击复制
  headerCellDblclick({ column, $grid }: any) {
    return gridHeaderCellDblclick({ column, $grid });
  },
  // 折叠（原逻辑刷新代办数量，业务可按需覆盖）
  formCollapse() {},
  // 查询（原逻辑刷新代办数量，业务可按需覆盖）
  proxyQuery() {},
  // 缩放（原逻辑刷新代办数量，业务可按需覆盖）
  zoom() {},
  keydown({ event, key, row, column, cell, $grid }: any) {
    // 一次操作回调2次keydown事件
    if ($grid) {
      _$grid = $grid;
    }
    if (key == 'Enter') {
      // 针对分页组件做特殊处理：由于分页组件自身回车会触发查询，所以这里判断下当前操作的dom如果是分页，则不执行查询
      const pagerElement = (document.activeElement as HTMLElement)?.closest('.vxe-pager');
      if (pagerElement) {
        return;
      }
      setTimeout(() => {
        _$grid?.commitProxy('_init');
      }, 0);
    }
  },
  // 列宽事件
  resizableChange({ $grid }: any) {
    const { props } = $grid || {};
    // 不存在id不缓存
    if (!props?.id) return;
    // 列配置缓存
    storageColumns($grid, props?.id);
  },
};

export const busiOptions = {
  loading: false,
  columns: [],
  menuCode: '',
};

// 通用函数组成
export const setGridOpts = (type: 'props' | 'events' | 'busi', opts: any) => {
  if (type === 'props') {
    opts.columns = updateColumns(opts.id, opts.columns);
    return { ...cloneDeep(gridComOptions), ...opts };
  }
  if (type === 'events') {
    return { ...cloneDeep(gridComEvents), ...opts };
  }
  return { ...cloneDeep(busiOptions), ...opts };
};

// 更新查询参数：仅保留 obj 中存在的键（不存在的置 undefined）
export const updateQueryParams = (queryParams: any, obj: any) => {
  Object.keys(queryParams).forEach((key) => (queryParams[key] = obj[key] || undefined));
};

// 更新表格自定义列
// 解耦说明：原逻辑会从 Vuex 读取服务端个性化列配置（menuJson）做列显隐/排序过滤，
// 独立版不再读取，始终走默认分支：列宽修复 + 默认 formatter
export const updateColumns = (menuCode: string, columns: any[]) => {
  const list = columns.map((item) => {
    item = repairColumnWidth(menuCode, item);
    return {
      ...item,
      formatter: item.formatter ? item.formatter : defaultFormatter,
    };
  });
  return list;
};
