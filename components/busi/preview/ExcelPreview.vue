<template>
  <div class="excel-wrap">
    <PreviewHeader :info="props.info" :tools="headerTools" @download="methods.autoDownload">
      <template #fileTitle>
        <slot name="fileTitle"></slot>
      </template>
    </PreviewHeader>
    <div class="excel-body">
      <!-- excel 格式预览 -->
      <vue-office-excel
        v-if="!!props.source"
        :options="{ xls: true }"
        :src="state.src || props.source"
        class="excel-office"
      />
      <a-empty
        v-else
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="`【${props.info?.type}】该类型文件暂不支持预览`"
      />
    </div>
  </div>
</template>

<script setup>
import { Empty } from 'ant-design-vue';
import { reactive, computed, watch, onMounted } from 'vue';
// 引入 VueOfficeExcel 组件
import VueOfficeExcel from '@vue-office/excel';
// 引入相关样式
import '@vue-office/excel/lib/index.css';
import Papa from 'papaparse';
import excel from './internal/excel';
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

// 弹窗属性
const state = reactive({
  src: undefined,
});

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，excel/csv 不支持打印
const SUPPORTED_TOOLS = ['download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { autoDownload } = usePreviewDownload(props);

const methods = {
  init() {
    if (props.source instanceof Blob) {
      const isCsv = /(.)?csv/.test(props.info?.type && props.info?.type.toLowerCase());
      if (isCsv) {
        methods.papaCSVtoXLSX(props.source);
      } else {
        props.source.arrayBuffer().then(res => {
          state.src = res;
        });
      }
      return;
    }
    methods.initCsv();
  },
  autoDownload,
  initCsv() {
    const isCsv = /(.)?csv/.test(props.info?.type && props.info?.type.toLowerCase());
    if (isCsv) {
      fetch(props.source)
        .then(response => response.blob())
        .then(res => {
          methods.papaCSVtoXLSX(res);
        });
    }
  },
  // 第三方插件-转换csv文件流为xslx格式
  papaCSVtoXLSX(file) {
    // 使用 PapaParse 解析 CSV 文件
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        excel.jsonToExcelFile(result.data, props.info?.name).then(res => {
          state.src = res;
        });
      },
      error: error => {
        console.error('CSV解析错误:', error.message);
      },
    });
  },
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
.excel-wrap {
  width: 100%;
  height: 100%;
  .excel-body {
    text-align: center;
    height: calc(100% - 41px);
    overflow-x: hidden;
    .excel-office {
      height: 100%;
    }
  }
}
</style>
