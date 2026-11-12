import { message } from 'ant-design-vue';
// 文档站约束：核心与附件插件静态引入。外部实现用动态 import 做按需加载，
// 在文档站会在路由切换时产生异步竞态（演示区偶发空白），本项目统一改为静态引入。
import { Boot, i18nChangeLanguage } from '@wangeditor/editor';
import attachmentPlugin from '@wangeditor/plugin-upload-attachment';

// ============ 语言 ============
// wangeditor 内置语言只有 zh-CN / en：中文系一律归 zh-CN，其余归 en
// 只在创建编辑器前执行一次（wangeditor 无语言响应式能力；运行期切语言需重新挂载）
// 本地解耦：外部读 Vuex store.state.lang.language（cookie 写入 key 为 "lang"，值形如 zh_CN / en_US），
// 改为最小 document.cookie 读取。外部兜底为 'en_US'（i18n 初始化 cookie.get('lang') || 'en_US'），
// 本仓库按中文环境约定兜底 'zh_CN'；判定逻辑（/^zh/i → zh-CN）与外部逐行一致。
const getLangCookie = () => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
};

export const initEditorI18n = () => {
  const language = getLangCookie() || 'zh_CN';
  i18nChangeLanguage(/^zh/i.test(language) ? 'zh-CN' : 'en');
};

// ============ 提示 ============
// wangeditor 自带 alert，统一改走 ant-design-vue 的 message
// （外部经 window.$message 由 main.js 挂载；本地 busi 约定直接 import { message }）
export const customAlert = (msg, type = 'info') => {
  const method = ['success', 'warning', 'error'].includes(type) ? type : 'info';
  message[method](msg);
};

// ============ 上传 ============
// 上传实现由宿主通过组件 customUpload prop 注入：(file, insertFn) => Promise，
// 图片与附件菜单共用同一实现；未注入时 editorConfig 不带 customUpload，对应菜单上传入口自然不可用。
// 外部内置 uploadByCustom（走 @custom/services 的 uploadFile + res.code == 200 判据、
// 失败只提示不抛出等约定）随之解耦移除——成功判据、错误提示、insertFn 回填契约由宿主实现负责。

// 图片菜单：insertFn(url, alt, href)
const createImageMenuConf = customUpload => ({ customUpload });

// 附件菜单：insertFn(fileName, link)
const createAttachmentMenuConf = customUpload => ({ customUpload });

// 附件菜单来自插件，必须在创建编辑器前注册，且全局只能注册一次
// （用模块级单例守卫：本模块只会被求值一次，比"数插件个数"可靠）
let attachmentPluginRegistered = false;
const registerAttachmentPlugin = () => {
  if (attachmentPluginRegistered) return;
  Boot.registerModule(attachmentPlugin);
  attachmentPluginRegistered = true;
};

// ============ 值归一（父级 value → 编辑器片段） ============
// 后端邮件正文常返回「整封 HTML 文档」（<!DOCTYPE html>…<head>…<body>…），而 wangeditor 只认「编辑器片段」：
// 它解析时只遍历顶层元素节点，顶层裸文本会被丢弃，<html>/<head>/<body> 标签本身也不被识别，
// 于是 <head> 的 <title> 与 <body> 内容会被拍平成兄弟节点 ⇒ 直接塞进去只剩一串空段落。
// 归一规则：取 <body> 内容 → 连续的内联节点/文本按 <br> 分段包进 <p>，块级元素原样保留；
// 片段入参（不含 doctype/html/body/head）原样返回，幂等 ⇒ 调用方无需判断，后端返回值直接丢给 v-model。
// 已知限制：<head> 里的 <style> 不会进编辑器（wangeditor 不支持 style 标签，样式在邮件场景由后端模板承担）。
const DOC_BLOCK_RE =
  /^(P|DIV|H[1-6]|UL|OL|LI|TABLE|THEAD|TBODY|TFOOT|TR|TD|TH|BLOCKQUOTE|PRE|HR|IMG|SECTION|ARTICLE|FIGURE|HEADER|FOOTER|MAIN|NAV|ASIDE|CENTER|DL|DT|DD|ADDRESS)$/;
// 编辑器不认识的脚本/容器类节点：连内容一起丢（<style>/<script> 混进正文只会变成乱文本）
const DOC_DROP_RE = /^(SCRIPT|STYLE|LINK|META|TITLE|BASE|NOSCRIPT|IFRAME|OBJECT|EMBED)$/;
const HAS_DOC_TAG_RE = /<(?:!doctype|html|body|head)[\s>]/i;

export const normalizeEditorHtml = html => {
  if (!html || !HAS_DOC_TAG_RE.test(html)) return html || '';
  // 非浏览器环境（SSR / Node 侧单测）没有 DOMParser：原样返回，不让它成为阻塞点
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;
  if (!body) return html;

  const frag = doc.createDocumentFragment();
  let buffer = []; // 连续的内联节点/文本，攒够一段包一个 <p>
  const flush = () => {
    if (!buffer.length) return;
    const p = doc.createElement('p');
    buffer.forEach(node => p.appendChild(node));
    frag.appendChild(p);
    buffer = [];
  };

  Array.from(body.childNodes).forEach(node => {
    if (node.nodeType === 1) {
      const tag = node.tagName;
      if (DOC_DROP_RE.test(tag)) return;
      if (tag === 'BR') {
        // <br> 视为分段；段首的 <br>（连续空行）用一个空段落占位
        buffer.length ? flush() : frag.appendChild(doc.createElement('p'));
        return;
      }
      if (DOC_BLOCK_RE.test(tag)) {
        flush();
        frag.appendChild(node);
        return;
      }
    } else if (node.nodeType === 3 && !/[^\s\u00a0]/.test(node.nodeValue || '')) {
      return; // 纯空白文本节点不搬，否则会凭空多出空段落
    }
    buffer.push(node);
  });
  flush();

  const wrapper = doc.createElement('div');
  wrapper.appendChild(frag);
  return wrapper.innerHTML;
};

// ============ 编辑器配置（wangeditor createEditor 的 config） ============
// 只保留真正被菜单用到的项：图片上传按 hasImage 挂、附件上传按 hasUpload 挂（均需宿主注入 customUpload）；
// hoverbar 的「下载附件」只在有附件节点时才有意义，跟着 hasUpload 走
export const createEditorConfig = ({ hasImage, hasUpload, customUpload }) => {
  initEditorI18n();
  if (hasUpload) registerAttachmentPlugin();

  const MENU_CONF = {};
  if (hasImage && customUpload) MENU_CONF.uploadImage = createImageMenuConf(customUpload);
  if (hasUpload && customUpload)
    MENU_CONF.uploadAttachment = createAttachmentMenuConf(customUpload);

  return {
    MENU_CONF,
    ...(hasUpload ? { hoverbarKeys: { attachment: { menuKeys: ['downloadAttachment'] } } } : {}),
    // wangeditor 默认 autoFocus: true —— 创建即抢焦点：一页多实例（cmrPrint 收件人列表）会互相抢，
    // 只读展示（disabled）也会把焦点吸到不可编辑区域。统一关掉，点击时照常聚焦
    autoFocus: false,
    customAlert,
  };
};
