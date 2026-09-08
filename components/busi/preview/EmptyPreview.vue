<template>
  <div class="word-wrap">
    <PreviewHeader :info="props.info" :tools="headerTools" @download="methods.autoDownload">
      <template #fileTitle>
        <slot name="fileTitle"></slot>
      </template>
    </PreviewHeader>
    <div class="word-body">
      <a-empty
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="`【${props.info?.type}】该类型文件暂不支持预览`"
      />
    </div>
  </div>
</template>

<script setup>
import { Empty } from 'ant-design-vue';
import { computed } from 'vue';
import PreviewHeader from './internal/PreviewHeader.vue';
import { usePreviewDownload } from './internal/previewHooks';

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

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，兜底态不支持打印
const SUPPORTED_TOOLS = ['download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { autoDownload } = usePreviewDownload(props);

const methods = {
  autoDownload,
};
</script>

<style lang="less" scoped>
.word-wrap {
  width: 100%;
  height: 100%;
  .word-body {
    text-align: center;
    height: calc(100% - 41px);
    overflow-x: hidden;
  }
}
</style>
