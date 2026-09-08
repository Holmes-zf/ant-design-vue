import { message } from 'ant-design-vue';
import { utils, write } from 'xlsx';

// excel 工具的最小替换实现，仅保留预览家族用到的两个能力：
// 数据流下载（previewHooks）与 json → xlsx 转换（ExcelPreview 的 csv 预览）。

// 将 Blob/ArrayBuffer 数据流保存为本地文件
export function downloadDataFlow(data: Blob | ArrayBuffer, fileName: string) {
  if (!data) {
    message.warning('文件下载失败');
    return;
  }
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// 将 json 数据转为 xlsx File（csv 预览时先转换再交给渲染器）
export async function jsonToExcelFile(data: Record<string, any>[] = [], fileName = 'excel') {
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wpx: 165 }));
  utils.book_append_sheet(wb, ws, 'sheet1');
  const wbout = write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
  });
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i += 1) {
    view[i] = wbout.charCodeAt(i) & 0xff;
  }
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  return new File([blob], `${fileName}.xlsx`, {
    type: 'application/vnd.ms-excel',
  });
}

const excel = { downloadDataFlow, jsonToExcelFile };
export default excel;
