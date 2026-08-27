<docs>
---
order: 0
title:
  zh-CN: 全部主题变量
  en-US: All Theme Variables
---

## zh-CN

展示 kats-tenement 主题的全部 CSS 变量（以 `var(--xxx)` 形式引用，色板源自 `src/style/variables/themes/{light,dark}/vars.less`）。内置亮色 / 暗色两套变量值，点击右上角切换主题，所有色块实时联动。点击任意色块可复制变量名。

## en-US

Display all CSS variables of the kats-tenement theme (referenced as `var(--xxx)`, sourced from `src/style/variables/themes/{light,dark}/vars.less`). Two built-in themes (light / dark) can be switched via the toolbar, and all swatches update in real time. Click any swatch to copy its variable name.

</docs>
<template>
  <div ref="rootEl" class="theme-demo" :data-theme="theme">
    <div class="theme-demo__toolbar">
      <span class="theme-demo__tip">
        主题变量共 {{ vars.length }} 个，以 <code>var(--xxx)</code> 引用，点击色块复制变量名
      </span>
      <a-radio-group
        v-model:value="theme"
        button-style="solid"
        size="small"
        @change="onThemeChange"
      >
        <a-radio-button value="light">亮色</a-radio-button>
        <a-radio-button value="dark">暗色</a-radio-button>
      </a-radio-group>
    </div>

    <div v-for="group in groups" :key="group.key" class="theme-demo__group">
      <h3 class="theme-demo__group-title">
        {{ group.label }}（{{ group.vars.length }}）
      </h3>
      <div class="theme-demo__grid">
        <div
          v-for="item in group.vars"
          :key="item.name"
          class="theme-demo__item"
          :title="`点击复制 ${item.name}`"
          @click="onCopy(item.name)"
        >
          <div
            v-if="item.type === 'color'"
            class="theme-demo__swatch"
            :style="{ background: `var(${item.name})` }"
          />
          <div
            v-else-if="item.type === 'text'"
            class="theme-demo__swatch theme-demo__swatch--text"
            :style="{ background: 'var(--bg-color-white)', color: `var(${item.name})` }"
          >
            <span>Ag</span>
          </div>
          <div
            v-else-if="item.type === 'radius'"
            class="theme-demo__swatch"
            :style="{ background: 'var(--primary-color)', borderRadius: `var(${item.name})` }"
          />
          <div
            v-else-if="item.type === 'shadow'"
            class="theme-demo__swatch theme-demo__swatch--shadow"
            :style="{ background: 'var(--bg-color-white)', boxShadow: `var(${item.name})` }"
          />
          <div
            v-else
            class="theme-demo__swatch theme-demo__swatch--font"
            :style="{ fontSize: `var(${item.name})` }"
          >
            <span>Ag</span>
          </div>
          <div class="theme-demo__name">{{ item.name }}</div>
          <div class="theme-demo__value">{{ values[item.name] }}</div>
          <div class="theme-demo__desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';

type VarType = 'color' | 'text' | 'radius' | 'shadow' | 'font';

interface ThemeVar {
  name: string;
  type: VarType;
  desc: string;
}

interface VarGroup {
  key: string;
  label: string;
  vars: ThemeVar[];
}

// 变量清单：name 与 vars.less 键一一对应；desc 取自 vars.less 行内注释
const VARS: ThemeVar[] = [
  // 品牌色
  { name: '--primary-color', type: 'color', desc: '全局主色' },
  { name: '--dark-primary-color', type: 'color', desc: 'antd dark 主题官方变量名（预留兼容）' },
  { name: '--primary-color-light', type: 'color', desc: '浅色主色' },
  { name: '--link-color', type: 'color', desc: '链接色（与主色同值）' },
  // 功能色
  { name: '--success-color', type: 'color', desc: '成功色' },
  { name: '--warning-color', type: 'color', desc: '警告色' },
  { name: '--error-color', type: 'color', desc: '错误色（表单报错/告警）' },
  { name: '--danger-color', type: 'color', desc: '危险色（删除/高危操作）' },
  // 扩展状态色
  { name: '--purple-color', type: 'color', desc: '紫色（status-dot 等通用状态标识）' },
  { name: '--cyan-color', type: 'color', desc: '青色' },
  { name: '--blue-color', type: 'color', desc: '蓝色' },
  { name: '--gray-color', type: 'color', desc: '灰色' },
  // 中性色
  { name: '--text-color', type: 'text', desc: '主文本色' },
  { name: '--text-color-secondary', type: 'text', desc: '次文本色' },
  { name: '--heading-color', type: 'text', desc: '标题色' },
  { name: '--disabled-color', type: 'text', desc: '失效文字色' },
  { name: '--text-color-deep', type: 'text', desc: '深色正文' },
  // 背景色
  { name: '--bg-color-white', type: 'color', desc: '通用白色背景（卡片/表格/弹窗）' },
  { name: '--busi-bg-color', type: 'color', desc: '业务区底色' },
  { name: '--select-bg-color', type: 'color', desc: '选中/悬浮背景色' },
  { name: '--modal-mask-bg', type: 'color', desc: '弹窗遮罩背景色' },
  { name: '--page-bg', type: 'color', desc: '页面背景' },
  { name: '--disabled-bg-color', type: 'color', desc: '禁用态背景' },
  { name: '--layout-mini-btn-color', type: 'color', desc: '布局迷你按钮图标色' },
  // 表格与标签
  { name: '--table-header-bg', type: 'color', desc: '表头背景' },
  { name: '--table-header-color', type: 'text', desc: '表头文字' },
  { name: '--table-expand-row-bg', type: 'color', desc: '展开行表头背景' },
  { name: '--des-label-bg', type: 'color', desc: '详情标签底色' },
  { name: '--order-tag-bg', type: 'color', desc: '平台标签底色' },
  // 边框与分隔
  { name: '--border-color-base', type: 'color', desc: '组件默认边框' },
  { name: '--border-color-line', type: 'color', desc: '线条边框' },
  { name: '--divider-color', type: 'color', desc: '分隔线' },
  { name: '--border-radius-base', type: 'radius', desc: '组件/浮层圆角（尺寸类）' },
  { name: '--box-shadow-base', type: 'shadow', desc: '浮层阴影（尺寸类）' },
  // 排版
  { name: '--font-size-base', type: 'font', desc: '主字号（尺寸类）' },
  // 上传 / 滚动条 / 节点告警
  { name: '--upload-tip-color', type: 'color', desc: '上传提示文字' },
  { name: '--scrollbar-bg', type: 'color', desc: '滚动条轨道' },
  { name: '--scrollbar-thumb-bg', type: 'color', desc: '滚动条滑块' },
  { name: '--node-alert-error-color', type: 'color', desc: '节点告警-错误' },
  { name: '--node-alert-success-color', type: 'color', desc: '节点告警-成功' },
  { name: '--node-alert-gray-color', type: 'color', desc: '节点告警-灰色' },
  // vxe-table
  { name: '--vxe-btn-hover-color', type: 'color', desc: '按钮 hover 色（与主色同值）' },
  { name: '--vxe-sort-btn-color', type: 'color', desc: '排序箭头默认色' },
  { name: '--vxe-table-border-color', type: 'color', desc: '单元格边框色' },
  { name: '--air-cell-bg', type: 'color', desc: '空运单元格底色' },
  { name: '--box-cell-bg', type: 'color', desc: '箱单单元格底色' },
  { name: '--pack-cell-bg', type: 'color', desc: '拼箱单元格底色' },
  { name: '--vxe-font-color', type: 'text', desc: 'vxe 正文色（SCSS 桥接）' },
  { name: '--vxe-success-color', type: 'color', desc: 'vxe 成功色' },
  { name: '--vxe-info-color', type: 'color', desc: 'vxe 信息色' },
  { name: '--vxe-danger-color', type: 'color', desc: 'vxe 危险色' },
  { name: '--vxe-striped-bg', type: 'color', desc: '斑马纹背景' },
];

// 变量 → 分组映射（与 VARS 声明顺序无关，仅负责归类）
const GROUP_MAP: Record<string, string> = {
  '--primary-color': 'brand',
  '--dark-primary-color': 'brand',
  '--primary-color-light': 'brand',
  '--link-color': 'brand',
  '--success-color': 'status',
  '--warning-color': 'status',
  '--error-color': 'status',
  '--danger-color': 'status',
  '--purple-color': 'extended',
  '--cyan-color': 'extended',
  '--blue-color': 'extended',
  '--gray-color': 'extended',
  '--text-color': 'neutral',
  '--text-color-secondary': 'neutral',
  '--heading-color': 'neutral',
  '--disabled-color': 'neutral',
  '--text-color-deep': 'neutral',
  '--bg-color-white': 'background',
  '--busi-bg-color': 'background',
  '--select-bg-color': 'background',
  '--modal-mask-bg': 'background',
  '--page-bg': 'background',
  '--disabled-bg-color': 'background',
  '--layout-mini-btn-color': 'background',
  '--table-header-bg': 'table',
  '--table-header-color': 'table',
  '--table-expand-row-bg': 'table',
  '--des-label-bg': 'table',
  '--order-tag-bg': 'table',
  '--border-color-base': 'border',
  '--border-color-line': 'border',
  '--divider-color': 'border',
  '--border-radius-base': 'border',
  '--box-shadow-base': 'border',
  '--font-size-base': 'typography',
  '--upload-tip-color': 'misc',
  '--scrollbar-bg': 'misc',
  '--scrollbar-thumb-bg': 'misc',
  '--node-alert-error-color': 'misc',
  '--node-alert-success-color': 'misc',
  '--node-alert-gray-color': 'misc',
  '--vxe-btn-hover-color': 'vxe',
  '--vxe-sort-btn-color': 'vxe',
  '--vxe-table-border-color': 'vxe',
  '--air-cell-bg': 'vxe',
  '--box-cell-bg': 'vxe',
  '--pack-cell-bg': 'vxe',
  '--vxe-font-color': 'vxe',
  '--vxe-success-color': 'vxe',
  '--vxe-info-color': 'vxe',
  '--vxe-danger-color': 'vxe',
  '--vxe-striped-bg': 'vxe',
};

const GROUPS: VarGroup[] = [
  { key: 'brand', label: '品牌色', vars: [] },
  { key: 'status', label: '功能色', vars: [] },
  { key: 'extended', label: '扩展状态色', vars: [] },
  { key: 'neutral', label: '中性色', vars: [] },
  { key: 'background', label: '背景色', vars: [] },
  { key: 'table', label: '表格与标签', vars: [] },
  { key: 'border', label: '边框与分隔', vars: [] },
  { key: 'typography', label: '排版', vars: [] },
  { key: 'misc', label: '上传 / 滚动条 / 节点告警', vars: [] },
  { key: 'vxe', label: 'vxe-table', vars: [] },
];

VARS.forEach(item => {
  const group = GROUPS.find(g => g.key === GROUP_MAP[item.name]);
  if (group) {
    group.vars.push(item);
  }
});

const copyText = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => message.success(`copy: ${text}`))
      .catch(() => message.error('复制失败，请手动复制'));
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  message.success(`已复制: ${text}`);
};

export default defineComponent({
  setup() {
    const rootEl = ref<HTMLElement | null>(null);
    const theme = ref<'light' | 'dark'>('light');
    const values = reactive<Record<string, string>>({});

    const groups = computed(() => GROUPS.filter(g => g.vars.length > 0));

    const readValues = () => {
      const el = rootEl.value;
      if (!el) return;
      const cs = getComputedStyle(el);
      VARS.forEach(item => {
        values[item.name] = cs.getPropertyValue(item.name).trim();
      });
    };

    const onThemeChange = () => {
      // 等待 data-theme 更新后读取当前主题下的实际值
      nextTick(readValues);
    };

    onMounted(() => {
      nextTick(readValues);
    });

    return {
      vars: VARS,
      groups,
      rootEl,
      theme,
      values,
      onThemeChange,
      onCopy: copyText,
    };
  },
});
</script>

<style lang="less">
// ============================================
// 主题变量定义层（非 scoped，仅作用于本 demo 根节点）
// 值同步自 kats-tenement src/style/variables/themes/{light,dark}/vars.less
// 所有色块以 var() 引用，切换 data-theme 即整站换色
// ============================================
.theme-demo {
  // ---------- light（默认） ----------
  // 品牌色
  --primary-color: #0032a0;
  --dark-primary-color: #49bac9;
  --primary-color-light: #a0d9e2;
  --link-color: #0032a0;
  // 功能色
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f6530f;
  --danger-color: #f5222d;
  // 扩展状态色
  --purple-color: #722ed1;
  --cyan-color: #13c2c2;
  --blue-color: #1890ff;
  --gray-color: #999;
  // 中性色
  --text-color: rgba(0, 0, 0, 0.65);
  --text-color-secondary: rgba(0, 0, 0, 0.45);
  --heading-color: rgba(0, 0, 0, 0.85);
  --disabled-color: #999999;
  --text-color-deep: #122d41;
  // 背景色
  --bg-color-white: #fff;
  --busi-bg-color: #f0f0f7;
  --select-bg-color: #f5f7fa;
  --modal-mask-bg: rgba(0, 13, 22, 0.72);
  --page-bg: #f2f4f8;
  --disabled-bg-color: #eceeed;
  --layout-mini-btn-color: #999;
  // 表格与标签
  --table-header-bg: #f5f6f7;
  --table-header-color: #132043;
  --table-expand-row-bg: #f2feff;
  --des-label-bg: #f0f7fc;
  --order-tag-bg: #eb8730;
  // 边框与分隔
  --border-color-base: #f0f0f0;
  --border-color-line: #d9d9d9;
  --divider-color: #eeeeee;
  --border-radius-base: 4px;
  --box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
  // 排版
  --font-size-base: 14px;
  // 上传 / 滚动条 / 节点告警
  --upload-tip-color: #9ba7af;
  --scrollbar-bg: #f1f1f1;
  --scrollbar-thumb-bg: #c9c9c9;
  --node-alert-error-color: #ff0000;
  --node-alert-success-color: #3d97eb;
  --node-alert-gray-color: #c0c4cc;
  // vxe-table
  --vxe-btn-hover-color: #0032a0;
  --vxe-sort-btn-color: #c0c4cc;
  --vxe-table-border-color: #e8eaec;
  --air-cell-bg: #fffff0;
  --box-cell-bg: #f8fff8;
  --pack-cell-bg: #fff7f1;
  --vxe-font-color: #132043;
  --vxe-success-color: #3fac46;
  --vxe-info-color: #909399;
  --vxe-danger-color: #df443b;
  --vxe-striped-bg: #f5f5f5;

  &[data-theme='dark'] {
    // 品牌色
    --primary-color: #1668dc;
    --dark-primary-color: #49bac9;
    --primary-color-light: #124f9e;
    --link-color: #1668dc;
    // 中性色（暗底反白）
    --text-color: rgba(255, 255, 255, 0.85);
    --text-color-secondary: rgba(255, 255, 255, 0.45);
    --heading-color: rgba(255, 255, 255, 0.85);
    --disabled-color: rgba(255, 255, 255, 0.3);
    --text-color-deep: rgba(255, 255, 255, 0.9);
    // 背景色
    --bg-color-white: #1f1f1f;
    --busi-bg-color: #161616;
    --select-bg-color: #262626;
    --modal-mask-bg: rgba(0, 0, 0, 0.6);
    --page-bg: #141414;
    --disabled-bg-color: rgba(255, 255, 255, 0.08);
    --layout-mini-btn-color: rgba(255, 255, 255, 0.45);
    // 表格与标签
    --table-header-bg: #1f1f1f;
    --table-header-color: rgba(255, 255, 255, 0.65);
    --table-expand-row-bg: #1b1f2b;
    --des-label-bg: #1a2430;
    // 边框与分隔
    --border-color-base: #424242;
    --border-color-line: #303030;
    --divider-color: #303030;
    // 上传 / 滚动条 / 节点告警
    --upload-tip-color: rgba(255, 255, 255, 0.35);
    --scrollbar-bg: #1f1f1f;
    --scrollbar-thumb-bg: #595959;
    // vxe-table
    --vxe-btn-hover-color: #1668dc;
    --vxe-sort-btn-color: rgba(255, 255, 255, 0.35);
    --vxe-table-border-color: #303030;
    --air-cell-bg: #3a3a26;
    --box-cell-bg: #1f3322;
    --pack-cell-bg: #3a2f26;
    --vxe-font-color: rgba(255, 255, 255, 0.85);
    --vxe-striped-bg: rgba(255, 255, 255, 0.03);
  }
}
</style>

<style lang="less" scoped>
.theme-demo {
  padding: 16px;
  background: var(--page-bg);
  border: 1px solid var(--border-color-base);
  border-radius: 8px;
  transition: background 0.3s ease, border-color 0.3s ease;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__tip {
    font-size: 13px;
    color: var(--text-color-secondary);

    code {
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--select-bg-color);
      color: var(--primary-color);
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
  }

  &__group {
    margin-bottom: 24px;

    &-title {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 600;
      color: var(--heading-color);
      border-left: 3px solid var(--primary-color);
      padding-left: 8px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  &__item {
    padding: 12px;
    border: 1px solid var(--border-color-base);
    border-radius: 8px;
    background: var(--bg-color-white);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  &__swatch {
    height: 56px;
    border-radius: 6px;
    border: 1px solid var(--border-color-base);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &--text span,
    &--font span {
      font-weight: 600;
      line-height: 1;
    }

    &--shadow {
      border: none;
      box-shadow: var(--box-shadow-base);
    }
  }

  &__name {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--heading-color);
    word-break: break-all;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  &__value {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-color-secondary);
    word-break: break-all;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  &__desc {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-color-secondary);
    line-height: 1.4;
  }
}
</style>
