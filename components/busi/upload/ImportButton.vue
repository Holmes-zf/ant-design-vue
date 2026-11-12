<!--
  导入触发件：只选文件、不真实上传（customRequest 拦掉上传）。改前必读：
  1. 一次拾取 = 一个批次：批内先逐文件 `selectFile(file)`，随后整批 `select(files)`；单文件即 `select([file])`。
     交付的 File 就是 antd 的对象（自带 `uid`，可作逐文件主键）。
  2. 批边界靠微任务收口（`Promise.resolve().then`）—— antd 对一批文件的 customRequest 全在同一微任务内同步调用。
     **不得**在 customRequest 里重挂/卸载 uploader：`isMounted` 守卫会吞掉同批剩余文件。
  3. `uploadType` 是格式唯一事实源（拾取后校验）；`accept` / `multiple` 属 a-upload 原生属性，模板给默认值 + `$attrs` 覆盖。
  4. 顺序：`beforeSelect` 业务闸门（falsy 即丢弃、组件不提示）→ 格式 / 大小（失败只提示、不发事件）。
  5. `#content` 整体替换默认按钮，此时 `minWidth` 不生效。
  复刻解耦点（相对外部 kats-tenement）：$t → 中文文案；window.$message → ant-design-vue 的 message；
  RadiusButton / SvgIcon → 本地相对路径导入。
-->
<template>
  <a-upload
    :multiple="true"
    :customRequest="methods.customRequest"
    :show-upload-list="false"
    v-bind="$attrs"
  >
    <!-- 触发元素：默认 RadiusButton，可用 #content slot 完全自定义形态 -->
    <slot name="content">
      <RadiusButton type="primary" ghost :minWidth="props.minWidth">
        <SvgIcon icon="icon-core-upload"></SvgIcon>
        <slot>导入数据</slot>
      </RadiusButton>
    </slot>
  </a-upload>
</template>

<script lang="ts">
// Vue 3.2 无 defineOptions：$attrs 已在模板里显式透传给 a-upload（disabled / accept 等），
// 必须同时关掉自动继承，否则同一份属性会再落到根元素上一次（同 FormRangePicker 的处理）
export default {
  name: 'ImportButton',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';
import { message } from 'ant-design-vue';
import RadiusButton from '../button/RadiusButton.vue';
import SvgIcon from '../icon/SvgIcon.vue';
import { checkFileAcceptable, checkUploadType } from './helper/uploadCheck';

const props = defineProps({
  /** 扩展名白名单，逗号分隔，如 "xls,xlsx,xlsm"（".xls" 同样认）；空串不校验 */
  uploadType: {
    type: String,
    default: '',
  },
  /** 默认按钮形态下触发按钮的最小宽度 */
  minWidth: {
    type: Number,
    default: 100,
  },
  /** 单文件大小上限（MB），不传或传 0 表示不校验（`FormUpload` 默认 `"10"`，本件为兼容历史保持 0） */
  maxSize: {
    type: [String, Number],
    default: 0,
  },
  /** 业务前置闸门：逐文件调用，返回 false 即丢弃（默认恒放行，调用处不必判空）。
   *  内部按 falsy 判定（对齐 `FormUpload` 的 `beforeUploadCb`）⇒ 回调请显式 return 布尔；
   *  被丢弃时组件不提示，提示由业务自己给。 */
  beforeSelect: {
    type: Function,
    default: () => true,
  },
});

const $emit = defineEmits<{
  (e: 'selectFile', file: unknown): void;
  (e: 'select', files: unknown[]): void;
}>();

/** 单文件上限（MB）：0 / 负数 / 非数字一律视为不校验（本组件口径，`FormUpload` 是按字面判定） */
const maxSizeMB = computed(() => Math.max(Number(props.maxSize) || 0, 0));

/** 本批待交付文件（微任务收口，一次性拾取 = 一个批次） */
let pending: File[] = [];
let scheduled = false;
let disposed = false;

const methods = {
  /**
   * 单文件是否合规（格式 + 大小）：判定口径统一在 `./helper/uploadCheck`。
   * 与 `FormUpload` 的唯一差异是 `maxSize` 为 0 时本组件视为"不限大小"（`zeroMeansUnlimited`）
   */
  isFileAcceptable(file: File) {
    return checkFileAcceptable(file, {
      uploadType: props.uploadType,
      maxSize: props.maxSize,
      zeroMeansUnlimited: true,
    });
  },

  /** 批尾统一派发：先逐文件 selectFile，再整批 select */
  flushBatch() {
    scheduled = false;
    if (disposed || !pending.length) return;
    const batch = pending;
    pending = [];
    batch.forEach(file => $emit('selectFile', file));
    $emit('select', batch);
  },

  /** 本批只排一次微任务；批内其余文件的 customRequest 都在同一微任务内同步到达 */
  scheduleBatch() {
    if (scheduled) return;
    scheduled = true;
    Promise.resolve().then(methods.flushBatch);
  },

  /** 自定义上传：只收集文件，不做真实上传 */
  customRequest(options: UploadRequestOption) {
    // 未配置 transformFile 时 antd 只会传 File（类型上还含 Blob | string）
    const file = options.file as File;
    // 1. 业务前置闸门优先：业务说了算（返回 false 静默丢弃，提示由业务负责）
    if (!props.beforeSelect(file)) {
      options.onError?.(new Error('rejected by beforeSelect'));
      return;
    }
    // 2. 内置格式 / 大小：先判整体合规，再细分原因给提示，最后拦下（与 FormUpload.beforeUpload 同结构）
    if (!methods.isFileAcceptable(file)) {
      if (!checkUploadType(file, props.uploadType)) {
        // 外部 $t("order.uploadAttachmentFormatTips")（待核对）→ 中文占位
        message.warning(`仅支持以下格式：${props.uploadType}`);
      } else {
        message.warning(`文件不可超过${maxSizeMB.value}MB`);
      }
      options.onError?.(new Error('invalid file'));
      return;
    }
    pending.push(file);
    options.onSuccess?.(undefined);
    methods.scheduleBatch();
  },
};

onBeforeUnmount(() => {
  disposed = true;
  pending = [];
});
</script>
