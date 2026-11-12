<template>
  <div ref="rootRef" class="rich-text-editor" :class="{ 'is-disabled': props.disabled }">
    <!-- wangeditor 按需加载：核心与插件注册完成后才渲染，避免注册晚于编辑器创建 -->
    <template v-if="state.ready">
      <!-- 禁用态不渲染工具栏，仅作只读展示 -->
      <Toolbar
        v-if="!props.disabled"
        class="we-bar"
        :editor="editorRef"
        :mode="MODE"
        :defaultConfig="state.toolbarConfig"
      />
      <Editor
        class="we-container"
        :style="editorStyle"
        :defaultHtml="state.initHtml"
        :defaultConfig="state.editorConfig"
        :mode="MODE"
        @onCreated="methods.handleCreated"
        @onChange="methods.handleChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';
import '@wangeditor/editor/dist/css/style.css';
import { createEditorConfig, normalizeEditorHtml } from './hooks/useEditorConfig';

// 本地解耦：外部该工具来自 /@/utils/dispose/packaging，这里内联最小实现（语义逐行一致）
const toCssSize = (value: number | string | null | undefined, fallback: string) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return fallback;
  }
  if (typeof value === 'number') {
    // 数值通道语义 = 像素数；非有限数在 CSS 里没有对应的长度表达，
    // 透传只会往内联样式写一个必然失效的值 ⇒ 视同"给不出尺寸"
    return Number.isFinite(value) ? `${value}px` : fallback;
  }
  const num = Number(value);
  // 字符串通道：纯数字串按 px 补齐，其余视为 CSS 表达式原样透传
  return Number.isFinite(num) ? `${num}px` : value;
};

// 文档站约束：编辑器 / 工具栏静态引入。外部实现用 defineAsyncComponent 做运行时加载，
// 在文档站会在路由切换时产生异步竞态（演示区偶发空白），本项目统一改为静态引入。
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';

const MODE = 'default';

// 契约：value 是「编辑器片段」HTML，空内容统一表达为 ''（不是 '<p><br></p>' 占位段落）
interface Props {
  value?: string;
  /** 工具栏配置：创建期快照，创建后再改不生效 */
  toolbarConfig?: Record<string, any>;
  /** 编辑器配置：创建期快照；MENU_CONF 按 key 与内置项合并，不会整块顶掉上传配置 */
  editorConfig?: Record<string, any>;
  /** 图片上传的额外参数（hasImage 为 true 时生效；注入模式下由宿主在 customUpload 闭包内自行取用） */
  imgProps?: Record<string, any>;
  /** 附件上传的额外参数（hasUpload 为 true 时生效；注入模式下由宿主在 customUpload 闭包内自行取用） */
  fileProps?: Record<string, any>;
  /** 附件能力开关：工具栏出现「上传附件」菜单 */
  hasUpload?: boolean;
  /** 图片能力开关：工具栏出现「图片」菜单组 */
  hasImage?: boolean;
  /** 内容区高度：数字按 px，字符串带单位的原样透传 */
  height?: number | string;
  /** 只读展示：隐藏工具栏且不可编辑（只限制交互，值的写入/回写与正常态一致） */
  disabled?: boolean;
  /** 上传实现注入：(file, insertFn) => Promise，图片与附件菜单共用；未注入时不上传 */
  customUpload?: (file: File, insertFn: (...args: any[]) => void) => Promise<void>;
}
const props = withDefaults(defineProps<Props>(), {
  value: '',
  toolbarConfig: () => ({}),
  editorConfig: () => ({}),
  imgProps: () => ({}),
  fileProps: () => ({}),
  hasUpload: false,
  hasImage: false,
  height: 300,
  disabled: false,
  customUpload: undefined,
});

// 唯一的值出口：空内容一律上抛 ''，父级可直接把 v-model 挂在 required 规则上
const emits = defineEmits<{ (e: 'update:value', html: string): void }>();

const rootRef = ref<HTMLElement>();
// wangeditor 实例未导出完整类型、且 API 随版本变化，这里按 §2.2 例外保留 any
const editorRef = shallowRef<any>();
const state = reactive({
  ready: false,
  editorReady: false,
  // 创建编辑器用的初值：只在挂载时归一一次，之后不再随 props 变化重算
  // （不用 computed 绑到模板：否则用户每敲一个字都要重算一次，还会带着编辑器一起重渲染）
  initHtml: '',
  toolbarConfig: {} as Record<string, any>,
  editorConfig: {} as Record<string, any>,
});

// 本组件最近一次上抛的值：用来识别「回声」（父值变化其实是我自己刚发出去的），
// 让打字/回填后的回写直接短路，不重复归一、不重复序列化编辑器内容
let lastEmitted = '';

const editorStyle = computed(() => ({ height: toCssSize(props.height, '300px') }));

// 所有函数统一收在 methods 里（含内部工具），读代码只有一条路径；
// methods 在 setup 中只求值一次，放里放外没有性能差异
const methods = {
  // ---- 内部工具 ----
  // 工具栏裁剪 = 固定排除项 + 两个能力开关（数据驱动，不再往数组里塞 undefined）
  buildToolbarConfig() {
    return {
      ...(props.hasUpload ? { insertKeys: { index: 0, keys: ['uploadAttachment'] } } : {}),
      excludeKeys: [
        'group-video',
        'fullScreen',
        ...(props.hasImage ? [] : ['group-image']),
        ...(props.hasUpload ? [] : ['uploadAttachment']),
      ],
      ...props.toolbarConfig,
    };
  },
  // 父子之间唯一的比较基准：是否为空以库的 isEmpty() 为准（结构判据：只有一个空段落），
  // 不用 getText()——那会把「只有图片/表格/分隔线」的正文误判为空
  readValue(editor: any) {
    return editor.isEmpty() ? '' : editor.getHtml();
  },
  // wangeditor 的 setHtml 内部会 enable() + focus() 再恢复只读（dist 源码），会改写 activeElement：
  // 回填后把焦点还给用户原来所在的控件，异步回填不再抢焦点
  setEditorHtml(editor: any, html: string) {
    const prevActive = document.activeElement as HTMLElement | null;
    editor.setHtml(html);
    if (!prevActive || prevActive === document.body) return;
    if (rootRef.value?.contains(prevActive)) return; // 焦点本来就在编辑器内，交回编辑器收尾
    if (prevActive !== document.activeElement) prevActive.focus({ preventScroll: true });
  },
  // ---- wangeditor 回调 ----
  handleCreated(editor: any) {
    editorRef.value = editor;
    if (props.disabled) editor.disable();
    state.editorReady = true;
    // 创建后把父值收敛成编辑器可存形态（整封文档 → 片段、wangeditor 自身规范化）：
    // 契约是「组件里的值 = 使用方的值」，脏数据进来自动改规范，调用方拿到的一定是编辑器能存的东西。
    // 值本来就相同则不发，避免无意义回写。
    nextTick(() => {
      if (editor.isDestroyed) return; // 组件已在下一个 tick 前销毁，不再碰编辑器实例
      const current = methods.readValue(editor);
      if (current !== props.value) methods.emitValue(current);
    });
  },
  // 内容变化：归一到 '' 或编辑器 HTML
  // 不看 disabled：只读只是禁止用户手动操作，程序赋值与回写规则必须与正常态一致
  handleChange(editor: any) {
    if (!state.editorReady) return;
    methods.emitValue(methods.readValue(editor));
  },
  // 唯一上抛口：顺手记下最近一次发出的值，供 watch 识别回声
  emitValue(html: string) {
    lastEmitted = html;
    emits('update:value', html);
  },
};

// 外部值 → 编辑器（异步回填、表单重置、默认正文）
// 三层短路，保证「打字不产生额外开销」：
//   ① 回声：父值就是本组件刚发出去的 ⇒ 直接 return（用户每次按键都走这条，不做归一、不序列化编辑器）
//   ② 归一后与编辑器内容相同 ⇒ 不写编辑器（外部重复赋同值、空态来回切换）
//   ③ 只有真正的外部新值才归一（整封 HTML 文档 → 片段）并写入
watch(
  () => props.value,
  val => {
    const editor = editorRef.value;
    if (!editor) return; // 编辑器未创建：创建时由 defaultHtml 带入最新值
    if (val === lastEmitted) return;
    const html = normalizeEditorHtml(val);
    if (html === methods.readValue(editor)) return;
    methods.setEditorHtml(editor, html);
  },
);

// 动态切换禁用：disable/enable 就是 wangeditor 的 readOnly 开关，切换即时生效
watch(
  () => props.disabled,
  val => {
    const editor = editorRef.value;
    if (!editor) return;
    val ? editor.disable() : editor.enable();
  },
);

onMounted(async () => {
  state.toolbarConfig = methods.buildToolbarConfig();
  let editorConfig: Record<string, any> = {};
  try {
    // 语言与附件插件注册都必须早于编辑器创建（customUpload 一并传给工厂注入上传实现）
    editorConfig = await createEditorConfig(props);
  } catch (err) {
    // 插件/语言包加载失败不阻塞编辑：退化为纯文本能力，并明确提示（否则整块空白且无提示）
    message.error('加载失败，请稍后重试');
  }
  // 外部配置覆盖内置项；MENU_CONF 逐 key 合并，避免整块顶掉上传配置
  state.editorConfig = {
    ...editorConfig,
    ...props.editorConfig,
    MENU_CONF: {
      ...(editorConfig.MENU_CONF || {}),
      ...(props.editorConfig?.MENU_CONF || {}),
    },
  };
  // 初值只在创建前归一一次（整封文档 → 片段），之后的变化全部走 watch
  state.initHtml = normalizeEditorHtml(props.value);
  state.ready = true;
});

onBeforeUnmount(() => {
  editorRef.value?.destroy?.();
});

// 父级需要纯文本（如复制正文）时按需索取，不靠每键 emit 第二份状态
defineExpose({
  getText: (): string => editorRef.value?.getText?.() ?? '',
  getHtml: (): string => (editorRef.value ? methods.readValue(editorRef.value) : ''),
  focus: () => editorRef.value?.focus?.(),
  clear: () => editorRef.value?.clear?.(),
});
</script>

<style lang="less" scoped>
/* 注：--border-color-line / --disabled-bg-color 沿用外部主题变量，宿主主题需提供或在覆盖层自行定义 */
.rich-text-editor {
  .we-bar {
    border-bottom: 1px solid var(--border-color-line);
  }

  &.is-disabled .we-container {
    background-color: var(--disabled-bg-color);
    cursor: default;
  }
}
</style>
