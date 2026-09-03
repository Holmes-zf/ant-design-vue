/**
 * vxe-table 全局注册插件（复刻自业务系统 src/plugins/vxe-table.js）
 *
 * 与原版差异（解耦说明）：
 * - 原 vue-i18n + cookie 取语言 → 内置 vxe 官方中文语言包（全中文场景）
 * - 样式：vxe-table 官方样式在本模块引入（vxe-table/lib/style.css），
 *   业务主题覆盖见 ./style/index.less（DcVxeGrid 内部引入）
 */
import 'vxe-table/lib/style.css';
import 'xe-utils';
import type { App } from 'vue';
import {
  // 核心
  VXETable,

  // 表格功能
  Header,
  Icon,
  Filter,
  Edit,
  Menu,
  Export,
  Keyboard,
  Validator,

  // 可选组件
  Column,
  Colgroup,
  Grid,
  Tooltip,
  Toolbar,
  Pager,
  Form,
  FormItem,
  FormGather,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  RadioButton,
  Switch,
  Input,
  Select,
  Optgroup,
  Option,
  Textarea,
  Button,
  Modal,
  List,
  Pulldown,

  // 表格
  Table,
} from 'vxe-table';
// import zhCN from 'vxe-table/lib/locale/lang/zh-CN';
import { VxeModuleCellArea } from './vxeCellArea';

// ---------- 内置国际化（vxe 默认内置即中文，无需额外配置；文档站暂不引入 vue-i18n，相关逻辑先注释） ----------
// const messages: Record<string, string> = { ...zhCN };
//
// const translate = (key: string, args?: any) => {
//   let msg = messages[key] ?? key;
//   if (args) {
//     // vxe 传 {0} {1} 占位符（字符串或数组）
//     const list = Array.isArray(args) ? args : [args];
//     list.forEach((arg: any, index: number) => {
//       msg = msg.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
//     });
//   }
//   return msg;
// };

// ---------- 全局默认参数（与业务系统保持一致） ----------
VXETable.setup({
  size: 'medium',
  version: 0,
  // zIndex: 1000,
  table: {
    // 自动监听父元素的变化去重新计算表格
    autoResize: true,
    resizeConfig: {
      refreshDelay: 0,
    },
  },
  grid: {
    formConfig: {
      vertical: true,
    },
  },
  input: {
    clearable: true,
  },
  // 对组件内置的提示语进行国际化翻译（vxe 默认内置中文，暂不配置；文档站未引入 vue-i18n，先注释）
  // i18n: (key, args) => translate(key, args),
});

let installed = false;

export function useTable(app: App) {
  if (installed) return app;
  installed = true;
  return app
    .use(Header)
    .use(Icon)
    .use(Filter)
    .use(Edit)
    .use(Menu)
    .use(Export)
    .use(Keyboard)
    .use(Validator)

    // 可选组件
    .use(Column)
    .use(Colgroup)
    .use(Grid)
    .use(Tooltip)
    .use(Toolbar)
    .use(Pager)
    .use(Form)
    .use(FormItem)
    .use(FormGather)
    .use(Checkbox)
    .use(CheckboxGroup)
    .use(Radio)
    .use(RadioGroup)
    .use(RadioButton)
    .use(Switch)
    .use(Input)
    .use(Select)
    .use(Optgroup)
    .use(Option)
    .use(Textarea)
    .use(Button)
    .use(Modal)
    .use(List)
    .use(Pulldown)
    // 区域选择与复制扩展（mouseConfig.area: true 时生效）
    .use(VxeModuleCellArea)
    // 安装表格
    .use(Table);
}
