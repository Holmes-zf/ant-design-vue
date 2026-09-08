<!-- 预览家族共享头部：文件标题 + 打印/下载工具栏 -->
<template>
  <div class="preview-header">
    <slot name="fileTitle">
      <div class="preview-name ellipsis">
        {{ props.info?.renameFile || props.info?.name || '预览' }}
      </div>
    </slot>
    <div class="preview-tools">
      <a-space>
        <div v-if="props.tools.includes('print')" class="tool-print">
          <SvgIcon icon="icon-YTprint" size="18px" @click="emit('print')" />
        </div>
        <div v-if="props.tools.includes('download')" class="preview-item">
          <SvgIcon icon="icon-YTdownload" size="18px" @click="emit('download')" />
        </div>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '../../icon/SvgIcon.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  tools: {
    type: Array,
    default: () => ['download'],
  },
});

const emit = defineEmits(['print', 'download']);
</script>

<style lang="less" scoped>
.preview-header {
  display: flex;
  align-items: center;
  height: 40px;
  border-bottom: 1px solid #eee;
  .preview-name {
    flex: 1;
    font-size: 16px;
    font-weight: bold;
  }
  .preview-tools {
    display: flex;
    align-items: center;
    justify-content: right;
    height: 100%;
    flex: 1.5;
    font-size: 16px;
    font-weight: bold;
    .preview-item {
      width: 30px;
      cursor: pointer;
    }
    .tool-print {
      width: auto;
    }
  }
}
</style>
