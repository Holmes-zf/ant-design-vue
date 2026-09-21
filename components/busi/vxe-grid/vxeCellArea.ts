/**
 * vxe-table 单元格区域选择与复制扩展插件（复刻自业务系统 src/plugins/vxeCellArea.js）
 *
 * 原理（与付费插件 vxe-table-extend-cell-area 同思路）：
 * 1. 开源 Keyboard 模块在单元格 mousedown 时检测 `$xetable.handleCellAreaEvent` 并自动转交
 * 2. 拖拽定位采用纯数学坐标：client − bodyRect + scroll（滚动修正）+ scrollYStore.rowHeight
 *    累计定位行、colgroup 累计定位列（对应付费插件 Ic/Ms/Ts 函数）
 * 3. 选区渲染按主/左固定/右固定分片数学计算 top/left/height/width（对应 Ls/Is 函数）
 * 4. 拖出可视区时 50ms 定时自动滚动（对应 te 函数）
 * 5. 复制走 vxe 官方全局 copy 转交链：`handleCopyCellAreaEvent` 钩子（需 keyboardConfig.isClip）
 * 6. `handleUpdateCellAreas` 是 vxe 判定"area 插件已安装"的标志，必须注入
 *
 * 状态为实例级闭包（不落模块级变量），多表格共存互不污染。
 *
 * 解耦说明（独立版与业务系统差异）：
 * - i18n 词条 `common.copySuccessTips` / `common.copy` / `common.close` 来自业务系统服务端语言包
 *   → 直接替换为中文文案
 * - `window.$message` → ant-design-vue `message`
 */
import { VXETable } from 'vxe-table';
import { onBeforeUnmount } from 'vue';
import { message } from 'ant-design-vue';

// 长按判定时长（ms）：超过此时长才进入框选，快速单击不触发
const LONG_PRESS_DELAY = 350;
// 选区操作按钮容器类名（复制 / 关闭）
const ACTIONS_CLASS = 'vxe-cell-area-actions';

const cellAreaHook = {
  setupTable($xetable) {
    const { props, reactData, internalData } = $xetable;

    // ---------- 实例级状态（闭包持有） ----------
    let state = null;
    const getState = () => {
      if (!state) {
        state = {
          isDrag: false,
          startCell: null,
          area: null,
          hasCopy: false, // 是否已复制（决定滚动重绘时是否重绘 copy 虚线层）
          lastMouse: null, // 自动滚动时用于重新定位
          scrollTimer: null,
          pressTimer: null, // 长按进入框选的定时器
          fromCheckbox: false, // 本次框选起点是否为 checkbox 列（决定是否同步勾选）
          checkboxDrag: null, // checkbox 同步勾选状态：{ targetState, done }
          suppressClick: false, // 抑制长按后紧随的 click（checkbox 列，防原生切换导致状态回弹）
        };
      }
      return state;
    };

    // ---------- 工具 ----------
    const isAreaEnabled = () => {
      const mouseConfig = props.mouseConfig;
      if (!mouseConfig) return false;
      try {
        return !!$xetable.getComputeMaps().computeMouseOpts.value.area;
      } catch (e) {
        return false;
      }
    };
    const getVisibleColumn = () => internalData.visibleColumn || [];
    const getRefs = () => $xetable.getRefMaps();
    const getMainWrapper = () => {
      const body = getRefs().refTableBody.value;
      return (body && body.$el) || body || null;
    };
    const getBodyTable = container => container && container.querySelector('.vxe-table--body');
    // 行高：虚拟滚动用 scrollYStore.rowHeight，普通渲染用 reactData.rowHeight（付费插件同款）
    const getRowHeight = () =>
      (internalData.scrollYStore && internalData.scrollYStore.rowHeight) ||
      reactData.rowHeight ||
      48;
    // 按 rowid 找行元素（主 body；rowid 与 $xetable.getRowid 一致）
    const getRowEl = row => {
      const bodyTable = getBodyTable(getMainWrapper());
      if (!bodyTable) return null;
      const rowid = $xetable.getRowid(row);
      return rowid ? bodyTable.querySelector(`.vxe-body--row[rowid="${rowid}"]`) : null;
    };
    // 按 colid 找列元素（指定容器首行内）
    const getColEl = (container, column) => {
      const bodyTable = getBodyTable(container);
      const firstRow = bodyTable && bodyTable.querySelector('.vxe-body--row');
      return firstRow && firstRow.querySelector(`.vxe-body--column[colid="${column.id}"]`);
    };

    // ---------- 坐标 → 单元格（付费插件 Ic/Ms 思路） ----------
    // 容器列序：main = 全量 visibleColumn（含固定列占位，与主容器 colgroup 坐标系一致）；
    // left/right = 对应 fixed 分组（固定容器内容从组首列起算）
    const getContainerCols = containerType => {
      const visibleColumn = getVisibleColumn();
      if (containerType === 'main') return visibleColumn;
      return visibleColumn.filter(col => col.fixed === containerType);
    };
    // 列在容器列序中的前置累计宽（内容坐标；横向虚拟滚动下列滚出渲染切片时的兜底）
    const calcColOffset = (containerType, column) => {
      let acc = 0;
      const cols = getContainerCols(containerType);
      for (const col of cols) {
        if (col.id === column.id) break;
        acc += col.renderWidth || 80;
      }
      return acc;
    };
    // 按容器内 X 定位列：colgroup（渲染切片）优先，未命中（切片外）用 renderWidth 累计兜底
    const findColumnByX = (container, x, containerType) => {
      const bodyTable = getBodyTable(container);
      const colgroup = bodyTable && bodyTable.querySelector('colgroup');
      const visibleColumn = getVisibleColumn();
      if (colgroup && colgroup.children.length) {
        for (const col of colgroup.children) {
          if (x < col.offsetLeft + col.offsetWidth) {
            const colid = col.getAttribute('name');
            return visibleColumn.find(c => c.id === colid) || null;
          }
        }
      }
      // 横向虚拟滚动：X 指向渲染切片外的列 → 全量列序累计定位
      const cols = getContainerCols(containerType);
      if (!cols.length) return null;
      let acc = 0;
      for (const col of cols) {
        const width = col.renderWidth || 80;
        if (x < acc + width) return col;
        acc += width;
      }
      return cols[cols.length - 1];
    };

    const findCellByXY = (clientX, clientY) => {
      const refs = getRefs();
      const mainWrapper = getMainWrapper();
      if (!mainWrapper) return null;
      const mainRect = mainWrapper.getBoundingClientRect();
      const scrollLeft = mainWrapper.scrollLeft || 0;
      const scrollTop = mainWrapper.scrollTop || 0;

      // 内容坐标：client − rect + scroll
      const y = clientY - mainRect.top + scrollTop;

      // 判定容器（左固定 / 右固定 / 主区域），并算容器内 X
      // 固定列 body 用 vxe 直接暴露的 refTableLeftBody/refTableRightBody（内部类名为 fixed-left--wrapper）
      let containerType = 'main';
      let container = mainWrapper;
      let x = clientX - mainRect.left + scrollLeft;
      const leftBodyRef = refs.refTableLeftBody.value;
      const rightBodyRef = refs.refTableRightBody.value;
      const leftBodyEl = leftBodyRef && (leftBodyRef.$el || leftBodyRef);
      const rightBodyEl = rightBodyRef && (rightBodyRef.$el || rightBodyRef);
      if (leftBodyEl) {
        const leftRect = leftBodyEl.getBoundingClientRect();
        if (clientX < leftRect.right) {
          containerType = 'left';
          container = leftBodyEl;
          x = clientX - leftRect.left;
        }
      }
      if (containerType === 'main' && rightBodyEl) {
        const rightRect = rightBodyEl.getBoundingClientRect();
        if (clientX > rightRect.left) {
          containerType = 'right';
          container = rightBodyEl;
          x = clientX - rightRect.left;
        }
      }

      const fullData = internalData.afterFullData || [];
      if (!fullData.length) return null;

      // 行定位：视觉遍历渲染行优先（滚动/行高差异天然正确），未命中用数学兜底
      let rowIndex = -1;
      const mainBodyTable = getBodyTable(mainWrapper);
      const rowEls = mainBodyTable && mainBodyTable.querySelectorAll('.vxe-body--row');
      if (rowEls && rowEls.length) {
        for (let i = 0; i < rowEls.length; i++) {
          const rRect = rowEls[i].getBoundingClientRect();
          if (clientY >= rRect.top && clientY < rRect.bottom) {
            const rowid = rowEls[i].getAttribute('rowid');
            const idx = fullData.findIndex(r => $xetable.getRowid(r) === rowid);
            if (idx > -1) {
              rowIndex = idx;
              break;
            }
          }
        }
      }
      if (rowIndex < 0) {
        const rowHeight = getRowHeight();
        rowIndex = Math.max(0, Math.min(Math.floor(y / rowHeight), fullData.length - 1));
      }

      const column = findColumnByX(container, x, containerType);
      if (!column) return null;
      return { row: fullData[rowIndex], rowIndex, column, containerType };
    };

    // ---------- 选区规范化（行列范围，按行对象引用 / 列 id 定位） ----------
    const normalizeArea = (start, end) => {
      const fullData = internalData.afterFullData || [];
      const visibleColumn = getVisibleColumn();
      const startRI = fullData.indexOf(start.row);
      const endRI = fullData.indexOf(end.row);
      const startCI = visibleColumn.findIndex(col => col.id === start.column.id);
      const endCI = visibleColumn.findIndex(col => col.id === end.column.id);
      if (startRI < 0 || endRI < 0 || startCI < 0 || endCI < 0) return null;
      const minR = Math.min(startRI, endRI);
      const maxR = Math.max(startRI, endRI);
      const minC = Math.min(startCI, endCI);
      const maxC = Math.max(startCI, endCI);
      return {
        rows: fullData.slice(minR, maxR + 1),
        cols: visibleColumn.slice(minC, maxC + 1),
        startRowIndex: minR,
        endRowIndex: maxR,
        startColIndex: minC,
        endColIndex: maxC,
      };
    };

    // ---------- 选区层渲染（付费插件 Ls 思路：数学计算 + 固定列分片） ----------
    // 清除指定容器内的选区层（两层都隐藏时容器一并隐藏）
    const clearLayerInContainer = container => {
      if (!container) return;
      const areaLayer = container.querySelector('.vxe-table--cell-area');
      if (!areaLayer) return;
      const mainArea = areaLayer.querySelector('.vxe-table--cell-main-area');
      const copyArea = areaLayer.querySelector('.vxe-table--cell-copy-area');
      if (mainArea) mainArea.style.display = 'none';
      if (copyArea) copyArea.style.display = 'none';
      areaLayer.style.display = 'none';
    };

    const clearAreaLayer = () => {
      const refs = getRefs();
      clearLayerInContainer(getMainWrapper());
      const leftBodyRef = refs.refTableLeftBody.value;
      const rightBodyRef = refs.refTableRightBody.value;
      clearLayerInContainer(leftBodyRef && (leftBodyRef.$el || leftBodyRef));
      clearLayerInContainer(rightBodyRef && (rightBodyRef.$el || rightBodyRef));
      removeActions();
    };

    // 在指定容器内，按选区列集合计算矩形并写入层元素
    // 视觉优先：量起始/结束行与列的 DOM rect；未渲染用数学兜底
    // 坐标统一为"内容坐标"（视觉差 + 滚动偏移）：area 元素位于滚动容器内、随内容滚动，
    // 写视觉差值会导致滚动后框整体偏移一个 scrollTop（表现为框定位到上一条数据）
    const updateLayer = (
      container,
      containerType,
      colList,
      startRowEl,
      endRowEl,
      area,
      layerClass,
    ) => {
      if (!container || !colList.length) return;
      const areaLayer = container.querySelector('.vxe-table--cell-area');
      if (!areaLayer) return;
      const layerEl = areaLayer.querySelector(layerClass);
      if (!layerEl) return;
      // 容器默认 display:none（开源 CSS），必须显式显示
      areaLayer.style.display = 'block';
      // 强制容器为定位上下文，保证 layer 的 top/left 相对容器内容计算（vxe 未定义容器 position）
      container.style.position = 'relative';
      const baseRect = container.getBoundingClientRect();
      const mainWrapper = getMainWrapper();
      const scrollTop = (mainWrapper && mainWrapper.scrollTop) || 0;
      // 横向仅主区域滚动（固定列不横向滚）
      const scrollLeft =
        containerType === 'main' ? (mainWrapper && mainWrapper.scrollLeft) || 0 : 0;

      // 行范围（统一内容坐标：area 层在滚动容器内随内容滚动，style.top 必须是内容坐标）
      // 视觉分支：行 rect 视觉差 + scrollTop = 内容坐标
      // 数学分支：rowIndex * rowHeight 即内容坐标（不可再减 scrollTop，否则滚动越深偏差越大，框会飞出内容区）
      let top, bottom;
      if (startRowEl && endRowEl) {
        const sRect = startRowEl.getBoundingClientRect();
        const eRect = endRowEl.getBoundingClientRect();
        top = sRect.top - baseRect.top + scrollTop;
        bottom = eRect.bottom - baseRect.top + scrollTop;
      } else {
        const rowHeight = getRowHeight();
        top = area.startRowIndex * rowHeight;
        bottom = (area.endRowIndex + 1) * rowHeight;
      }

      // 列范围（统一内容坐标）：视觉分支优先；某列滚出渲染切片（横向虚拟滚动）时该侧用
      // renderWidth 累计兜底（vxe 布局列宽，与实际渲染一致），与纵向行处理对称
      let left, right;
      const startColEl = getColEl(container, colList[0]);
      const endColEl = getColEl(container, colList[colList.length - 1]);
      if (startColEl) {
        const sRect = startColEl.getBoundingClientRect();
        left = sRect.left - baseRect.left + scrollLeft;
      } else {
        left = calcColOffset(containerType, colList[0]);
      }
      if (endColEl) {
        const eRect = endColEl.getBoundingClientRect();
        right = eRect.right - baseRect.left + scrollLeft;
      } else {
        right =
          calcColOffset(containerType, colList[colList.length - 1]) +
          (colList[colList.length - 1].renderWidth || 80);
      }
      if (top == null || bottom == null || left == null || right == null) return;

      layerEl.style.display = 'block';
      // 多片组合（选区列数多于本容器列数）：所有拼接侧框线全部去除，三片视觉融合为一个完整外框
      // main-area 框线是 border；copy-area 虚线是 background 渐变（background-size 4 值 = 左竖/右竖/上横/下横）
      const isCopyLayer = layerClass.indexOf('copy') > -1;
      const bw = 'var(--vxe-table-cell-copy-area-border-width, 2px)';
      const isCross = colList.length !== area.cols.length;
      // 本片两侧是否存在拼接处
      let hideLeftSide = false;
      let hideRightSide = false;
      if (isCross) {
        if (containerType === 'left') {
          hideRightSide = true;
        } else if (containerType === 'right') {
          hideLeftSide = true;
        } else {
          // 主片：选区含左固定列则左侧为拼接处，含右固定列则右侧为拼接处
          hideLeftSide = area.cols.some(col => col.fixed === 'left');
          hideRightSide = area.cols.some(col => col.fixed === 'right');
        }
      }
      if (isCopyLayer) {
        const w1 = hideLeftSide ? 0 : bw;
        const w2 = hideRightSide ? 0 : bw;
        layerEl.style.backgroundSize = `${w1} 12px, ${w2} 12px, 12px ${bw}, 12px ${bw}`;
      } else {
        if (hideLeftSide) {
          layerEl.style.borderLeft = 'none';
          layerEl.style.borderTopLeftRadius = '0';
          layerEl.style.borderBottomLeftRadius = '0';
        } else {
          layerEl.style.borderLeft = '';
          layerEl.style.borderTopLeftRadius = '';
          layerEl.style.borderBottomLeftRadius = '';
        }
        if (hideRightSide) {
          layerEl.style.borderRight = 'none';
          layerEl.style.borderTopRightRadius = '0';
          layerEl.style.borderBottomRightRadius = '0';
        } else {
          layerEl.style.borderRight = '';
          layerEl.style.borderTopRightRadius = '';
          layerEl.style.borderBottomRightRadius = '';
        }
      }
      // 坐标取整：消除 getBoundingClientRect 亚像素误差导致的拼接处 1px 错位双线
      layerEl.style.top = `${Math.round(top)}px`;
      layerEl.style.left = `${Math.round(left)}px`;
      layerEl.style.height = `${Math.round(bottom - top)}px`;
      layerEl.style.width = `${Math.round(right - left)}px`;
      return layerEl;
    };

    // 取容器内选区层元素（用于挂载操作按钮）
    const pickLayerEl = container => {
      const areaLayer = container && container.querySelector('.vxe-table--cell-area');
      return areaLayer ? areaLayer.querySelector('.vxe-table--cell-main-area') : null;
    };

    const renderAreaLayer = layerType => {
      const s = getState();
      const area = s.area;
      if (!area) return;
      const refs = getRefs();
      const mainWrapper = getMainWrapper();
      const layerClass =
        layerType === 'copy' ? '.vxe-table--cell-copy-area' : '.vxe-table--cell-main-area';

      const startRowEl = getRowEl(area.rows[0]);
      const endRowEl = getRowEl(area.rows[area.rows.length - 1]);

      const leftCols = area.cols.filter(col => col.fixed === 'left');
      const rightCols = area.cols.filter(col => col.fixed === 'right');
      const mainCols = area.cols.filter(col => !col.fixed);

      // 固定列 body 用 vxe 直接暴露的 ref（refTableLeftBody/refTableRightBody）
      const leftBodyRef = refs.refTableLeftBody.value;
      const rightBodyRef = refs.refTableRightBody.value;
      const leftBodyEl = leftBodyRef && (leftBodyRef.$el || leftBodyRef);
      const rightBodyEl = rightBodyRef && (rightBodyRef.$el || rightBodyRef);
      // vxe 仅在横向溢出（overflowX）时才渲染固定列 wrapper（table.js renderFixed 条件），
      // 无横向滚动时固定列直接渲染在主 body 内 → 固定列选区并入主容器渲染
      // （与付费插件 Lo 的回退逻辑一致：固定 ref 不存在时回退主容器）
      const mainTargetCols = []
        .concat(leftBodyEl ? [] : leftCols)
        .concat(mainCols)
        .concat(rightBodyEl ? [] : rightCols);
      if (mainWrapper && mainTargetCols.length) {
        updateLayer(mainWrapper, 'main', mainTargetCols, startRowEl, endRowEl, area, layerClass);
      } else if (mainWrapper && !mainTargetCols.length) {
        clearLayerInContainer(mainWrapper);
      }
      if (leftBodyEl && leftCols.length) {
        updateLayer(leftBodyEl, 'left', leftCols, startRowEl, endRowEl, area, layerClass);
      } else if (leftBodyEl) {
        // 选区缩回（不再包含该片）时清除残留的选区层
        clearLayerInContainer(leftBodyEl);
      }
      if (rightBodyEl && rightCols.length) {
        updateLayer(rightBodyEl, 'right', rightCols, startRowEl, endRowEl, area, layerClass);
      } else if (rightBodyEl) {
        clearLayerInContainer(rightBodyEl);
      }

      // 选区操作按钮（复制/关闭）：挂在最靠右下的片上（右固定 → 主 → 左固定）
      if (layerType !== 'copy') {
        const actionsTarget =
          (rightBodyEl && rightCols.length ? pickLayerEl(rightBodyEl) : null) ||
          (mainWrapper && mainTargetCols.length ? pickLayerEl(mainWrapper) : null) ||
          (leftBodyEl && leftCols.length ? pickLayerEl(leftBodyEl) : null);
        renderActions(actionsTarget);
      }
    };

    // 滚动后重绘选区（框跟随滚动；数学定位基于最新 scrollTop）
    let scrollRepaintHandler = null;
    const bindScrollRepaint = () => {
      if (scrollRepaintHandler) return;
      const mainWrapper = getMainWrapper();
      if (!mainWrapper) return;
      scrollRepaintHandler = () => {
        const s = getState();
        if (s.area) {
          renderAreaLayer('area');
          // 仅复制后才重绘虚线层，避免滚动时凭空出现复制框
          if (s.hasCopy) renderAreaLayer('copy');
        }
      };
      mainWrapper.addEventListener('scroll', scrollRepaintHandler);
    };

    // ---------- 拖拽（付费插件 te 思路：越界自动滚动） ----------
    const stopAutoScroll = () => {
      const s = getState();
      if (s.scrollTimer) {
        clearInterval(s.scrollTimer);
        s.scrollTimer = null;
      }
    };
    const startAutoScroll = (dx, dy) => {
      const s = getState();
      if (s.scrollTimer) return;
      const mainWrapper = getMainWrapper();
      if (!mainWrapper) return;
      s.scrollTimer = setInterval(() => {
        mainWrapper.scrollLeft += dx;
        mainWrapper.scrollTop += dy;
        if (s.lastMouse) {
          const cell = findCellByXY(s.lastMouse.clientX, s.lastMouse.clientY);
          if (cell) {
            s.area = normalizeArea(s.startCell, cell);
            if (s.area) {
              renderAreaLayer('area');
              syncCheckboxByArea(s.area);
            }
          }
        }
      }, 50);
    };

    const handleDragMove = evnt => {
      const s = getState();
      if (!s.isDrag) return;
      evnt.preventDefault();
      s.lastMouse = { clientX: evnt.clientX, clientY: evnt.clientY };

      // 越界检测 → 自动滚动
      const mainWrapper = getMainWrapper();
      if (mainWrapper) {
        const rect = mainWrapper.getBoundingClientRect();
        const step = 30;
        let dx = 0;
        let dy = 0;
        if (evnt.clientY < rect.top) dy = -step;
        else if (evnt.clientY > rect.bottom) dy = step;
        if (evnt.clientX < rect.left) dx = -step;
        else if (evnt.clientX > rect.right) dx = step;
        if (dx || dy) startAutoScroll(dx, dy);
        else stopAutoScroll();
      }

      const cell = findCellByXY(evnt.clientX, evnt.clientY);
      if (!cell) return;
      s.area = normalizeArea(s.startCell, cell);
      if (s.area) {
        renderAreaLayer('area');
        syncCheckboxByArea(s.area);
      }
    };

    const handleDragEnd = () => {
      const s = getState();
      s.isDrag = false;
      s.checkboxDrag = null;
      stopAutoScroll();
      document.removeEventListener('mousemove', handleDragMove);
    };

    // ---------- 复制（vxe 全局 copy 转交钩子） ----------
    // 剥离 formatter 返回的 HTML 标签（如状态点列），避免复制出源码
    const stripHtml = str => String(str).replace(/<[^>]*>/g, '');
    // 复制是否含表头（areaConfig.isCopyHeader，默认 false，对齐付费插件配置面）
    const isCopyHeader = () => {
      try {
        return !!$xetable.getComputeMaps().computeAreaOpts.value.isCopyHeader;
      } catch (e) {
        return false;
      }
    };

    const getCopyValue = (row, column, rowIndex) => {
      if (column.type === 'seq') return rowIndex + 1;
      if (column.type === 'checkbox') {
        const checked = row[column.field] === true || row[column.field] === 1;
        return checked ? 'TRUE' : 'FALSE';
      }
      try {
        const label = $xetable.getCellLabel(row, column);
        return label == null ? '' : stripHtml(label);
      } catch (e) {
        return row[column.field] == null ? '' : row[column.field];
      }
    };

    // TSV 值清洗：制表符冲突处理 + 含换行加引号包裹（CSV 规范）
    const toCSVValue = value => {
      let str = value == null ? '' : String(value);
      str = str.replace(/\t/g, ' ');
      if (str.indexOf('\n') > -1) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const buildTSV = area => {
      const lines = [];
      if (isCopyHeader()) {
        lines.push(area.cols.map(col => toCSVValue(stripHtml(col.title || ''))).join('\t'));
      }
      area.rows.forEach((row, r) => {
        lines.push(
          area.cols
            .map(col => toCSVValue(getCopyValue(row, col, area.startRowIndex + r)))
            .join('\t'),
        );
      });
      return lines.join('\r\n');
    };

    const escapeHtml = str =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const buildHTML = area => {
      const head = area.cols
        .map(
          col =>
            `<th style="border:1px solid #d9d9d9;padding:4px 8px;background:#fafafa;text-align:left;white-space:nowrap">${escapeHtml(
              col.title || '',
            )}</th>`,
        )
        .join('');
      const body = area.rows
        .map((row, r) => {
          const tds = area.cols
            .map(col => {
              const v = getCopyValue(row, col, area.startRowIndex + r);
              const str = v == null ? '' : String(v).replace(/\t/g, ' ');
              return `<td style="border:1px solid #d9d9d9;padding:4px 8px;white-space:nowrap">${escapeHtml(
                str,
              )}</td>`;
            })
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');
      return `<table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    };

    // 复制成功提示（业务系统用词条 common.copySuccessTips，独立版直接中文，与双击复制单格提示一致）
    const notifyCopySuccess = () => {
      try {
        message.success('复制成功');
      } catch (e) {
        // 提示失败不影响复制结果
      }
    };

    // 程序化写剪贴板（无 copy 事件的场景：双击已框选区域直接复制）
    const writeClipboard = text => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) {
        // 降级到 execCommand
      }
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    };

    // 程序化复制当前选区（双击已框选区域时触发）：写剪贴板 + 切换为复制态（虚线框）
    const copyAreaToClipboard = () => {
      const s = getState();
      const area = s.area;
      if (!area || !area.rows.length || !area.cols.length) return;
      const text = buildTSV(area);
      if (!text) return;
      const ok = writeClipboard(text);
      if (ok !== false) {
        s.hasCopy = true;
        renderAreaLayer('copy');
        notifyCopySuccess();
      }
    };

    // vxe 全局 copy 事件转交（需 keyboardConfig.isClip: true 才进入）
    const handleCopyCellAreaEvent = evnt => {
      const s = getState();
      const area = s.area;
      if (!area || !area.rows.length || !area.cols.length) return;
      const text = buildTSV(area);
      if (!text) return;
      const clip = evnt.clipboardData || window.clipboardData;
      if (clip) {
        clip.setData('text/plain', text);
        clip.setData('text/html', buildHTML(area));
        evnt.preventDefault();
        // 标记已复制：后续滚动重绘才渲染虚线层
        s.hasCopy = true;
        renderAreaLayer('copy');
        notifyCopySuccess();
      }
    };

    // 解除选区（清空状态 + 隐藏选区/复制层）
    const clearSelection = () => {
      const s = getState();
      s.area = null;
      s.startCell = null;
      s.isDrag = false;
      s.hasCopy = false;
      stopAutoScroll();
      clearAreaLayer();
    };
    // 移除选区操作按钮
    const removeActions = () => {
      const root = getRefs().refElem.value;
      if (!root) return;
      const list = root.querySelectorAll('.' + ACTIONS_CLASS);
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        el.parentNode && el.parentNode.removeChild(el);
      }
    };

    // 渲染选区操作按钮（复制 / 关闭）：挂载到选区层右下角
    // 按钮为选区层子元素（随框移动），已挂载在同一目标层时不重建，避免拖拽高频重绘时抖动
    const renderActions = targetLayer => {
      if (!targetLayer) return;
      const root = getRefs().refElem.value;
      const existing = root && root.querySelector('.' + ACTIONS_CLASS);
      if (existing && existing.parentNode === targetLayer) return;
      removeActions();
      const box = document.createElement('div');
      box.className = ACTIONS_CLASS;
      const createBtn = (text, cls, handler) => {
        const btn = document.createElement('span');
        btn.className = cls;
        btn.textContent = text;
        // 阻止冒泡/默认：避免触发单元格逻辑与文档级"点击关闭"
        btn.addEventListener('mousedown', e => {
          e.stopPropagation();
          e.preventDefault();
        });
        btn.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          handler();
        });
        return btn;
      };
      box.appendChild(createBtn('复制', 'area-actions-copy', () => copyAreaToClipboard()));
      box.appendChild(createBtn('关闭', 'area-actions-close', () => clearSelection()));
      targetLayer.appendChild(box);
    };

    // 抑制长按 checkbox 后紧随的 click（捕获阶段拦截，避免 vxe 原生再次切换导致状态回弹）
    const handleSuppressClick = evnt => {
      const s = getState();
      if (!s.suppressClick) return;
      s.suppressClick = false;
      evnt.stopPropagation();
      evnt.preventDefault();
    };
    document.addEventListener('click', handleSuppressClick, true);

    // 点击"除复制按钮外"的任何地方 → 关闭选区（复制按钮点击保持选区）
    const handleDocMousedown = evnt => {
      const s = getState();
      if (!s.area && !s.isDrag) return;
      const target = evnt.target;
      if (target && target.closest && target.closest('.' + ACTIONS_CLASS)) return;
      clearSelection();
    };
    document.addEventListener('mousedown', handleDocMousedown);

    // ---------- vxe 官方转交钩子（Keyboard 模块 mousedown 时自动调用） ----------
    // mousedown 入口：启动长按定时器（到达 LONG_PRESS_DELAY 才进入框选）
    // 起点列类型决定关联行为：起点为 checkbox 列 → 框选的同时同步勾选；否则仅框选
    const handleCellAreaEvent = (evnt, params) => {
      if (!isAreaEnabled()) return;
      const { row, column } = params || {};
      if (!row || !column) return;
      const s = getState();
      s.fromCheckbox = column.type === 'checkbox';
      stopPressTimer();
      s.pressTimer = setTimeout(() => {
        s.pressTimer = null;
        beginAreaSelect(row, column);
      }, LONG_PRESS_DELAY);
      document.addEventListener('mouseup', handlePressEnd);
    };

    // ---------- checkbox 同步勾选（仅起点为 checkbox 列时启用） ----------
    // 目标状态 = 起始行当前状态取反（对齐 vxe 原生 range 语义），范围内逐行统一设置该状态
    const initCheckboxSync = startRow => {
      const s = getState();
      const records = $xetable.getCheckboxRecords() || [];
      s.checkboxDrag = { targetState: !records.some(r => r === startRow), done: {} };
    };

    // 按选区行范围同步勾选（复用选区范围，无需二次定位）
    const syncCheckboxByArea = area => {
      const s = getState();
      const drag = s.checkboxDrag;
      if (!drag || !area) return;
      const fullData = internalData.afterFullData || [];
      for (let i = area.startRowIndex; i <= area.endRowIndex; i++) {
        if (drag.done[i]) continue;
        drag.done[i] = true;
        $xetable.setCheckboxRow(fullData[i], drag.targetState);
      }
    };

    // 长按达到时长：正式进入框选
    const beginAreaSelect = (row, column) => {
      const s = getState();
      // 长按期间浏览器可能已选中文本，清除之
      clearTextSelection();
      s.isDrag = true;
      s.hasCopy = false;
      clearAreaLayer();
      s.startCell = { row, column };
      // 起点为 checkbox 列 → 启用同步勾选（长按即勾选/取消起始行）
      if (s.fromCheckbox) {
        initCheckboxSync(row);
        // 长按已接管本次勾选，抑制 mouseup 后紧随的原生 click（否则会再切换回来）
        s.suppressClick = true;
      } else {
        s.checkboxDrag = null;
      }
      s.area = normalizeArea({ row, column }, { row, column });
      if (s.area) {
        renderAreaLayer('area');
        syncCheckboxByArea(s.area);
      }
      // 滚动时重绘选区（框跟随滚动）
      bindScrollRepaint();
      document.addEventListener('mousemove', handleDragMove);
    };

    // mouseup：未达长按时长则取消（快速单击不框选）；已达长按则结束拖拽
    const handlePressEnd = () => {
      stopPressTimer();
      handleDragEnd();
      document.removeEventListener('mouseup', handlePressEnd);
    };

    const stopPressTimer = () => {
      const s = getState();
      if (s.pressTimer) {
        clearTimeout(s.pressTimer);
        s.pressTimer = null;
      }
    };

    // 清除浏览器原生文本选择（长按会选中文本）
    const clearTextSelection = () => {
      try {
        const selection = window.getSelection();
        selection && selection.removeAllRanges();
      } catch (e) {
        // 忽略
      }
    };

    // 卸载清理（setupTable 在组件 setup 阶段执行，可注册生命周期）
    try {
      onBeforeUnmount(() => {
        stopAutoScroll();
        stopPressTimer();
        removeActions();
        getState().checkboxDrag = null;
        document.removeEventListener('click', handleSuppressClick, true);
        document.removeEventListener('mousedown', handleDocMousedown);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handlePressEnd);
        if (scrollRepaintHandler) {
          const mainWrapper = getMainWrapper();
          mainWrapper && mainWrapper.removeEventListener('scroll', scrollRepaintHandler);
          scrollRepaintHandler = null;
        }
      });
    } catch (e) {
      // 非组件上下文忽略
    }

    return {
      handleCellAreaEvent,
      /**
       * vxe 官方"area 插件已安装"标志 + 数据/滚动变化后重绘选区。
       * vxe 核心（table.js）以该方法是否存在判定付费插件是否安装：
       * 未注入时 mouseConfig.area 会 errLog + return 中断初始化（dev 模式必现）。
       */
      handleUpdateCellAreas: () => {
        const s = getState();
        if (s.area) {
          renderAreaLayer('area');
          if (s.hasCopy) renderAreaLayer('copy');
        }
        return Promise.resolve();
      },
      // vxe 全局 copy 转交（键盘 Ctrl+C，需 keyboardConfig.isClip: true）
      handleCopyCellAreaEvent,
    };
  },
};

export const VxeModuleCellArea = {
  install() {
    VXETable.hooks.add('$tableCellArea', cellAreaHook);
  },
};

export default VxeModuleCellArea;
