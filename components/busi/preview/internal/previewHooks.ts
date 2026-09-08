import { autoDownloadFile as downloadFile, printFile } from './fileService';
import { downloadDataFlow } from './excel';

type PreviewProps = {
  info?:
    | {
        name?: string;
        renameFile?: string;
        storagePlatformType?: string;
      }
    | undefined;
  source?: string | Blob;
};

// 预览家族共享下载/打印能力
// source 三形态：Blob（本地文件流）/ URL（外链直下）/ fileName（存储 key，走接口下载）
// 文件信息本就在 props.info / props.source 上，方法均无需外部传参
export const usePreviewDownload = (props: PreviewProps) => {
  const isUrl = (url: string) => {
    return /^http(s)?:/.test(url);
  };
  const autoDownload = () => {
    if (props.source instanceof Blob) {
      downloadDataFlow(props.source, props.info?.renameFile || props.info?.name);
      return;
    }
    // 校验资源类型
    if (isUrl(props.source as string)) {
      downloadFile(
        {
          ...props.info,
          url: props.source,
          originalFileName: props.info?.name,
        },
        { renameFile: props.info?.renameFile },
      );
      return;
    }
    downloadFile(
      {
        fileName: props.source,
        originalFileName: props.info?.name,
        storagePlatformType: props.info?.storagePlatformType,
      },
      { renameFile: props.info?.renameFile },
    );
  };
  // 打印（Blob 形态按 mimeType 包一层后在裸窗口展示）
  const printSource = (mimeType: string) => {
    const originalFileName = props.info?.name;
    if (props.source instanceof Blob) {
      // 本地打印：type 缺失时按 mimeType 包一层，与 fileName 分支语义对齐
      const blob = props.source.type ? props.source : new Blob([props.source], { type: mimeType });
      window.open(window.URL.createObjectURL(blob));
      return;
    }
    if (isUrl(props.source as string)) {
      printFile({ url: props.source, originalFileName, type: mimeType });
      return;
    }
    printFile({ fileName: props.source, originalFileName, type: mimeType });
  };
  return { isUrl, autoDownload, printSource };
};
