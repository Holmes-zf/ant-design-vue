import { message } from 'ant-design-vue';

// 文件下载/打印基建的最小替换实现（原系统走统一请求服务，这里仅保留预览家族用到的能力）。
// source 三形态：Blob（本地文件流）/ URL（外链直下）/ fileName（存储 key，这里按相对地址 fetch）。

type DownloadInfo = {
  fileName?: string;
  url?: string;
  originalFileName?: string;
  storagePlatformType?: string;
  type?: string;
};

export const isUrl = (url: string) => {
  return /^http(s)?:/.test(url);
};

const triggerDownload = (href: string, fileName: string) => {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = href;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  triggerDownload(url, fileName);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

// 按 fileName 拉取文件流
export async function downloadBlobFile({ fileName }: { fileName: string }): Promise<Blob> {
  const response = await fetch(fileName);
  if (!response.ok) {
    throw new Error(`文件下载失败: ${response.status}`);
  }
  return response.blob();
}

// doc → docx 的服务端转换无法复刻，最小替换为直接拉取原文件
export async function filePreview({
  fileUniqueKey,
}: {
  fileUniqueKey: string;
  originalFileName?: string;
}): Promise<Blob> {
  return downloadBlobFile({ fileName: fileUniqueKey });
}

// 下载：URL 直接触发 <a download>；fileName 先取回文件流再下载
export async function autoDownloadFile(info: DownloadInfo, options: { renameFile?: string } = {}) {
  const fileName = options.renameFile || info.originalFileName || '';
  if (info.url) {
    triggerDownload(info.url, fileName);
    return;
  }
  if (info.fileName) {
    const blob = await downloadBlobFile({ fileName: info.fileName });
    downloadBlob(blob, fileName);
  } else {
    message.warning('暂无可下载的文件');
  }
}

// 打印：URL/fileName 统一取回后在裸窗口展示（Blob 形态由预览器自行处理）
export async function printFile(info: DownloadInfo) {
  let url = info.url;
  if (!url && info.fileName) {
    const blob = await downloadBlobFile({ fileName: info.fileName });
    url = window.URL.createObjectURL(blob);
  }
  if (url) {
    window.open(url);
  } else {
    message.warning('暂无可打印的文件');
  }
}
