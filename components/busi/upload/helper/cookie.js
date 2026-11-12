/**
 * 本地最小 cookie 读取实现 —— 替代外部 /@/utils/cookie（其封装 vue-cookie）。
 * 仅提供 FormUpload 构造上传请求头用到的 get(name)：解析 document.cookie。
 * 未找到同名 cookie 时返回 undefined（与 vue-cookie 口径一致，调用方 `|| "en_US"` 兜底不受影响）。
 */
const get = name => {
  const list = document.cookie ? document.cookie.split(';') : [];
  for (const item of list) {
    const arr = item.trim().split('=');
    if (arr[0] === name && arr.length > 1) {
      // 值本身可能含 '='（token 常见），重新拼回；decodeURIComponent 还原转义字符
      return decodeURIComponent(arr.slice(1).join('='));
    }
  }
  return undefined;
};

export default { get };
