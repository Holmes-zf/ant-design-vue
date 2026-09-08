<template>
  <div class="text-wrap">
    <PreviewHeader :info="props.info" :tools="headerTools" @download="methods.autoDownload">
      <template #fileTitle>
        <slot name="fileTitle"></slot>
      </template>
    </PreviewHeader>
    <div class="text-body">
      <a-spin :spinning="state.loading">
        <div v-if="state.highlighted" class="text-content">
          <pre><code v-html="state.highlighted"></code></pre>
        </div>
        <a-empty
          v-else-if="!state.loading"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          :description="`【${props.info?.type}】该类型文件暂不支持预览`"
        />
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { Empty, message } from 'ant-design-vue';
import { reactive, computed, watch, onMounted } from 'vue';
import PreviewHeader from './internal/PreviewHeader.vue';
import { usePreviewDownload } from './internal/previewHooks';
import { downloadBlobFile } from './internal/fileService';

// 文本高亮降级阈值：超过后关闭高亮，纯转义渲染防 v-html 全量正则卡顿
const HIGHLIGHT_MAX_SIZE = 1024 * 1024;

const emits = defineEmits(['closeCallback']);
const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  source: {
    type: [String, Blob],
    default: '',
  },
  tools: {
    type: Array,
    default: () => ['download'],
  },
});

// 弹窗属性
const state = reactive({
  // 转义 + 高亮后的最终渲染串
  highlighted: '',
  loading: false,
});

// 头部工具能力声明：意图(外部 tools) ∩ 能力(当前格式可支持的)，文本类不支持打印
const SUPPORTED_TOOLS = ['download'];
const headerTools = computed(() => props.tools.filter(tool => SUPPORTED_TOOLS.includes(tool)));

const { isUrl, autoDownload } = usePreviewDownload(props);

// ===== 高亮策略（安全模型：先转义，再在【转义后文本】上正则标注，最后 v-html） =====

const escapeHtml = str => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 多条规则合并为单趟正则替换；规则顺序即优先级（先匹配者优先着色）
// 每条规则贡献一个捕获组，替换时按"第一个非空捕获组"定位 class
const highlightWithRules = (escaped, rules, flags = 'g') => {
  const classes = [];
  const sources = rules.map(([source, cls]) => {
    classes.push(cls);
    return `(${source})`;
  });
  const master = new RegExp(sources.join('|'), flags);
  return escaped.replace(master, (match, ...groups) => {
    const index = groups.findIndex(group => group !== undefined);
    return index === -1 ? match : `<span class="text-${classes[index]}">${match}</span>`;
  });
};

// c-like 语言关键字表（js/ts/tsx/py/go/rs/sql/sh）
const KEYWORD_MAP = {
  js: 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|import|export|from|default|try|catch|finally|throw|async|await|typeof|instanceof|delete|in|of|yield|static|void',
  ts: 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|import|export|from|default|try|catch|finally|throw|async|await|typeof|instanceof|delete|in|of|static|interface|type|enum|implements|namespace|declare|readonly|public|private|protected|abstract|as|is|keyof|never|unknown',
  py: 'def|return|if|elif|else|for|while|in|not|and|or|import|from|as|class|try|except|finally|raise|with|lambda|pass|break|continue|global|assert|yield|del|self|None|True|False',
  go: 'func|return|if|else|for|range|switch|case|default|break|continue|go|defer|select|chan|var|const|type|struct|interface|map|package|import|nil|true|false',
  rs: 'fn|let|mut|return|if|else|match|for|while|loop|in|struct|enum|impl|trait|pub|use|mod|crate|self|Self|where|async|await|move|dyn|ref|const|static|unsafe|type|true|false',
  sql: 'select|from|where|insert|into|values|update|set|delete|create|table|drop|alter|add|join|left|right|inner|outer|on|group|order|by|having|limit|offset|as|and|or|not|null|distinct|union|all|index|primary|key|foreign|references|default',
  sh: 'if|then|else|elif|fi|for|while|do|done|case|esac|function|return|export|local|echo|exit|source|set|unset|read|shift',
};

// 各扩展名的高亮规则（在转义后文本上匹配，引号均为 &quot;/&#039; 形态）
const getRules = ext => {
  if (ext === 'json') {
    return [
      [`&quot;.*?&quot;(?=\\s*:)`, 'key'],
      [`\\b(?:true|false|null)\\b`, 'keyword'],
      [`\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b`, 'number'],
      [`&quot;.*?&quot;`, 'string'],
    ];
  }
  if (ext === 'yaml' || ext === 'yml') {
    return [
      [`#[^\\n]*`, 'comment'],
      [`[\\w.-]+(?=\\s*:)`, 'key'],
      [`&quot;.*?&quot;|&#039;.*?&#039;`, 'string'],
      [`\\b(?:true|false|null|~)\\b|\\b\\d+(?:\\.\\d+)?\\b`, 'number'],
    ];
  }
  if (ext === 'css') {
    return [
      [`/\\*[\\s\\S]*?\\*/`, 'comment'],
      [`&quot;.*?&quot;|&#039;.*?&#039;`, 'string'],
      [`[\\w-]+(?=\\s*:)`, 'key'],
      [`#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\\b`, 'number'],
    ];
  }
  const keywords = KEYWORD_MAP[ext];
  if (keywords) {
    return [
      [`&quot;.*?&quot;|&#039;.*?&#039;`, 'string'],
      [`//[^\\n]*|/\\*[\\s\\S]*?\\*/`, 'comment'],
      [`\\b\\d+(?:\\.\\d+)?\\b`, 'number'],
      [`\\b(?:${keywords})\\b`, 'keyword'],
    ];
  }
  // txt/lrc/md 等纯转义
  return null;
};

const methods = {
  // 扩展名：优先 info.type，缺失时从文件名截取
  getExt() {
    const fromType = String(props.info?.type || '').toLowerCase();
    if (fromType) return fromType;
    const name = String(props.info?.renameFile || props.info?.name || '');
    const index = name.lastIndexOf('.');
    return index === -1 ? '' : name.slice(index + 1).toLowerCase();
  },
  // 格式化 XML 字符串（添加缩进）——仅 xml 使用
  formatXml(xml) {
    try {
      let formatted = '';
      let indent = '';
      const tab = '  '; // 2空格缩进
      xml.split(/>\s*</).forEach(node => {
        if (node.match(/^\/\w/)) {
          // 闭合标签，减少缩进
          indent = indent.substring(tab.length);
        }
        formatted += indent + '<' + node + '>\n';
        if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
          // 开始标签，增加缩进
          indent += tab;
        }
      });
      return formatted.substring(1, formatted.length - 2); // 移除首尾多余的 < >
    } catch (e) {
      return xml;
    }
  },
  // 标签类语法高亮（xml/html/vue 同源；内部先转义再标注）
  highlightMarkup(rawText) {
    const xml = escapeHtml(rawText);
    // 高亮单个标签（不包括注释、CDATA、声明）
    const highlightTag = tagContent => {
      let result = tagContent;
      // 提取标签名并高亮
      result = result.replace(/^(&lt;\/?)([\w][\w:-]*)/, '$1<span class="xml-tag-name">$2</span>');
      // 高亮属性：属性名="属性值" 或 属性名='属性值'
      result = result.replace(
        /\s([\w:-]+)(\s*=\s*)(&quot;[^&]*&quot;|&#039;[^&]*&#039;)/g,
        ' <span class="xml-attr-name">$1</span>$2<span class="xml-attr-value">$3</span>',
      );
      return result;
    };
    // 使用正则匹配不同类型的标记结构，逐个处理（注释 -> CDATA -> 声明 -> 普通标签）
    const markupPattern =
      /(&lt;!--[\s\S]*?--&gt;)|(&lt;!\[CDATA\[[\s\S]*?\]\]&gt;)|(&lt;\?[\s\S]*?\?&gt;)|(&lt;\/?[\w][\w:-]*(?:\s+[\w:-]+\s*=\s*(?:&quot;[^&]*&quot;|&#039;[^&]*&#039;))*\s*\/?&gt;)/g;
    return xml.replace(markupPattern, (match, comment, cdata, declaration, tag) => {
      if (comment) {
        return `<span class="xml-comment">${comment}</span>`;
      }
      if (cdata) {
        return `<span class="xml-cdata">${cdata}</span>`;
      }
      if (declaration) {
        return `<span class="xml-declaration">${declaration}</span>`;
      }
      if (tag) {
        return highlightTag(tag);
      }
      return match;
    });
  },
  // 文本 → 转义 → 按扩展名策略高亮；超限降级为纯转义
  render(text) {
    const escaped = escapeHtml(text);
    if (text.length > HIGHLIGHT_MAX_SIZE) {
      return escaped;
    }
    const ext = methods.getExt();
    if (ext === 'xml') {
      return methods.highlightMarkup(methods.formatXml(text));
    }
    if (ext === 'html' || ext === 'vue') {
      return methods.highlightMarkup(text);
    }
    if (ext === 'json') {
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch (e) {
        // 非法 json 按原文展示
      }
      return highlightWithRules(escapeHtml(formatted), getRules('json'));
    }
    const rules = getRules(ext);
    // sql 关键字大小写混用/全大写常见，走忽略大小写匹配
    return rules ? highlightWithRules(escaped, rules, ext === 'sql' ? 'gi' : 'g') : escaped;
  },
  async previewText() {
    if (!props.source) {
      return message.warning('未找到文件');
    }
    state.loading = true;
    try {
      let text = '';
      // 校验资源类型
      if (isUrl(props.source)) {
        // 如果是 URL，直接 fetch
        const response = await fetch(props.source);
        text = await response.text();
      } else if (props.source instanceof Blob) {
        text = await props.source.text();
      } else {
        // 通过接口下载文件
        const blob = await downloadBlobFile({ fileName: props.source });
        text = await blob.text();
      }
      state.highlighted = methods.render(text);
    } catch (error) {
      console.error('文本预览失败:', error);
      message.error('加载失败，请稍后重试');
    } finally {
      state.loading = false;
    }
  },
  autoDownload,
};

onMounted(() => {
  methods.previewText();
});
// source 变化时重新加载（单独使用时切换预览源）
watch(
  () => props.source,
  () => {
    methods.previewText();
  },
);
</script>

<style lang="less" scoped>
.text-wrap {
  width: 100%;
  height: 100%;
  .text-body {
    height: calc(100% - 41px);
    overflow: auto;
    background: #f8f9fa;
    .text-content {
      text-align: left;
      padding: 16px;
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        code {
          color: #333;
        }
      }
    }
  }
}

// 语法高亮配色（编辑器惯例色）
:deep(.xml-declaration) {
  color: #808080;
}
:deep(.xml-comment),
:deep(.text-comment) {
  color: #008000;
  font-style: italic;
}
:deep(.xml-cdata) {
  color: #808080;
}
:deep(.xml-tag-name),
:deep(.text-keyword),
:deep(.text-key) {
  color: #800000;
  font-weight: bold;
}
:deep(.xml-attr-name) {
  color: #ff0000;
}
:deep(.xml-attr-value),
:deep(.text-string),
:deep(.text-number) {
  color: #0000ff;
}
</style>
