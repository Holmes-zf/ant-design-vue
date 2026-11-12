<!--
  FormFileItem —— 上传列表里的单个文件行：[类型图标] [文件名] [工具图标…]

  契约（改之前先读完这 4 条）：
  1. **`tools` 既是"有哪些工具"也是"渲染顺序"**：取值 `delete` / `download` / `preview`，
     默认 **`["delete","download"]`** —— 与父件 `FormUpload` 的默认**完全一致**（三件统一：
     默认只有"删除 + 下载"）；**要预览就在使用处自己写** `tools: ['delete','download','preview']`（数组顺序即图标顺序）。
     与 `Preview/PreviewModal` 的 `tools` **同名同义** —— 统一用 `tools`，不要再造 `actions` / `showXxx` 布尔。
  2. **下载只有一个出口**：父级给 `onCustomDownloads` 回调就由父级接管，没给则组件自己 `autoDownload`。
  3. **预览只负责把文件信息交全**：`url`（对象存储）/ `fileName` + `storagePlatformType`（文件流存储）
     必须一并交给 `PreviewModal` —— 少一个就会出现"弹窗打开了却提示无文件"。
  4. **根节点单根**（预览弹窗挂在根节点内，antd 自带 teleport 不影响行内布局），
     所以调用方的 `class` / `style` 能正常继承，不需要手工接 `$attrs`。
  复刻解耦点（相对外部 kats-tenement）：`@custom/render` 的 autoDownload → 本地 `./helper/download`；
  PreviewModal / SvgIcon → 本地相对路径导入。
-->
<template>
  <div :class="className" :title="displayName">
    <SvgIcon class="form-file-item__icon" :icon="icon" :size="16" />
    <span class="form-file-item__name">{{ displayName }}</span>
    <SvgIcon
      v-for="tool in toolList"
      :key="tool"
      class="form-file-item__tool"
      :icon="TOOL_ICONS[tool]"
      :size="16"
      @click="methods.handleTool(tool)"
    />
    <PreviewModal
      v-if="state.previewVisible"
      v-model:visible="state.previewVisible"
      :previewList="state.previewList"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { autoDownload } from './helper/download';
import SvgIcon from '../icon/SvgIcon.vue';
import PreviewModal from '../preview/PreviewModal.vue';

/** 文件条目（后端附件对象 + antd 上传对象混用，字段按需取） */
interface FileItem {
  name?: string;
  originalFileName?: string;
  fileName?: string;
  url?: string;
  fileId?: string | number;
  storagePlatformType?: string;
  [key: string]: any;
}

type FileTool = 'delete' | 'download' | 'preview';

/** 工具 → 图标（键集合同时是 `tools` 的白名单，未声明的值直接忽略） */
const TOOL_ICONS: Record<string, string> = {
  delete: 'icon-core-delete',
  download: 'icon-core-export',
  preview: 'icon-core-eyes',
};

/** 扩展名 → 类型图标。用映射表而不是拼正则：`.csv` / `.docx` 这类历史漏判都由此避免 */
const ICON_BY_EXT: Record<string, string> = {
  pdf: 'icon-core-pdf',
  ppt: 'icon-core-ppt',
  pptx: 'icon-core-ppt',
  pptm: 'icon-core-ppt',
  doc: 'icon-core-word',
  docx: 'icon-core-word',
  xls: 'icon-core-xls',
  xlsx: 'icon-core-xls',
  xlsm: 'icon-core-xls',
  xlsb: 'icon-core-xls',
  xla: 'icon-core-xls',
  xlw: 'icon-core-xls',
  csv: 'icon-core-xls',
  png: 'icon-core-png',
  jpg: 'icon-core-png',
  jpeg: 'icon-core-png',
};

interface Props {
  /** 文件对象（必传）：展示名按 `name → originalFileName → fileName` 取第一个有值的 */
  file: FileItem;
  /** "checked" 全库无语义分支，但 FormDatePicker / FormUTCDatePicker / FormSelectDefault 共用同一白名单，类型上暂留 */
  formType?: '' | 'fail' | 'checked';
  /** 工具集合 = 渲染顺序，默认 `["delete","download"]`（三件统一，要预览由使用处自己加） */
  tools?: FileTool[];
  /** 自定义下载：父级传入回调即由父级接管（不传则组件自己下载），无需再配一个布尔开关 */
  onCustomDownloads?: (file: FileItem) => void;
}

const props = withDefaults(defineProps<Props>(), {
  formType: '',
  tools: () => ['delete', 'download'],
  onCustomDownloads: undefined,
});

const emit = defineEmits<{ (e: 'delete', file: FileItem): void }>();

const state = reactive({
  previewVisible: false,
  previewList: [] as Record<string, any>[],
});

/** 展示名：`name`（上传归一 / 业务改造后的展示名）优先，回退原始文件名 */
const displayName = computed(
  () => props.file.name || props.file.originalFileName || props.file.fileName || '',
);

/** 取小写扩展名（不带点）；无扩展名返回空串 */
const getExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return index > -1 ? name.slice(index + 1).toLowerCase() : '';
};

const icon = computed(() => ICON_BY_EXT[getExtension(displayName.value)] || 'icon-core-other');

/** 只保留已声明顺序里的合法工具，重复项去掉（数组顺序即渲染顺序） */
const toolList = computed(() => {
  const list = Array.isArray(props.tools) ? props.tools : [];
  return [...new Set(list.filter(tool => tool in TOOL_ICONS))];
});

const className = computed(() => [
  'form-file-item',
  { 'fail-form-file-item': props.formType === 'fail' },
]);

const methods = {
  handleTool(tool: string) {
    if (tool === 'delete') return emit('delete', props.file);
    if (tool === 'download') return methods.download(props.file);
    if (tool === 'preview') return methods.preview(props.file);
  },
  // 自定义下载：父级给了回调就交出去，没给就自己下载（在使用处判类型，避免父级传进来的不是函数时炸）
  download(file: FileItem) {
    const onCustom = props.onCustomDownloads;
    typeof onCustom === 'function' ? onCustom(file) : autoDownload(file, undefined);
  },
  preview(file: FileItem) {
    // 预览源三形态（url / fileName / blob）里本组件能提供前两种，缺一个就会出现"无文件可预览"
    state.previewList = [
      {
        name: displayName.value,
        url: file.url,
        fileName: file.fileName,
        storagePlatformType: file.storagePlatformType,
        type: getExtension(displayName.value),
      },
    ];
    state.previewVisible = true;
  },
};
</script>

<style lang="less" scoped>
/* ↓ 与外部逐行一致（.form-file-item 整节），此处从外部 159-196 行原样复制 ↓ */
.form-file-item {
  display: flex;
  align-items: center;
  height: 32px;
  /* 垂直内边距归零：文件名行盒 22px（14px × 1.5715）在 32px 盒内天然居中 */
  padding: 0 15px 0 22px;
  margin-bottom: 16px;
  background: var(--file-item-bg);
  border-radius: var(--border-radius-base);

  &__icon {
    flex: none;
    margin-right: 10px;
  }

  &__name {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__tool {
    flex: none;
    margin-left: 15px;
    cursor: pointer;
  }

  &.fail-form-file-item {
    border: 1px solid var(--error-color);
    color: var(--error-color);
  }
}
</style>
