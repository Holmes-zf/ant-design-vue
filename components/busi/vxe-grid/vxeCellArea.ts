/**
 * vxe-table 单元格区域选择与复制扩展插件
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
 */
import { VXETable } from 'vxe-table';
import { onBeforeUnmount } from 'vue';

const cellAreaHook = {
  setupTable($xetable: any) {
    const { props, reactData, internalData } = $xetable;

    // ---------- 实例级状态（闭包持有） ----------
    let state: any = null;
    const getState = () => {
      if (!state) {
        state = {
          isDrag: false,
          startCell: null,
          area: null,
          lastMouse: null, // 自动滚动时用于重新定位
          scrollTimer: null,
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
    const getBodyTable = (container: any) => container && container.querySelector('.vxe-table--body');
    // 行高：虚拟滚动用 scrollYStore.rowHeight，普通渲染用 reactData.rowHeight（付费插件同款）
    const getRowHeight = () =>
      (internalData.scrollYStore && internalData.scrollYStore.rowHeight) || reactData.rowHeight || 48;
    // 按 rowid 找行元素（主 body；rowid 与 $xetable.getRowid 一致）
    const getRowEl = (row: any) => {
      const bodyTable = getBodyTable(getMainWrapper());
      if (!bodyTable) return null;
      const rowid = $xetable.getRowid(row);
      return rowid ? bodyTable.querySelector(`.vxe-body--row[rowid="${rowid}"]`) : null;
    };
    // 按 colid 找列元素（指定容器首行内）
    const getColEl = (container: any, column: any) => {
      const bodyTable = getBodyTable(container);
      const firstRow = bodyTable && bodyTable.querySelector('.vxe-body--row');
      return firstRow && firstRow.querySelector(`.vxe-body--column[colid="${column.id}"]`);
    };

    // ---------- 坐标 → 单元格（付费插件 Ic/Ms 思路） ----------
    // 容器列序：main = 全量 visibleColumn（含固定列占位，与主容器 colgroup 坐标系一致）；
    // left/right = 对应 fixed 分组（固定容器内容从组首列起算）
    const getContainerCols = (containerType: string) => {
      const visibleColumn = getVisibleColumn();
      if (containerType === 'main') return visibleColumn;
      return visibleColumn.filter((col: any) => col.fixed === containerType);
    };
    // 列在容器列序中的前置累计宽（内容坐标；横向虚拟滚动下列滚出渲染切片时的兜底）
    const calcColOffset = (containerType: string, column: any) => {
      let acc = 0;
      const cols = getContainerCols(containerType);
      for (const col of cols) {
        if (col.id === column.id) break;
        acc += col.renderWidth || 80;
      }
      return acc;
    };
    // 按容器内 X 定位列：colgroup（渲染切片）优先，未命中（切片外）用 renderWidth 累计兜底
    const findColumnByX = (container: any, x: number, containerType: string) => {
      const bodyTable = getBodyTable(container);
      const colgroup = bodyTable && bodyTable.querySelector('colgroup');
      const visibleColumn = getVisibleColumn();
      if (colgroup && colgroup.children.length) {
        for (const col of colgroup.children) {
          if (x < col.offsetLeft + col.offsetWidth) {
            const colid = col.getAttribute('name');
            return visibleColumn.find((c: any) => c.id === colid) || null;
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

    const findCellByXY = (clientX: number, clientY: number) => {
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
            const idx = fullData.findIndex((r: any) => $xetable.getRowid(r) === rowid);
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
    const normalizeArea = (start: any, end: any) => {
      const fullData = internalData.afterFullData || [];
      const visibleColumn = getVisibleColumn();
      const startRI = fullData.indexOf(start.row);
      const endRI = fullData.indexOf(end.row);
      const startCI = visibleColumn.findIndex((col: any) => col.id === start.column.id);
      const endCI = visibleColumn.findIndex((col: any) => col.id === end.column.id);
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
    const clearAreaLayer = () => {
      const refs = getRefs();
      const clear = (container: any) => {
        if (!container) return;
        const areaLayer = container.querySelector('.vxe-table--cell-area');
        if (!areaLayer) return;
        const mainArea = areaLayer.querySelector('.vxe-table--cell-main-area');
        const copyArea = areaLayer.querySelector('.vxe-table--cell-copy-area');
        if (mainArea) mainArea.style.display = 'none';
        if (copyArea) copyArea.style.display = 'none';
        areaLayer.style.display = 'none';
      };
      clear(getMainWrapper());
      const leftBodyRef = refs.refTableLeftBody.value;
      const rightBodyRef = refs.refTableRightBody.value;
      clear(leftBodyRef && (leftBodyRef.$el || leftBodyRef));
      clear(rightBodyRef && (rightBodyRef.$el || rightBodyRef));
    };

    // 在指定容器内，按选区列集合计算矩形并写入层元素
    // 视觉优先：量起始/结束行与列的 DOM rect；未渲染用数学兜底
    // 坐标统一为"内容坐标"（视觉差 + 滚动偏移）：area 元素位于滚动容器内、随内容滚动，
    // 写视觉差值会导致滚动后框整体偏移一个 scrollTop（表现为框定位到上一条数据）
    const updateLayer = (
      container: any,
      containerType: string,
      colList: any[],
      startRowEl: any,
      endRowEl: any,
      area: any,
      layerClass: string
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
      const scrollLeft = containerType === 'main' ? (mainWrapper && mainWrapper.scrollLeft) || 0 : 0;

      // 行范围（统一内容坐标：area 层在滚动容器内随内容滚动，style.top 必须是内容坐标）
      // 视觉分支：行 rect 视觉差 + scrollTop = 内容坐标
      // 数学分支：rowIndex * rowHeight 即内容坐标（不可再减 scrollTop，否则滚动越深偏差越大，框会飞出内容区）
      let top: number, bottom: number;
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
      let left: number, right: number;
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
          hideLeftSide = area.cols.some((col: any) => col.fixed === 'left');
          hideRightSide = area.cols.some((col: any) => col.fixed === 'right');
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
    };

    const renderAreaLayer = (layerType: string) => {
      const s = getState();
      const area = s.area;
      if (!area) return;
      const refs = getRefs();
      const mainWrapper = getMainWrapper();
      const layerClass = layerType === 'copy' ? '.vxe-table--cell-copy-area' : '.vxe-table--cell-main-area';

      const startRowEl = getRowEl(area.rows[0]);
      const endRowEl = getRowEl(area.rows[area.rows.length - 1]);

      const leftCols = area.cols.filter((col: any) => col.fixed === 'left');
      const rightCols = area.cols.filter((col: any) => col.fixed === 'right');
      const mainCols = area.cols.filter((col: any) => !col.fixed);

      if (mainWrapper && mainCols.length) {
        updateLayer(mainWrapper, 'main', mainCols, startRowEl, endRowEl, area, layerClass);
      }
      // 固定列 body 用 vxe 直接暴露的 ref（refTableLeftBody/refTableRightBody）
      const leftBodyRef = refs.refTableLeftBody.value;
      const rightBodyRef = refs.refTableRightBody.value;
      const leftBodyEl = leftBodyRef && (leftBodyRef.$el || leftBodyRef);
      const rightBodyEl = rightBodyRef && (rightBodyRef.$el || rightBodyRef);
      // vxe 仅在横向溢出（overflowX）时才渲染固定列 wrapper（table.js renderFixed 条件），
      // 无横向滚动时固定列直接渲染在主 body 内 → 固定列选区并入主容器渲染
      // （与付费插件 Lo 的回退逻辑一致：固定 ref 不存在时回退主容器）
      const mainTargetCols: any[] = []
        .concat(leftBodyEl ? [] : leftCols)
        .concat(mainCols)
        .concat(rightBodyEl ? [] : rightCols);
      if (mainWrapper && mainTargetCols.length) {
        updateLayer(mainWrapper, 'main', mainTargetCols, startRowEl, endRowEl, area, layerClass);
      }
      if (leftBodyEl && leftCols.length) {
        updateLayer(leftBodyEl, 'left', leftCols, startRowEl, endRowEl, area, layerClass);
      }
      if (rightBodyEl && rightCols.length) {
        updateLayer(rightBodyEl, 'right', rightCols, startRowEl, endRowEl, area, layerClass);
      }
    };

    // 滚动后重绘选区（框跟随滚动；数学定位基于最新 scrollTop）
    let scrollRepaintHandler: any = null;
    const bindScrollRepaint = () => {
      if (scrollRepaintHandler) return;
      const mainWrapper = getMainWrapper();
      if (!mainWrapper) return;
      scrollRepaintHandler = () => {
        const s = getState();
        if (s.area) {
          renderAreaLayer('area');
          renderAreaLayer('copy');
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
    const startAutoScroll = (dx: number, dy: number) => {
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
            if (s.area) renderAreaLayer('area');
          }
        }
      }, 50);
    };

    const handleDragMove = (evnt: MouseEvent) => {
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
      if (s.area) renderAreaLayer('area');
    };

    const handleDragEnd = () => {
      const s = getState();
      s.isDrag = false;
      stopAutoScroll();
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    // ---------- 复制（vxe 全局 copy 转交钩子） ----------
    // 剥离 formatter 返回的 HTML 标签（如状态点列），避免复制出源码
    const stripHtml = (str: any) => String(str).replace(/<[^>]*>/g, '');
    // 复制是否含表头（areaConfig.isCopyHeader，默认 false，对齐付费插件配置面）
    const isCopyHeader = () => {
      try {
        return !!$xetable.getComputeMaps().computeAreaOpts.value.isCopyHeader;
      } catch (e) {
        return false;
      }
    };

    const getCopyValue = (row: any, column: any, rowIndex: number) => {
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
    const toCSVValue = (value: any) => {
      let str = value == null ? '' : String(value);
      str = str.replace(/\t/g, ' ');
      if (str.indexOf('\n') > -1) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const buildTSV = (area: any) => {
      const lines: string[] = [];
      if (isCopyHeader()) {
        lines.push(area.cols.map((col: any) => toCSVValue(stripHtml(col.title || ''))).join('\t'));
      }
      area.rows.forEach((row: any, r: number) => {
        lines.push(
          area.cols
            .map((col: any) => toCSVValue(getCopyValue(row, col, area.startRowIndex + r)))
            .join('\t')
        );
      });
      return lines.join('\r\n');
    };

    const escapeHtml = (str: any) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const buildHTML = (area: any) => {
      const head = area.cols
        .map(
          (col: any) =>
            `<th style="border:1px solid #d9d9d9;padding:4px 8px;background:#fafafa;text-align:left;white-space:nowrap">${escapeHtml(
              col.title || ''
            )}</th>`
        )
        .join('');
      const body = area.rows
        .map((row: any, r: number) => {
          const tds = area.cols
            .map((col: any) => {
              const v = getCopyValue(row, col, area.startRowIndex + r);
              const str = v == null ? '' : String(v).replace(/\t/g, ' ');
              return `<td style="border:1px solid #d9d9d9;padding:4px 8px;white-space:nowrap">${escapeHtml(str)}</td>`;
            })
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');
      return `<table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    };

    // vxe 全局 copy 事件转交（需 keyboardConfig.isClip: true 才进入）
    const handleCopyCellAreaEvent = (evnt: any) => {
      const s = getState();
      const area = s.area;
      if (!area || !area.rows.length || !area.cols.length) return;
      const text = buildTSV(area);
      if (!text) return;
      const clip = evnt.clipboardData || (window as any).clipboardData;
      if (clip) {
        clip.setData('text/plain', text);
        clip.setData('text/html', buildHTML(area));
        evnt.preventDefault();
        renderAreaLayer('copy');
      }
    };

    // 点击表格外其它区域时清理选区辅助框（state.area 置空 + 选区/复制层隐藏）
    const handleDocMousedown = (evnt: any) => {
      const s = getState();
      if (!s.area && !s.isDrag) return;
      const root = getRefs().refElem.value;
      if (!root || root.contains(evnt.target)) return;
      s.area = null;
      s.startCell = null;
      s.isDrag = false;
      stopAutoScroll();
      clearAreaLayer();
    };
    document.addEventListener('mousedown', handleDocMousedown);

    // ---------- vxe 官方转交钩子（Keyboard 模块 mousedown 时自动调用） ----------
    const handleCellAreaEvent = (evnt: any, params: any) => {
      if (!isAreaEnabled()) return;
      const { row, column } = params || {};
      if (!row || !column) return;
      const s = getState();
      // 阻止浏览器原生文本选择
      evnt.preventDefault();
      // 新拖拽：清理上一轮选区层
      clearAreaLayer();
      s.isDrag = true;
      s.startCell = { row, column };
      s.area = normalizeArea({ row, column }, { row, column });
      if (s.area) renderAreaLayer('area');
      // 滚动时重绘选区（框跟随滚动）
      bindScrollRepaint();
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    };

    // 卸载清理（setupTable 在组件 setup 阶段执行，可注册生命周期）
    try {
      onBeforeUnmount(() => {
        stopAutoScroll();
        document.removeEventListener('mousedown', handleDocMousedown);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
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
          renderAreaLayer('copy');
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
