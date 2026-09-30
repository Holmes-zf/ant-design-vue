/**
 * 中英双语显示格式表（复刻自外部系统 `/@/utils/dayjs/format.js`）
 *
 * `correct` 是值通道的标准格式全集（value 恒以这些格式写入/回传），
 * `zh` / `en` 是对应 key 的显示格式（仅影响输入框回显）。
 */
export default {
  zh: {
    md: 'MM-DD',
    ym: 'YYYY-MM',
    ymd: 'YYYY-MM-DD',
    ymdh: 'YYYY-MM-DD HH',
    ymdhm: 'YYYY-MM-DD HH:mm',
    ymdhms: 'YYYY-MM-DD HH:mm:ss',
  },
  en: {
    md: 'MM-DD',
    ym: 'YYYY-MM',
    ymd: 'MM-DD-YYYY',
    ymdh: 'HH MM-DD-YYYY',
    ymdhm: 'HH:mm MM-DD-YYYY',
    ymdhms: 'HH:mm:ss MM-DD-YYYY',
  },
  correct: {
    md: 'MM-DD',
    ym: 'YYYY-MM',
    ymd: 'YYYY-MM-DD',
    ymdh: 'YYYY-MM-DD HH',
    ymdhm: 'YYYY-MM-DD HH:mm',
    ymdhms: 'YYYY-MM-DD HH:mm:ss',
  },
};
