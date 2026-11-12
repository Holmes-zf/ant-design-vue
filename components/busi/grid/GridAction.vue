<script lang="ts">
import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  defineComponent,
  h,
  nextTick,
  reactive,
  type PropType,
  type VNode,
} from 'vue';
import { Dropdown as AntDropdown, Popconfirm as AntPopconfirm, Popover } from 'ant-design-vue';
import SvgIcon from '../icon/SvgIcon.vue';
import Popconfirm from '../popconfirm/Popconfirm.vue';
import Dropdown from '../dropdown/Dropdown.vue';

/** 未传 max 时的行内按钮上限（「更多」图标不计入） */
const MAX_DEFAULT = 3;

/**
 * max 归一化：空串 / null / 非数值一律回落到 MAX_DEFAULT，其余取非负整数。
 * 必须显式判空——Number("") 与 Number(null) 都等于 0，会把全部按钮折进「更多」。
 */
function normalizeMax(value: number | string | null | undefined): number {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return MAX_DEFAULT;
  }
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : MAX_DEFAULT;
}

/**
 * 自带二级弹层的组件：折进「更多」后需接管其显隐（弹层未关时锁住折叠面板）。
 * 收录条件：会发 visibleChange —— a-popconfirm / a-popover / Popconfirm / 各类 dropdown。
 * a-select（dropdownVisibleChange）与 a-date-picker（openChange）事件名不同，纳入无效。
 */
const POPUP_COMPONENTS = new Set<VNode['type']>([
  Popconfirm,
  AntPopconfirm,
  Popover,
  // 主动下拉：本项目薄壳 + antd 原版（业务两种写法都有）
  Dropdown,
  AntDropdown,
]);

/**
 * 「点浮层内部即代表这次交互结束」的组件：非受控下拉点菜单项时，vc-dropdown 只把内部
 * triggerVisible 置 false、**不发 visibleChange**（`vc-dropdown/dropdown.js:74-79`），
 * 靠 visibleChange 对账会漏掉这条路径 ⇒ 账本残留、面板永远收不起来。
 * 它们另外会 emit `overlayClick`（同一处 emit），用它补齐「点了就该收」这条对账口。
 *
 * 只登记下拉类：popconfirm / popover 的内容区点击不必然代表结束（气泡里可能有表单），
 * 它们的确定/取消已经走 visibleChange，不要再叠加。
 */
const OVERLAY_CLICK_COMPONENTS = new Set<VNode['type']>([Dropdown, AntDropdown]);

/** 对齐修饰类：与 ActionBody 的 `align` 同名同值，迁移时行为一致 */
const ALIGN_CLASS: Record<string, string> = {
  center: 'grid-action--center',
  right: 'grid-action--right',
};

/**
 * 插槽执行结果的节点形态：手写 `{cond && h(...)}` 会产出 null / false，
 * v-for / Fragment 会产出嵌套数组，纯文本节点则是 string / number
 */
type SlotNode = VNode | SlotNode[] | string | number | boolean | void | null | undefined;

/**
 * antd Menu 的 click 事件载荷。vc-dropdown 把它原样当作 overlayClick 的载荷抛出
 * （`vc-dropdown/dropdown.js:74-79`），所以这里要按 info 对象取原生事件，不能当 MouseEvent 用。
 */
type MenuClickInfo = {
  key?: string | number;
  keyPath?: (string | number)[];
  item?: unknown;
  domEvent?: MouseEvent;
};

/**
 * 展开「透明容器」：数组与 Fragment，剔除 v-if 占位注释与空白文本。
 * 元素节点与组件节点一律原子（不读 children），业务层级不会被拆开。
 */
function filterVNodes(nodes: SlotNode[] = []): VNode[] {
  const result: VNode[] = [];
  for (const node of nodes) {
    // 先剔除空值与非 VNode：下面每个分支都要读 node.type，null / undefined 取值即抛错
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      result.push(...filterVNodes(node));
      continue;
    }
    if (node.type === Fragment) {
      result.push(...filterVNodes(Array.isArray(node.children) ? node.children : []));
      continue;
    }
    if (node.type === Comment) continue;
    // 空白文本是 v-if 占位，跳过；非空 Text 与 Static（v-pre / 编译期静态内容）都是整体节点，
    // 无法拆成多个按钮、也不能 cloneVNode，按「1 个原子项」原样保留
    if (node.type === Text && String(node.children).trim() === '') continue;
    result.push(node);
  }
  return result;
}

/**
 * 表格操作列：行内最多展示 max 个按钮，其余收进 icon-YTmore 悬浮下拉。使用约束：
 * 1. 显隐一律 v-if（v-show 仍占配额，补位失效）；max 默认 3，列宽 220 建议 2。
 * 2. 插槽内容为同一行的操作按钮，一个动作放一个节点。
 * 3. 折叠区里的二级弹层自动接管显隐；a-select / a-date-picker 需自备 getPopupContainer。
 * 4. 折叠区弹层不要用外部 visible 控制（面板靠其 visibleChange 记账，受控会锁死）。
 * 5. 折叠区动作文本按行内链接呈现；语义色只认 error-color / success-color / .ant-btn-dangerous。
 * 6. 键盘边界：面板 hover 打开、面板项不可 Tab 聚焦，属「鼠标工具条」的既定取舍。
 */
export default defineComponent({
  name: 'GridAction',
  props: {
    /** 行内直接展示的业务按钮数量上限，不传为 3；空值 / 非数值一律按 3 处理 */
    max: {
      // 同时接受字符串：兼容 max="2"（漏写冒号）这类模板写法，避免只抛 prop 告警
      type: [Number, String] as PropType<number | string>,
      default: MAX_DEFAULT,
    },
    /** 可选文字入口，为空时只显示图标 */
    moreText: {
      type: String,
      default: '',
    },
    /** 行内按钮的水平对齐：left（默认）/ center / right，与 ActionBody 同口径 */
    align: {
      type: String,
      default: 'left',
    },
  },
  setup(props, { slots }) {
    /**
     * 折叠面板显隐（受控，单值源）。只有这里决定 Dropdown 的 visible：
     * 面板不再渲染时由 render 的短路径归零（见下方注释），弹层只改账本。
     */
    const panelState = reactive({ visible: false });

    /**
     * 折叠区弹层「打开账本」：键 = 折叠项 key，值为「该弹层当前确实开着」。
     * 三个入口都是结构事实，不需要去 document 里探测弹层 DOM：
     *   打开 → 弹层发 visibleChange(true)；关闭 → visibleChange(false)；
     *   被外部卸载（行回收、折叠项增删、父级改数据）→ vnode 卸载钩子。
     * 非响应式：只在事件与卸载钩子里读写、render 不读它，避免在 patch 期间触发多余更新。
     */
    const openPopups = new Set<string>();

    /**
     * 被锁挡下的收起请求，锁一释放就补执行。
     * 「鼠标移出面板」与「弹层关闭」的先后没有保证：只挡不补会留下僵尸面板
     * （鼠标早在屏幕另一端，面板还开着）；只补不挡会把浮层连根拔掉。
     */
    let pendingClose = false;

    const hasOpenPopup = () => openPopups.size > 0;

    /** 收面板：账本一并清空（面板收起 ⇒ 弹层已全部卸载，账本必须为空，防未来新增路径漏删） */
    const closePanel = () => {
      panelState.visible = false;
      openPopups.clear();
      pendingClose = false;
    };

    const handlePanelVisibleChange = (visible: boolean) => {
      if (visible) {
        pendingClose = false;
        panelState.visible = true;
        return;
      }
      if (hasOpenPopup()) {
        pendingClose = true;
        return;
      }
      closePanel();
    };

    /** 锁释放后补执行被挡下的收起 */
    const flushPendingClose = () => {
      if (hasOpenPopup() || !pendingClose) return;
      closePanel();
    };

    /** 弹层关闭后收尾：删自己的名，账本空了才真正收起面板 */
    const closePanelByPopup = (itemKey: string) => {
      openPopups.delete(itemKey);
      if (hasOpenPopup()) return;
      closePanel();
    };

    /**
     * 折叠区内弹层显隐（用户操作类事件）：
     * 打开 → 记账并锁住面板（幂等，重复打开只是重复 add）；关闭 → 延后一帧收面板，
     * 避免在同一调用栈里卸载弹层与触发节点。
     * 业务自身的 onVisibleChange 由 mergeProps 与本函数并列在同一监听器数组里，
     * 且排在前面先执行（此刻面板与触发节点都还在），无需在此转发。
     */
    const handlePopupVisibleChange = (itemKey: string, visible: boolean) => {
      if (visible) {
        pendingClose = false;
        openPopups.add(itemKey);
        panelState.visible = true;
        return;
      }
      nextTick(() => closePanelByPopup(itemKey));
    };

    /** 鼠标回到面板内：撤销被挡下的收起（从二级浮层移回面板走这条路径） */
    const handlePanelMouseenter = () => {
      pendingClose = false;
    };

    /**
     * 面板项点击：整行可点（点在 padding 空白处时转发给项内第一个可点元素），
     * 这次交互结束就收起面板；气泡 / 嵌套下拉刚被点开时账本已非空 ⇒ 不动。
     */
    const handleItemClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        const item = event.currentTarget as HTMLElement;
        // 兼容「用多层 div 写的按钮」：找不到 a/button 时退回第一个元素子节点
        const target =
          item.querySelector<HTMLElement>('a, button:not(:disabled):not([disabled])') ??
          (item.firstElementChild as HTMLElement | null);
        target?.click();
      }
      if (hasOpenPopup()) return;
      closePanel();
    };

    return () => {
      // 每次 render 重新执行插槽：行复用、行数据变化时才能取到最新的显隐结果
      const nodes = filterVNodes(slots.default?.());
      // 归一化 max：兼容 max="2"（漏写冒号）这类字符串传参；空值/非数值回落到 MAX_DEFAULT
      const limit = normalizeMax(props.max);
      const alignClass = ALIGN_CLASS[props.align];
      const rootClass = alignClass ? `grid-action ${alignClass}` : 'grid-action';

      // 未超上限（含空操作列）⇒ 全部行内，渲染空容器保持行高。
      // 这条分支不读 panelState（本 render 未把它收进依赖），
      // 因此下面的复位写入不会反过来触发本次渲染重跑，无循环风险。
      if (nodes.length <= limit) {
        if (panelState.visible) closePanel();
        return h('div', { class: rootClass }, nodes);
      }

      const inlineNodes = nodes.slice(0, limit);
      const panelNodes = nodes.slice(limit);

      /** 弹层记账注入：只针对「开着时需要锁住面板」的弹层，其余节点原样返回 */
      const injectPopupBridge = (node: VNode, itemKey: string): VNode => {
        if (!POPUP_COMPONENTS.has(node.type)) return node;
        // 业务自带 overlayClassName 时**追加**而非覆盖：缺了本组件类名，弹层层级修正会失效
        const bizOverlayClass = node.props?.overlayClassName as string | string[] | undefined;
        const injected: Record<string, unknown> = {
          // 只追加「记账 / 锁面板」这层副作用，**不转发业务回调**：
          // cloneVNode 内部的 mergeProps 会把业务原有的同源监听器并成数组
          // [业务回调, 本注入函数]，两者都会被执行；这里再手动转发一次，
          // 业务回调整行就会被调两次（已实测复现）。
          // 顺序由 mergeProps 保证：业务回调在前，先跑完再记账/收面板。
          onVisibleChange: (visible: boolean) => handlePopupVisibleChange(itemKey, visible),
          // 弹层被外部卸载时不会补发关闭事件（行回收、折叠项增删、父级改数据），
          // 卸载钩子是唯一可靠的对账口；少了它账本会残留、该行操作列从此收不起面板。
          // Vue 的 unmount() 会调用 vnode props 上的此钩子。
          onVnodeBeforeUnmount: () => {
            openPopups.delete(itemKey);
            flushPendingClose();
          },
          // 多来源合并时 mergeProps 会把类名合成数组；统一铺平后过滤空值再拼接
          overlayClassName: [
            ...(Array.isArray(bizOverlayClass) ? bizOverlayClass : [bizOverlayClass]),
            'grid-action__popup',
          ]
            .filter(Boolean)
            .join(' '),
        };
        // 非受控下拉点菜单项只改内部状态、不发 visibleChange（见 OVERLAY_CLICK_COMPONENTS），
        // 这里补一条「点了就收」的对账口；延后一帧，避免在同一个点击栈里卸载浮层与其触发节点
        if (OVERLAY_CLICK_COMPONENTS.has(node.type)) {
          injected.onOverlayClick = (payload?: MenuClickInfo | MouseEvent) => {
            // 载荷有两种形态：Menu 的 click 事件给的是 info 对象（{ key, keyPath, item, domEvent }），
            // 非菜单形态的浮层给的是原生事件。只取原生事件来做「是否点在菜单项上」的判定，
            // 拿不到原生事件时按「菜单项被点」处理（否则这条通道等于失效，面板会被永久锁死）
            const domEvent =
              (payload as MenuClickInfo | undefined)?.domEvent ??
              (payload as MouseEvent | undefined);
            const target = domEvent?.target as HTMLElement | undefined;
            if (
              target &&
              typeof target.closest === 'function' &&
              !target.closest('.ant-dropdown-menu-item, .ant-menu-item')
            ) {
              // 点在浮层的内边距 / 空白处：不算交互结束，交给它自己的 visibleChange 收尾
              return;
            }
            nextTick(() => closePanelByPopup(itemKey));
          };
        }
        return cloneVNode(node, injected);
        // 不注入 getPopupContainer：弹层保持挂 body，定位参照视口，antd 的
        // autoAdjustOverflow 才能正确判断翻转；挂进面板项（约 160px 宽）会让它失准、
        // 弹层被视口裁切。「鼠标从面板移向弹层时面板被收起」由账本护栏挡住。
      };

      /**
       * 一个折叠项：项本身是点击壳（整行可点 + 悬停反白都由它承担），
       * 业务节点原样放在里面，不改它的结构。
       */
      const renderPanelItem = (nodes: VNode[], itemKey: string) =>
        h(
          'div',
          {
            key: itemKey,
            class: 'grid-action__item',
            role: 'menuitem',
            onClick: handleItemClick,
          },
          nodes.map((node, index) =>
            injectPopupBridge(node, nodes.length === 1 ? itemKey : `${itemKey}-${index}`),
          ),
        );

      // 自定义入口只取第一个节点：a-dropdown 只接受单个 trigger
      const customTrigger = filterVNodes(slots.more?.())[0];
      const moreIcon = h(SvgIcon, {
        icon: 'icon-YTmore',
        // 有文字时补间距；纯图标不加，避免入口整体右偏
        class: props.moreText ? 'grid-action__more-icon' : '',
      });
      const trigger =
        customTrigger ||
        h(
          'a',
          {
            class: 'grid-action__more',
            // 原 i18n：$t("common.more")（已核实），本仓库无 i18n 服务，硬编码中文
            title: '更多',
            // 无 href 的 <a> 默认不可聚焦，补 role/tabindex 让键盘可达
            role: 'button',
            tabindex: 0,
            'aria-haspopup': 'menu',
            'aria-expanded': String(panelState.visible),
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                // 与 mouseleave 同一收口：账本未清前不允许收起面板，否则弹层被连带卸载
                handlePanelVisibleChange(!panelState.visible);
              } else if (event.key === 'Escape') {
                handlePanelVisibleChange(false);
              }
            },
          },
          props.moreText ? [props.moreText, moreIcon] : [moreIcon],
        );

      const panelItems = panelNodes.map((node, index) => {
        // key 优先取业务 vnode 的 key，缺失时才退回下标。
        // 生效范围有限：**仅 v-for 场景有效** —— 手写的 <a> / <Popconfirm> 在模板编译后
        // node.key 恒为 null，一律退回下标；此时折叠项在中间增删（v-if 变化引起补位）会让
        // 后续下标整体前移，面板项被重建、其内部弹层实例随之丢失。
        // 该场景已知并接受，不在此处修（彻底修需给 vnode 打稳定指纹，成本高于收益）。
        const itemKey = node.key != null ? String(node.key) : String(index);
        return renderPanelItem([node], itemKey);
      });

      return h('div', { class: rootClass }, [
        ...inlineNodes,
        h(
          Dropdown,
          {
            trigger: ['hover'],
            // 受控：配合账本护栏，弹层未关前鼠标移出也不收起面板
            visible: panelState.visible,
            onVisibleChange: handlePanelVisibleChange,
          },
          {
            default: () => trigger,
            // 面板只有一层 div：定位 / 翻转 / 层级 / portal 由 a-dropdown 提供，
            // 不需要 Menu（selectable / openKeys / 子菜单 / 键盘导航在本件都用不到）
            overlay: () =>
              h(
                'div',
                {
                  class: 'grid-action__panel',
                  role: 'menu',
                  // 鼠标回到面板 ⇒ 撤销被挡下的收起（从弹层移回面板走这条路径）
                  onMouseenter: handlePanelMouseenter,
                },
                panelItems,
              ),
          },
        ),
      ]);
    };
  },
});
</script>

<style lang="less" scoped>
// 行内按钮容器：与 ActionBody 的 flex 布局保持一致（同类别组件，各管各的场景）
.grid-action {
  display: flex;
  align-items: center;
  gap: 8px;

  // 子节点是业务 vnode（带父组件 scopeId），scoped 会把 [data-v] 加到 `*` 上导致永不命中，
  // 必须用 :deep() 才能编译成 `.grid-action[data-v] > *`
  > :deep(*) {
    white-space: nowrap;
  }

  &--center {
    justify-content: center;
  }

  &--right {
    justify-content: flex-end;
  }
}

.grid-action__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  cursor: pointer;
  user-select: none;

  // 触发器补了 tabindex="0"，必须给可见焦点，仅键盘操作时才显示
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.grid-action__more-icon {
  margin-left: 4px;
}

// 面板：自绘一层 div，外观（底色/圆角/阴影/内边距）按项目 token 还原 antd 下拉菜单的观感
.grid-action__panel {
  min-width: 160px;
  // 项可能很多：给面板一个高度上限并滚动，避免超出视口
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px 0;
  background: var(--bg-color-white);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  // 菜单级文字规格（项内继承）：与 antd 下拉菜单一致
  font-size: 14px;
  line-height: 22px;
}

// 面板项：本节点就是点击壳（整行可点、悬停反白都在这里），业务节点原样放在里面。
// 底色 / 反白 / 链接色统一按「与行内 <a> 一致」的口径给出，不再依赖 antd 菜单项样式。
.grid-action__item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  color: var(--link-color);
  cursor: pointer;
  white-space: nowrap;

  // 行内 <a> 的链接色 / 下划线来自 `.vxe-cell a`（src/style/plugins/vxe-grid.less）；
  // 面板挂 body 后不再处于 .vxe-cell 内，两样都会丢，因此在这里按同一口径补齐。
  // 用后代选择器而非 `>`：业务可能再包一层 div，包装不该让样式失效。
  // color: inherit ⇒ 跟随本项颜色，悬停反白时一并变白。
  :deep(a) {
    color: inherit;
    text-decoration: underline;

    &.error-color {
      color: var(--error-color);
    }

    &.success-color {
      color: var(--success-color);
    }
  }

  // 面板里的按钮组件（a-button / RadiusButton 均渲染为 .ant-btn）统一按文本链接呈现：
  // 去掉按钮自身的高度/内边距/边框/底色/点击波纹，保留 :loading 等按钮能力。
  // 气泡/浮层是 body 级 DOM，不是本项的后代 ⇒ 其中的「确定/取消」不会被改样式。
  :deep(.ant-btn) {
    // 按纯文本还原：margin 去掉业务 `margin-left`（如 .email-link-btn 的 5px）、
    // font: inherit 修掉 <button> 的 UA 字体（Arial 13.33px）导致的字宽/行高差。
    // 注意不要再写 display/vertical-align：本节点是 flex 子项会被 blockify，写了也不生效
    margin: 0;
    height: auto;
    min-height: 0;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    font: inherit;
    // 与行内 <a> 对齐（text-decoration 会向下传递到内层 span，业务自带的下划线不会叠加）
    text-decoration: underline;

    &::after {
      display: none; // antd 点击波纹
    }

    // antd 给 `.ant-btn > span` 设了 display: inline-block，改回 inline 与 <a> 文本一致
    > span {
      display: inline;
      color: inherit;
    }

    // 文字色与同列 <a> 对齐，但**跳过语义色按钮**（type="danger" / error-color / warning-color），
    // 否则红色删除按钮折进面板会变成主色
    &:not(.ant-btn-dangerous):not(.error-color):not(.warning-color) {
      color: inherit;

      // 禁用态必须写在同一条 :not 链**内部**，否则会被上面的颜色规则压回去、又显示成可点态；
      // 语义色按钮的禁用态交给 antd 自己处理
      &:disabled,
      &[disabled],
      &.ant-btn-disabled {
        color: var(--disabled-color);
        cursor: not-allowed;
        text-decoration: none;
      }
    }

    // hover/focus 的盒模型复位对所有按钮生效（去掉 antd 的 hover 边框/底色/阴影）
    &:hover,
    &:focus,
    &:active {
      border: none;
      background: transparent;
      box-shadow: none;
    }
  }

  // 悬停反白放在**最后**：与上面的 `:deep(a.error-color)`、`a` 等规则特异性相同，
  // 靠书写顺序取胜，保证悬停时语义色链接与普通链接一起变白（与改造前 antd 全站口径一致）
  &:hover {
    background-color: var(--primary-color);
    color: var(--bg-color-white);

    // 禁用按钮不反白（其颜色规则特异性更高，这里只是把 <a> 与文本兜住）
    :deep(a) {
      color: var(--bg-color-white);
    }
  }
}
</style>

<style lang="less">
// 弹层挂 body 后与折叠面板成为兄弟层：popconfirm 默认 1030、antd 下拉 1050，
// 不抬高会遮住气泡里的「确定/取消」。取 1055（高于下拉、仍低于 Tooltip 1070），
// 不改任何 antd 默认层级值。作用域由组件自有类名收敛，不碰其它弹层。
.grid-action__popup {
  z-index: 1055;
}
</style>
