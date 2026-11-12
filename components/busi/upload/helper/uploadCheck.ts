/**
 * Upload 家族（`FormUpload` / `ImportButton`）共用的文件校验纯函数 —— 无 Vue、无组件状态。
 *
 * 抽出的原因：同一套「扩展名归一 + 后缀匹配 + 大小比较」原先在两个组件里各写一份，
 * 历史事故（白名单写成 `".xls,.xlsx"` 时拼出 `/..xls$/`，5 个导入页把合法文件全部拒收）
 * 正是双份判定各自演进的结果 —— 一处修好、另一处继续错。此处为唯一事实源。
 *
 * 职责边界：只处理**扩展属性 `uploadType`** 的判定与大小判定。
 * `accept` 是 a-upload 的原生属性，组件侧不派生、不接管 —— 调用方想用就经 `$attrs` 自己传。
 *
 * 命名约定：对外只导出 `check*`（校验断言），组件内的方法名 (`matchUploadType` /
 * `isFileAcceptable`) 与之区分，导入时不需再起别名。
 *
 * 统一约定：
 * - 扩展名一律归一为「带点小写」（`.xls`）；`uploadType` 里写 `xls` 与 `.xls` 等价
 * - 判定用「取后缀 + includes」，不拼正则：避免 `.` 未转义导致 `.xpng` 也能过
 * - `maxSize` 单位为 **MB**
 */

export interface FileLike {
  name?: string;
  size?: number | string;
}

/** 取小写扩展名（带点）；无扩展名返回空串 */
const getExtension = (name?: string): string => {
  const text = String(name || '')
    .trim()
    .toLowerCase();
  const index = text.lastIndexOf('.');
  return index > -1 ? text.slice(index) : '';
};

/** 白名单归一为「带点小写」数组；空值 / 全空白返回 `[]`（语义 = 不校验格式） */
const normalizeUploadTypes = (uploadType?: string): string[] =>
  String(uploadType || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)
    .map(item => (item.startsWith('.') ? item : `.${item}`));

/** 格式是否放行；白名单为空视为不校验 */
export const checkUploadType = (file?: FileLike | null, uploadType?: string): boolean => {
  const allow = normalizeUploadTypes(uploadType);
  if (!allow.length) return true;
  const ext = getExtension(file?.name);
  return !!ext && allow.includes(ext);
};

/** 大小是否在限内（字面比较，不做 0 特判；`maxSize` 单位 MB） */
const isSizeWithin = (file?: FileLike | null, maxSize?: string | number): boolean =>
  Number(file?.size) <= Number(maxSize) * 1024 * 1024;

export interface UploadCheckOptions {
  /** 扩展名白名单，逗号分隔（`.xls` 与 `xls` 等价） */
  uploadType?: string;
  /** 单文件上限（MB） */
  maxSize?: string | number;
  /**
   * `maxSize` 为 0 / 负数 / 非数字时是否视为「不限大小」。
   * - 默认 `false`：按字面判定（`size <= 0` 通常拦下）—— `FormUpload` 的口径（其 `maxSize` 默认 `"10"`）
   * - `true`：0 即不校验 —— `ImportButton` 的口径（其 `maxSize` 默认 `0`）
   */
  zeroMeansUnlimited?: boolean;
}

/**
 * 单文件是否合规（格式 + 大小）。
 * 只回答"过不过"，**不负责提示**：调用方用 `checkFileAcceptable` 判整体、再用 `checkUploadType`
 * 细分原因（格式 / 大小）给 toast —— 两个组件保持同一套结构与文案口径。
 */
export const checkFileAcceptable = (
  file?: FileLike | null,
  options: UploadCheckOptions = {},
): boolean => {
  if (!checkUploadType(file, options.uploadType)) return false;
  const maxMB = Number(options.maxSize);
  if (options.zeroMeansUnlimited && !(maxMB > 0)) return true;
  return isSizeWithin(file, maxMB);
};
