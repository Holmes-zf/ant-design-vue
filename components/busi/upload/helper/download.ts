/**
 * 本地最小下载实现 —— 内联自外部 kats-tenement `@custom/render/utils` 的 `autoDownload`。
 *
 * 外部完整实现的三条路径：
 * 1. url 为 http(s)：downFileByUrl（fetch 成 blob 后 a 标签下载）
 * 2. 有 fileName（文件流存储）：downloadBlobFile 走后端接口取流 + excel.downloadDataFlow
 * 3. 无文件：message 警告 + Promise.reject(false)
 *
 * 本仓库无后端文件流通道，路径 2 无法复刻 ⇒ 只保留纯前端最小必要实现：
 * 创建 a 标签下载 url / blob；文件流形态按外部"无文件"口径提示并 reject。
 * 组件（FormFileItem）调用方式与返回值口径（Promise.resolve / reject）与外部一致。
 */
import { message } from 'ant-design-vue';

/** 创建 a 标签触发下载 */
const triggerDownload = (href: string, name?: string) => {
  const a = document.createElement('a');
  a.href = href;
  a.download = name || 'downfile';
  a.click();
};

export const autoDownload = (file: any = {}, opts: any) => {
  const { renameFile } = opts || {};
  file = { ...file };
  const name = renameFile || file.name || file.originalFileName || file.fileName;

  // 1. 调用方已持有的 blob：objectURL + a 标签下载
  if (file.blob instanceof Blob) {
    const url = window.URL.createObjectURL(file.blob);
    triggerDownload(url, name);
    window.URL.revokeObjectURL(url);
    return Promise.resolve(true);
  }

  // 2. url（对象存储 / 任意 http 地址）：a 标签直接下载
  if (file.url && /^https?:\/\//.test(file.url)) {
    triggerDownload(file.url, name);
    return Promise.resolve(true);
  }

  // 3. 其余形态（fileName 文件流存储）需后端接口取流，本地无该通道：提示 + reject（同外部无文件口径）
  message.warning('无文件可下载');
  return Promise.reject(false);
};
