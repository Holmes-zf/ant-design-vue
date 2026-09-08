<template>
  <div class="word-wrap">
    <PreviewHeader :info="props.info" :tools="headerTools" @download="methods.autoDownload">
      <template #fileTitle>
        <slot name="fileTitle"></slot>
      </template>
    </PreviewHeader>
    <div class="word-body">
      <a-spin :spinning="state.loading" class="word-spin">
        <vue-office-docx v-if="!!state.src" :src="state.src" class="word-office" />
        <a-empty
          v-else
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          :description="`【${props.info?.type}】该类型文件暂不支持预览`"
        />
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { Empty, message } from 'ant-design-vue';
import { reactive, computed, watch, onMounted } from 'vue';
import PreviewHeader from './internal/PreviewHeader.vue';
import { usePreviewDownload } from './internal/previewHooks';
import { filePreview, downloadBlobFile } from './internal/fileService';
// 引入 VueOfficeDocx 组件
import VueOfficeDocx from '@vue-office/docx';
// 引入相关样式
import '@vue-office/docx/lib/index.css';

const emits = defineEmits(['closeCallback']);
const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  source: {
    type: [String, Blob],
    default: '',
  },
  tools: {
    type: Array,
    default: () => ['download'],
  },
});

// 弹窗属性
const state = reactive({
  src: '',
  loading: false,
});

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，doc/docx 不支持打印
const SUPPORTED_TOOLS = ['download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { isUrl, autoDownload } = usePreviewDownload(props);

const methods = {
  async init() {
    state.loading = true;
    try {
      // doc 格式由后端转换成 docx 后预览（本仓库最小替换为直接拉取原文件）
      if (props.info?.type === 'doc') {
        await methods.previewDoc();
        return;
      }
      await methods.previewDocx();
    } catch (error) {
      console.error('Word 加载失败:', error);
      message.error('加载失败，请稍后重试');
    } finally {
      state.loading = false;
    }
  },
  async previewDoc() {
    let fileName = props.source;
    // 校验资源类型
    if (isUrl(fileName)) {
      fileName = fileName.split('/').pop();
    }
    if (props.source instanceof Blob) {
      state.src = await props.source.arrayBuffer();
      return;
    }
    const blob = await filePreview({
      fileUniqueKey: fileName,
      originalFileName: props.info?.name,
    });
    state.src = await blob.arrayBuffer();
  },
  async previewDocx() {
    if (!props.source) {
      return message.warning('未找到文件');
    }
    // 校验资源类型
    if (isUrl(props.source)) {
      state.src = props.source;
      return;
    }
    if (props.source instanceof Blob) {
      state.src = await props.source.arrayBuffer();
      return;
    }
    const blob = await downloadBlobFile({ fileName: props.source });
    state.src = await blob.arrayBuffer();
  },
  autoDownload,
};

onMounted(() => {
  methods.init();
});
// source 变化时重新加载（单独使用时切换预览源）
watch(
  () => props.source,
  () => {
    methods.init();
  },
);
</script>

<style lang="less" scoped>
.word-wrap {
  width: 100%;
  height: 100%;
  .word-body {
    text-align: center;
    height: calc(100% - 41px);
    overflow-x: hidden;
    .word-spin {
      height: 100%;
      :deep(.ant-spin-nested-loading),
      :deep(.ant-spin-container) {
        height: 100%;
      }
    }
    .word-office {
      height: 100%;
    }
  }
}
</style>
