import { h } from 'vue';

/**
 * 面板内联图标
 *
 * 不引入任何第三方图标包：以 24×24 线性箭头为基准，stroke 取 currentColor，
 * 颜色完全跟随主题与激活态。
 */
const createLineIcon = (paths, defaultSize = 12) => {
  const Icon = (props = {}) =>
    h(
      'svg',
      {
        class: 'dc-panel-icon',
        viewBox: '0 0 24 24',
        width: props.size ?? defaultSize,
        height: props.size ?? defaultSize,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      paths.map(d => h('path', { d })),
    );
  Icon.props = { size: { type: [Number, String], default: defaultSize } };
  Icon.displayName = 'DcPanelIcon';
  return Icon;
};

/** ‹ 上一月 */
export const IconLeft = createLineIcon(['M15 18l-6-6 6-6']);

/** › 下一月 */
export const IconRight = createLineIcon(['M9 18l6-6-6-6']);

/** « 上一年 */
export const IconDoubleLeft = createLineIcon(['M11 17l-5-5 5-5', 'M18 17l-5-5 5-5']);

/** » 下一年 */
export const IconDoubleRight = createLineIcon(['M13 17l5-5-5-5', 'M6 17l5-5-5-5']);
