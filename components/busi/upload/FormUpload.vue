<!--
  通用「上传区 + 文件列表」件（a-upload，list-type=text）。改前必读：
  1. `.form-upload` / `.form-upload-body` 是业务 `:deep()` 覆盖的锚点，不可改名。
  2. `multiple` 必须排在 `v-bind="$attrs"` 之前：默认多选，调用方可 `:multiple="false"` 覆盖。
  3. `maxCount === 1` 走 antd 替换式（只留最后一个），本组件不拦不提示；`> 1` 在 beforeUpload 前置拦截（不上传、不进列表），名额只算本批合规文件。
  4. 被拦截的文件不发 `finish`、不触发 `@beforeUpload`；`isListIgnore` 默认 true，被拦文件不进列表。
  5. 请求头（Token / lang / timezone）自建：上传走原生 XHR、不经 axios，每次 beforeUpload 刷新 token/lang。
  6. 字段口径：`uid` = 后端 `fileId`，`fileId` / `fileSize` 取后端同名字段，`size` 保持原值不转 number；回填只补缺失字段（`fillFileItem`），删除按对象引用匹配。
  7. 条目显示只走槽：`#fileItem` 换内容（容器与上传反馈由组件兜住）、`#itemRender` 整条接管。不透出 antd 的 `actions`，antd 列表项属性（`showRemoveIcon` 等）经 `$attrs` 传进来无效。
  8. 子件（FormFileItem）配置只经 `fileItemProps`：`{ tools, onCustomDownloads, ... }`。
  复刻解耦点（相对外部 kats-tenement）：/@/utils/cookie → 本地 ./helper/cookie.js；
  window.$message → ant-design-vue 的 message；$t → 中文文案；Vue API 显式 import。
-->
<template>
  <a-upload
    v-model:fileList="state.fileList"
    :headers="state.headers"
    class="form-upload"
    name="file"
    list-type="text"
    :multiple="true"
    v-bind="$attrs"
    :beforeUpload="methods.beforeUpload"
    @change="methods.onChange"
    :max-count="maxCount"
  >
    <div class="form-upload-body">
      <slot name="text">
        <p class="ant-upload-drag-icon">
          <SvgIcon icon="icon-core-upload" class="upload-icon"></SvgIcon>
          <span>{{ btnText || '导入数据（支持拖拽）' }}</span>
        </p>
      </slot>
      <slot name="tips">
        <div class="upload-tips">上传文件的大小不能超过{{ maxSize }}MB</div>
      </slot>
    </div>
    <template #itemRender="{ file, fileList }">
      <!--
        条目渲染口分两层（层级包含关系，不是并列机制）：
        · `#itemRender` = 整条接管（含容器与上传反馈），作用域同 a-upload 的 itemRender，额外给已组装好的 `fileProps`；
        · `#fileItem`   = 只换内容（容器与上传反馈由组件兜住，不会因为换内容而丢转圈）。
        都不传 = 默认渲染；只传内层 = 局部替换；两层关系由默认值串联，不传外层时内层照常生效。
      -->
      <slot
        name="itemRender"
        :file="file"
        :fileList="fileList"
        :fileProps="methods.getFileItemProps(file)"
      >
        <div class="file-items">
          <!-- 上传中的两个视觉位（外层画转圈、内层给内容加模糊）与"显示什么内容"无关，留在槽外 -->
          <a-spin class="file-spin" :spinning="file.status === 'uploading'" />
          <a-spin :spinning="file.status === 'uploading'">
            <template #indicator><span></span></template>
            <slot name="fileItem" :file="file" :fileProps="methods.getFileItemProps(file)">
              <FormFileItem v-bind="methods.getFileItemProps(file)"></FormFileItem>
            </slot>
          </a-spin>
        </div>
      </slot>
    </template>
  </a-upload>
</template>

<script lang="ts">
// Vue 3.2 无 `defineOptions`：`$attrs` 已在模板里经 `v-bind="$attrs"` 下行一次，
// 必须关掉自动继承，否则 Vue 会把整份 attrs 再合并一次 —— `class` 被重复拼一遍，
// 未声明事件（a-upload 的 @remove / @preview / @drop 等）会被 mergeProps 合成数组触发两次。
export default {
  name: 'FormUpload',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import type { PropType } from 'vue';
import { reactive, watch } from 'vue';
import { message, Upload } from 'ant-design-vue';
import cookie from './helper/cookie.js';
import SvgIcon from '../icon/SvgIcon.vue';
import FormFileItem from './FormFileItem.vue';
import { checkFileAcceptable, checkUploadType } from './helper/uploadCheck';

/** 列表条目（antd 的 file 对象 + 组件归一后的业务字段） */
interface UploadFileItem {
  uid?: string | number;
  name?: string;
  url?: string;
  status?: string;
  response?: any;
  check?: string;
  fileId?: string | number;
  fileName?: string;
  fileSize?: string | number;
  originalFileName?: string;
  size?: string | number;
  [key: string]: any;
}

const props = defineProps({
  maxSize: {
    type: [String, Number],
    default: '10',
  },
  maxCount: {
    type: Number,
    default: 10,
  },
  fileList: {
    type: Array as PropType<UploadFileItem[]>,
    default: () => [],
  },
  uploadType: {
    type: String,
    default: '', // png,jpg,pdf（历史写法 ".xls,.xlsx" 也认）
  },
  /**
   * 子组件（FormFileItem）的配置集中入口：`{ tools, onCustomDownloads, ... }`
   * 子件将来新增属性直接从这里透传，本组件签名不用再长一行 prop
   */
  fileItemProps: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  btnText: {
    // 上传按钮文字
    type: String,
    default: '',
  },
  // 业务前置闸门（与 ImportButton 同名同义）：返回 false 即拦截；排在格式/大小/数量校验之前，业务说了算
  beforeSelect: {
    type: Function,
    default: () => true,
  },
  isListIgnore: {
    // 校验不通过时是否返回 antd 的 LIST_IGNORE（true：文件不进列表、不触发 onChange）
    type: Boolean,
    default: true,
  },
});

const state = reactive({
  headers: {
    Token: cookie.get('tenant_token'),
    lang: cookie.get('lang') || 'en_US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  fileList: [] as UploadFileItem[],
});

const $emit = defineEmits<{
  (e: 'update:fileList', fileList: UploadFileItem[]): void;
  (e: 'success', data: unknown, extra: unknown): void;
  (e: 'delete', removed: unknown): void;
  (e: 'beforeUpload', file: unknown): void;
  (e: 'finish', fileList: UploadFileItem[]): void;
}>();

const methods = {
  /**
   * 子件（FormFileItem）配置的**唯一来源**：槽作用域的 `fileProps` 与默认渲染都用它。
   * `...itemProps` 放在最前：子件新增属性可经 `fileItemProps` 透传，不会被关键项顶掉（`file` / 事件不可覆盖）。
   */
  getFileItemProps(file: any) {
    const itemProps: Record<string, any> = props.fileItemProps || {};
    return {
      ...itemProps,
      file,
      formType: itemProps.formType ?? (file?.check === 'fail' ? 'fail' : ''),
      tools: itemProps.tools ?? ['delete', 'download'],
      onDelete: methods.delete,
    };
  },
  // 校验不通过：isListIgnore 时交给 antd 直接剔除（不进列表、不触发 onChange），否则仅拦截上传
  rejectFile() {
    return props.isListIgnore ? Upload.LIST_IGNORE : Promise.reject();
  },
  // 扩展名白名单：判定口径统一在 `./helper/uploadCheck`（与 ImportButton 同源，避免两份判定漂移）
  matchUploadType(file: any) {
    return checkUploadType(file, props.uploadType);
  },
  // 单文件是否合规（格式 + 大小）：本组件 `maxSize` 默认 `"10"`、0 按字面判定 ⇒ 不传 `zeroMeansUnlimited`
  isFileAcceptable(file: any) {
    return checkFileAcceptable(file, {
      uploadType: props.uploadType,
      maxSize: props.maxSize,
    });
  },
  /**
   * 数量上限判定（true = 超出）
   * - 名额 = `maxCount` − 现有条目数；本批里排在我前面且本身合规的文件先占名额（不合规的文件不占名额）。
   * - `maxCount === 1` 是替换式：不拦、不提示（同旧实现，交给 antd 的 `slice(-1)`）。
   */
  exceedMaxCount(file: any, batchFiles?: any[]) {
    const maxCount = Number(props.maxCount);
    if (!maxCount || maxCount === 1) return false;
    const occupied = state.fileList.filter(item => item.status !== 'error').length;
    const index = Array.isArray(batchFiles) ? batchFiles.indexOf(file) : 0;
    const passedBefore =
      index > 0
        ? batchFiles.slice(0, index).filter(item => methods.isFileAcceptable(item)).length
        : 0;
    return occupied + passedBefore >= maxCount;
  },
  // 上传拦截
  beforeUpload(file: any, batchFiles?: any[]) {
    // 请求头刷新：headers 在 setup 时快照过一次，token 续期/切换后会上传 401；上传前同步一次最新 cookie
    state.headers.Token = cookie.get('tenant_token');
    state.headers.lang = cookie.get('lang') || 'en_US';
    // 业务前置闸门（优先于内置校验）
    if (!props.beforeSelect(file)) {
      return methods.rejectFile();
    }
    // 上传格式 / 大小限制（先判整体合规，再细分原因给提示）
    if (!methods.isFileAcceptable(file)) {
      if (!methods.matchUploadType(file)) {
        // 外部 $t("order.uploadAttachmentFormatTips")（待核对）→ 中文占位
        message.warning(`仅支持以下格式：${props.uploadType}`);
      } else {
        message.warning('文件不可超过' + props.maxSize + 'MB');
      }
      return methods.rejectFile();
    }
    // 上传个数限制（`maxCount === 1` 是替换式：交给 antd 的 `slice(-1)`，不拦也不提示，同旧实现）
    if (methods.exceedMaxCount(file, batchFiles)) {
      // 外部 $t("maxCount")（待核对）→ 中文占位
      message.warning('最多上传');
      return methods.rejectFile();
    }

    $emit('beforeUpload', file);
    return Promise.resolve();
  },
  /**
   * 成功口径：`Number()` 归一后一条判据覆盖 true / 1 / "1" 三种形态。
   */
  isResultModel(response: any) {
    if (!response) return false;
    return Number(response.result) === 1;
  },
  /** 解析响应：兼容 `result:true + model` 与 `code:200 + data` 两种后端口径 */
  resolveModel(response: any) {
    if (!response) return { ok: false, data: null, message: '' };
    if (methods.isResultModel(response)) {
      return { ok: true, data: response.model, message: response.message || '' };
    }
    if (Number(response.code) === 200 && response.data) {
      return { ok: true, data: response.data, message: '' };
    }
    return { ok: false, data: null, message: response.message || '' };
  },
  /**
   * 响应 model → 列表条目：`uid` 仍取 `fileId`；`size` 保持旧口径（= `fileSize` 原值，不强行转 number）
   */
  normalizeFile(origin: any, data: any = {}) {
    return {
      uid: data.fileId || origin?.uid,
      name: data.originalFileName || data.fileName,
      size: data.fileSize,
      url: data.url,
      status: 'done',
      check: '',
      originalFileName: data.originalFileName,
      fileName: data.fileName,
      fileId: data.fileId,
      fileSize: data.fileSize,
    } as UploadFileItem;
  },
  /**
   * 回填兜底：只补缺失字段、就地补不换对象、不 emit 回父级、不补 `uid`
   */
  fillFileItem(item: any) {
    if (!item || typeof item !== 'object') return item;
    if (!item.name) item.name = item.originalFileName || item.fileName || '';
    if (item.fileSize == null) item.fileSize = item.size;
    if (item.size == null) item.size = item.fileSize;
    if (item.fileId == null && item.uid != null && item.status !== 'uploading') {
      item.fileId = item.uid;
    }
    return item;
  },
  // 上传成功：归一当前条目（按 uid 精确替换）
  handleUploaded(file: any, options: any) {
    const response = file?.response;
    const isResultModel = methods.isResultModel(response);
    const { ok, data, message: msg } = methods.resolveModel(response);

    if (!ok) {
      // 后端返回业务失败：只剔除当前条目（不"替换所有带 response 的条目"，避免吞掉同批仍在传输的文件）
      state.fileList = state.fileList.filter(item => item.uid !== file?.uid);
      $emit('update:fileList', state.fileList);
      message.warning(msg || '上传失败');
      $emit('finish', state.fileList);
      return;
    }

    // 兼容既有语义：data 为多元素数组且来自 code/data 口径时，只回传 success、不改列表
    if (!isResultModel && Array.isArray(data) && data.length > 1) {
      $emit('success', data, { options });
      message.success('上传成功！');
      $emit('finish', state.fileList);
      return;
    }

    const normalized = methods.normalizeFile(file, data || {});
    const next = [...state.fileList];
    const index = next.findIndex(item => item.uid === file?.uid);
    if (index > -1) {
      next[index] = normalized;
    } else {
      next.push(normalized);
    }
    state.fileList = next;
    $emit('update:fileList', next);
    $emit('success', data, { options });
    message.success((isResultModel && response.message) || '上传成功！');
    $emit('finish', next);
  },
  // 上传失败（网络 / 4xx / 5xx）：提示 + 剔条目 + 收尾，避免条目永久转圈
  handleUploadError(file: any) {
    const response = file?.response;
    const msg = response && (response.message || response.msg);
    message.warning(typeof msg === 'string' && msg ? msg : '上传失败');
    state.fileList = state.fileList.filter(item => item.uid !== file?.uid);
    $emit('update:fileList', state.fileList);
    $emit('finish', state.fileList);
  },
  // 上传文件
  onChange(options: any) {
    const file = options?.file;
    if (!file) return;

    if (file.status === 'done') {
      methods.handleUploaded(file, options);
      return;
    }
    if (file.status === 'error') {
      methods.handleUploadError(file);
      return;
    }
    if (file.status === undefined) {
      // beforeUpload 返回 false / reject 的文件：antd 仍会补发一次 change，此处把该条目剔除。
      // 刻意不发 finish —— 被拦截不代表"这批传完了"。
      state.fileList = state.fileList.filter(
        item => item.status === 'done' || item.uid !== file.uid,
      );
      $emit('update:fileList', state.fileList);
    }
  },
  delete(file: any) {
    let removed: any = {};
    // 引用身份优先，兜底按 后端 id → url → uid 分三轮找（不能写成一条 or：uid 撞车会抢先命中错的那条）
    let index = file ? state.fileList.indexOf(file) : -1;
    if (index < 0 && file) {
      if (file.fileId != null) {
        index = state.fileList.findIndex(item => item.fileId === file.fileId);
      }
      if (index < 0 && file.url) {
        index = state.fileList.findIndex(item => item.url === file.url);
      }
      if (index < 0 && file.uid != null) {
        index = state.fileList.findIndex(item => item.uid === file.uid);
      }
    }
    if (index > -1) {
      removed = state.fileList[index];
      const next = [...state.fileList];
      next.splice(index, 1);
      state.fileList = next;
    }
    $emit('update:fileList', state.fileList);
    $emit('delete', removed);
  },
};

watch(
  () => props.fileList,
  value => {
    // 兼容期保留深监听：存量调用点里存在"原地 push / 替换元素"的写法，浅监听会漏同步。
    state.fileList = (value || []).map(item => methods.fillFileItem(item));
  },
  { immediate: true, deep: true },
);
</script>

<style lang="less" scoped>
/* ↓ 与外部 FormUpload.vue 447-529 行逐行一致，写入时从外部原样复制（含全部注释） ↓ */
.form-upload {
  width: 100%;
  position: relative;

  :deep(.ant-upload.ant-upload-select.ant-upload-select-text) {
    display: block;
  }
  :deep(.ant-upload.ant-upload-disabled) {
    display: none;
  }

  &::before {
    display: table;
    content: '';
  }
  &::after {
    display: table;
    clear: both;
    content: '';
  }

  .form-upload-body {
    height: auto;
    border: 1px solid var(--border-color-line);
    border-radius: var(--border-radius-base);
    cursor: pointer;
    transition: border-color 0.3s;
    text-align: center;
    padding: 4px 0;

    &:hover,
    &:focus-within {
      border-color: var(--primary-color);
    }

    .ant-upload-drag-icon {
      color: var(--primary-color);
    }
    .upload-icon {
      margin-right: 6px;
      font-size: 14px;
    }
    .upload-tips {
      font-size: 12px;
      font-weight: 400;
      color: var(--upload-tip-color);
      line-height: 17px;
      margin-top: 11px;
    }
  }

  :deep(.ant-upload-list.ant-upload-list-text) {
    margin-top: 8px;
    .ant-upload-list-text-container {
      float: left;
      width: auto;
      min-width: 10.5%;
      max-width: 100%;
      margin-right: 2%;
      &::after {
        display: block;
        content: '';
        clear: both;
      }
    }
    .file-items {
      position: relative;
      .file-item {
        margin-bottom: 16px;
      }
      .file-spin {
        position: absolute;
        top: 6px;
        left: -3px;
      }
    }
  }
}
</style>
