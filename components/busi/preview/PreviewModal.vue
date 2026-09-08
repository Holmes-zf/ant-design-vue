<!-- 通用多格式预览弹框组件 -->
<template>
  <a-modal
    title="预览"
    width="80vw"
    :mask-closable="false"
    v-bind="$attrs"
    class="preview-modal"
    @cancel="methods.close"
  >
    <a-spin :spinning="state.loading">
      <div class="preview-modal-body">
        <template
          v-for="item in state.previewList"
          v-if="state.refresh && state.previewList.length"
          :key="item._uuid"
        >
          <div v-show="state.activeId === item._uuid" class="preview-item">
            <PDFPreview
              v-if="item.isInit && /(.)?(pdf)/.test(item.type && item.type.toLowerCase())"
              :info="item"
              :source="item.url || item.fileName || item.blob"
              :tools="props.tools"
              :percentage="props.percentage"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </PDFPreview>
            <ImgPreview
              v-else-if="/(.)?(png|jpg|jpeg)/.test(item.type && item.type.toLowerCase())"
              :info="item"
              :source="item.url || item.fileName || item.blob"
              :tools="props.tools"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </ImgPreview>
            <ExcelPreview
              v-else-if="
                item.isInit &&
                /(.)?(xls|xlsx|xlsm|xlsb|xla|xlw|csv)/.test(item.type && item.type.toLowerCase())
              "
              :info="item"
              :source="item.url || item.blob"
              :tools="props.tools"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </ExcelPreview>
            <WordPreview
              v-else-if="/(.)?(doc|docx)/.test(item.type && item.type.toLowerCase())"
              :info="item"
              :source="item.url || item.fileName || item.blob"
              :tools="props.tools"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </WordPreview>
            <TextPreview
              v-else-if="
                /(.)?(txt|lrc|md|json|yaml|yml|xml|js|ts|tsx|vue|html|css|py|go|rs|sql|sh)/.test(
                  item.type && item.type.toLowerCase(),
                )
              "
              :info="item"
              :source="item.url || item.fileName || item.blob"
              :tools="props.tools"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </TextPreview>
            <EmptyPreview
              v-else
              :info="item"
              :source="item.url || item.fileName || item.blob"
              :tools="props.tools"
            >
              <template v-if="$slots.fileTitle" #fileTitle>
                <slot name="fileTitle" :item="item"></slot>
              </template>
            </EmptyPreview>
          </div>
        </template>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
      <slot></slot>
    </a-spin>
    <template #footer>
      <slot name="footer">
        <a-space :size="16">
          <template v-if="state.previewList.length > 1">
            <RadiusButton type="primary" @click="methods.handlePage('prev')">上一份</RadiusButton>
            <RadiusButton type="primary" @click="methods.handlePage('next')">下一份</RadiusButton>
          </template>
          <slot name="footerExt" :preview-state="state"></slot>
        </a-space>
      </slot>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { Empty, message } from 'ant-design-vue';
import { debounce, uniqueId, isEqual } from 'lodash-es';
import { reactive, nextTick, onMounted, onUnmounted, watch } from 'vue';
import RadiusButton from '../button/RadiusButton.vue';
import PDFPreview from './PDFPreview.vue';
import ImgPreview from './ImgPreview.vue';
import ExcelPreview from './ExcelPreview.vue';
import WordPreview from './WordPreview.vue';
import TextPreview from './TextPreview.vue';
import EmptyPreview from './EmptyPreview.vue';

type PreviewItem = {
  name?: string;
  url?: string;
  type: string;
  fileName?: string; // 用于后续扩展兼容系统文件流预览
  blob?: Blob; // 调用方已持有的文档流，url/fileName 均未传时使用
  renameFile?: string; // 文件修改名，用于显示和下载的名字，配了则会根据别名下载
  // 预览项为开放结构，允许调用方携带扩展字段（如 storagePlatformType）
  [key: string]: any;
};
type PreviewStateItem = PreviewItem & { _uuid: string; isInit: boolean };

const props = defineProps({
  previewList: {
    type: Array,
    default: () => [],
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

const state = reactive({
  refresh: true,
  loading: false,
  activeId: undefined as string | undefined,
  previewList: [] as PreviewStateItem[],
});

const $emit = defineEmits(['update:visible', 'closeCallback']);

const methods = {
  // 数据初始化
  init() {
    state.previewList = props.previewList.map((item: PreviewItem, index: number) => {
      const _uuid = uniqueId('preview-');
      if (index === 0) {
        state.activeId = _uuid || '';
      }
      return {
        ...item,
        _uuid,
        isInit: index === 0,
      };
    });
  },
  // 上一份 下一份
  handlePage(type: string) {
    let index = state.previewList.findIndex(item => {
      return state.activeId === item._uuid;
    });
    if (type === 'prev') {
      index > 0 ? index-- : message.warning('已经是第一份了');
    }
    if (type === 'next') {
      index < state.previewList.length - 1 ? index++ : message.warning('已经是最后一份了');
    }
    state.activeId = state.previewList[index]?._uuid;
    state.previewList[index].isInit = true;
  },
  // 关闭
  close() {
    $emit('update:visible', false);
    $emit('closeCallback');
  },
  refresh: debounce(() => {
    state.refresh = false;
    nextTick(() => {
      state.refresh = true;
    });
  }, 1000),
};

onMounted(() => {
  methods.init();
  window.addEventListener('resize', methods.refresh);
});
onUnmounted(() => {
  window.removeEventListener('resize', methods.refresh);
});
watch(
  () => props.previewList,
  (newVal, oldVal) => {
    if (!isEqual(newVal, oldVal)) {
      methods.init();
    }
  },
);

defineExpose({
  state,
  handlePage: methods.handlePage,
});
</script>

<style lang="less">
.ant-modal {
  &.preview-modal {
    top: 0;
    padding-bottom: 0;

    .ant-modal-content {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .ant-modal-header {
      flex-shrink: 0;
      padding: 10px;
    }
    .ant-modal-close-x {
      height: 43px;
      line-height: 43px;
    }
    .ant-modal-body {
      flex: 1;
      min-height: 0;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .ant-spin-nested-loading {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        .ant-spin-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
      }
      .preview-modal-body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        .preview-item {
          width: 100%;
          height: 100%;
        }
      }
    }
    .ant-modal-footer {
      flex-shrink: 0;
    }
  }
}
</style>
