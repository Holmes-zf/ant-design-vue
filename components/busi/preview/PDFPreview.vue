<template>
  <div class="pdf-wrap">
    <PreviewHeader
      :info="props.info"
      :tools="headerTools"
      @print="methods.print"
      @download="methods.autoDownload"
    >
      <template #fileTitle>
        <slot name="fileTitle"></slot>
      </template>
    </PreviewHeader>
    <div class="pdf-body">
      <a-spin :spinning="state.loading" class="pdf-spin">
        <VueOfficePdf
          v-if="!!state.src"
          ref="pdfRef"
          :src="state.src"
          class="pdf-office"
          @rendered="renderedHandler"
        />

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
import VueOfficePdf from '@vue-office/pdf';
import { ref, reactive, computed, watch, onMounted } from 'vue';
import PreviewHeader from './internal/PreviewHeader.vue';
import { usePreviewDownload } from './internal/previewHooks';
import { downloadBlobFile } from './internal/fileService';

const pdfRef = ref(null);
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
  percentage: {
    type: Number,
    default: 0,
  },
});

// 弹窗属性
const state = reactive({
  src: '',
  loading: false,
});

const PRINT_MIME_TYPE = 'application/pdf';

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，避免不支持打印的格式出现死按钮
const SUPPORTED_TOOLS = ['print', 'download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { isUrl, autoDownload, printSource } = usePreviewDownload(props);

const isFirst = ref(true);
const renderedHandler = () => {
  if (isFirst.value) {
    const pdfScopeHeight = pdfRef.value.containerRef.clientHeight;
    const pdfHeight = pdfRef.value.containerRef.children[0].offsetHeight;
    const targetScrollTop = pdfHeight * props.percentage;
    pdfRef.value.containerRef.scrollTop = targetScrollTop;

    isFirst.value = false;
  }
};

const methods = {
  async init() {
    if (!props.source) {
      return message.warning('未找到文件');
    }
    // 校验资源类型
    if (isUrl(props.source)) {
      state.src = props.source;
      return;
    }
    state.loading = true;
    try {
      if (props.source instanceof Blob) {
        state.src = await props.source.arrayBuffer();
        return;
      }
      const blob = await downloadBlobFile({
        fileName: props.source,
      });
      // 数据异常不处理
      if (blob?.type === undefined || blob?.type === 'application/json') {
        state.src = '';
        return;
      }
      state.src = await blob.arrayBuffer();
    } catch (error) {
      console.error('PDF 加载失败:', error);
      message.error('加载失败，请稍后重试');
    } finally {
      state.loading = false;
    }
  },
  // 打印：组件侧固定 mimeType（PDF），转调共享 printSource
  print() {
    printSource(PRINT_MIME_TYPE);
  },
  autoDownload,
};
onMounted(() => {
  methods.init();
});
// source 变化时重新加载（单独使用时切换预览源），并重置滚动定位标记
watch(
  () => props.source,
  () => {
    isFirst.value = true;
    methods.init();
  },
);
</script>

<style lang="less" scoped>
.pdf-wrap {
  width: 100%;
  height: 100%;
  .pdf-body {
    height: calc(100% - 41px);
    overflow-x: hidden;
    .pdf-spin {
      height: 100%;
      :deep(.ant-spin-nested-loading),
      :deep(.ant-spin-container) {
        height: 100%;
      }
    }
    .pdf-office {
      height: 100%;
    }
  }
}
</style>
