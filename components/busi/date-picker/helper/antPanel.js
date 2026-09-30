import { computed } from 'vue';
import dayjsGenerateConfig from '../../../vc-picker/generate/dayjs';
import PickerPanel from '../../../vc-picker/PickerPanel';
import { useProvidePanel } from '../../../vc-picker/PanelContext';
import { RangeContextProvider } from '../../../vc-picker/RangeContext';
import { useLocaleReceiver } from '../../../locale-provider/LocaleReceiver';

/**
 * ant 底层面板适配层
 *
 * 作用：作为日期范围选择器的「日历 / 时间网格引擎」，复用 ant 的 6×7 网格、
 * 范围高亮、悬停预览、日期禁用与时间滚动列能力；面板结构、视觉与交互由本项目接管。
 *
 * 说明：引用了 ant-design-vue 的内部模块（非公开 API），目的是把版本耦合收敛到
 * 单一文件 —— ant 升级时只需修改这里，业务侧组件不受影响。
 * 外部系统经 `ant-design-vue/es/...` 引用，本仓库内改为相对源码路径（等价模块）。
 */

/** ant 面板类名前缀：用于复用 ant 既有的网格 / 单元格样式 */
export const PANEL_PREFIX_CLS = 'ant-picker';

/** ant 的 dayjs 适配器（PickerPanel 必填） */
export const generateConfig = dayjsGenerateConfig;

/**
 * 获取 ant 当前生效的日期面板语言包
 *
 * 跟随根节点 `<a-config-provider :locale>` 的全局语言配置，
 * 无需在组件内重复判断中英文；全局未配置时由 ant 内置默认语言包兜底。
 */
export const useAntPickerLocale = () => {
  const [locale] = useLocaleReceiver('DatePicker');
  return computed(() => locale.value?.lang);
};

export { PickerPanel, RangeContextProvider, useProvidePanel };
