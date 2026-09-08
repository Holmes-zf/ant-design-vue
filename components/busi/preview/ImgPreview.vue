<template>
  <div class="img-wrap">
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
    <div class="img-body">
      <a-spin :spinning="state.loading" class="img-spin">
        <a-image
          v-if="!!state.src"
          :src="state.src"
          :preview="false"
          class="img-preview"
          @click="() => methods.previewImage(state.src)"
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
import { api as viewerApi } from 'v-viewer';
import { Empty, message } from 'ant-design-vue';
import { reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import 'viewerjs/dist/viewer.css';
import PreviewHeader from './internal/PreviewHeader.vue';
import { usePreviewDownload } from './internal/previewHooks';
import { downloadBlobFile } from './internal/fileService';

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

const PRINT_MIME_TYPE = 'image/jpeg';

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，避免不支持打印的格式出现死按钮
const SUPPORTED_TOOLS = ['print', 'download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { isUrl, autoDownload, printSource } = usePreviewDownload(props);

// 释放 blob URL，避免反复开关预览泄漏
const revokeBlobUrl = () => {
  if (typeof state.src === 'string' && state.src.startsWith('blob:')) {
    window.URL.revokeObjectURL(state.src);
  }
};

// 图片尺寸自适应宽高，如果尺寸宽度大于容器宽度，则高度自适应容器宽度，反之亦然
const methods = {
  async init() {
    if (!props.source) {
      return message.warning('未找到文件');
    }
    revokeBlobUrl();
    // 校验资源类型
    if (isUrl(props.source)) {
      state.src = props.source;
      return;
    }
    state.loading = true;
    try {
      if (props.source instanceof Blob) {
        state.src = window.URL.createObjectURL(props.source);
        return;
      }
      const blob = await downloadBlobFile({ fileName: props.source });
      state.src = window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('图片加载失败:', error);
      message.error('加载失败，请稍后重试');
    } finally {
      state.loading = false;
    }
  },
  previewImage(source) {
    nextTick(() => {
      if (!source) {
        return;
      }
      if (Array.isArray(source)) {
        viewerApi({ images: source });
      } else {
        viewerApi({ images: [source] });
      }
    });
  },
  // 打印：组件侧固定 mimeType（图片），转调共享 printSource
  print() {
    printSource(PRINT_MIME_TYPE);
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
onUnmounted(() => {
  revokeBlobUrl();
});
</script>

<style lang="less" scoped>
.img-wrap {
  width: 100%;
  height: 100%;
  .img-body {
    display: flex;
    justify-content: center;
    text-align: center;
    height: calc(100% - 41px);
    overflow-x: hidden;
    .img-spin {
      width: 100%;
      height: 100%;
      :deep(.ant-spin-nested-loading),
      :deep(.ant-spin-container) {
        height: 100%;
      }
    }
    :deep(.ant-image) {
      width: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      vertical-align: middle;
      img {
        max-width: 100%;
        max-height: 100%;
        transform: scale3d(1, 1, 1);
      }
    }
    :deep(.ant-image-img) {
      width: unset;
    }
    .img-preview {
      object-fit: contain;
      cursor: pointer;
    }
  }
}
</style>
