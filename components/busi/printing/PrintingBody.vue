<template>
  <div class="printing-body">
    <!-- 打印源：绝对定位移出视口，不占版面 -->
    <iframe
      ref="iframeRef"
      class="printing-frame"
      title="print source"
      aria-hidden="true"
      tabindex="-1"
    ></iframe>
    <div ref="contentRef" class="printing-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 打印桥：把默认插槽的内容搬进独立 iframe 后打印，从而只打印内容、不打印整页。
 *
 * 契约：
 * 1. 插槽内容即打印件 —— 一页一块，块与块之间用 `break-after: page`；纸张按 A4、页边距 0；
 * 2. 样式可写在 scoped `<style>` 里（组件会把父文档中含 `[data-v-*]` 的规则连同 @font-face / @keyframes
 *    一起注入 iframe）；非 scoped 的全局样式不会注入；
 * 3. `printing()` 返回 Promise：内容、图片、字体就绪后才调起打印，打印源不可用时 reject；
 * 4. 打印结束（含用户取消）发 `after-print`。
 */
import { onBeforeUnmount, onMounted, ref, unref } from 'vue';

const iframeRef = ref<HTMLIFrameElement>();
const contentRef = ref<HTMLElement>();
const $emits = defineEmits<{ (e: 'after-print'): void }>();

const methods = {
  /**
   * 收集父文档里的 scoped 规则（编译产物中 scoped 选择器必带 `[data-v-xxx]`）。
   * 只取 scoped 规则是有意为之：iframe 一旦带上全局 reset，打印件的分页和边距会被二次改写。
   */
  collectPrintStyles(): string {
    const collect = (rules: CSSRuleList): string[] => {
      const out: string[] = [];
      Array.from(rules).forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          if (rule.selectorText.includes('[data-v-')) out.push(rule.cssText);
          return;
        }
        // 字体与关键帧没有选择器，但 scoped 规则会用到，一并带上
        if (rule instanceof CSSFontFaceRule || rule instanceof CSSKeyframesRule) {
          out.push(rule.cssText);
          return;
        }
        // @media / @supports / @layer 这类容器规则：内部含命中规则才整块带上
        const container = rule as CSSGroupingRule;
        if (container.cssRules && collect(container.cssRules).length) out.push(rule.cssText);
      });
      return out;
    };

    return Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return collect(sheet.cssRules).join('\n');
        } catch {
          // 跨域样式表读 cssRules 会抛 SecurityError：读不到就不注入，由调用方用内联样式兜住
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');
  },

  /**
   * 把主题 CSS 变量（`--xxx`）搬到 iframe 的 `:root`。
   * 业务样式一律用 `var(--xxx)`，而 iframe 是独立文档、没有主文档的 `:root`。
   */
  collectThemeVars(): string {
    const declarations = new Map<string, string>();
    const inline = document.documentElement.style;
    for (let index = 0; index < inline.length; index += 1) {
      const name = inline[index];
      if (name.startsWith('--')) declarations.set(name, inline.getPropertyValue(name));
    }
    const computed = getComputedStyle(document.documentElement);
    for (let index = 0; index < computed.length; index += 1) {
      const name = computed[index];
      if (name.startsWith('--') && !declarations.has(name)) {
        declarations.set(name, computed.getPropertyValue(name).trim());
      }
    }
    return Array.from(declarations, ([name, value]) => `${name}:${value}`).join(';');
  },

  /** 重建 iframe 文档骨架：清掉上一份残留 + 写入纸张契约、主题变量与样式 */
  prepareDocument(doc: Document) {
    doc.head.innerHTML = '';
    doc.body.innerHTML = '';
    doc.body.style.margin = '0';
    const style = doc.createElement('style');
    // @page 才决定纸张与页边距；只设 body 的 margin 不等于无边距打印
    style.textContent = [
      '@page{size:A4;margin:0}',
      `:root{${methods.collectThemeVars()}}`,
      methods.collectPrintStyles(),
    ].join('\n');
    doc.head.appendChild(style);
  },

  /**
   * cloneNode 不携带表单的 DOM 属性值与 canvas 位图，按节点顺序逐个补上
   * （结构与顺序由 cloneNode 保证一致，故可按下标配对）
   */
  syncLiveState(source: Element, target: Element) {
    const sources = [source, ...Array.from(source.querySelectorAll('*'))];
    const targets = [target, ...Array.from(target.querySelectorAll('*'))];
    sources.forEach((src, index) => {
      const tgt = targets[index];
      if (!tgt || src.nodeName !== tgt.nodeName) return;
      if (src instanceof HTMLInputElement && tgt instanceof HTMLInputElement) {
        if (src.type === 'checkbox' || src.type === 'radio') tgt.checked = src.checked;
        else tgt.value = src.value;
        return;
      }
      if (src instanceof HTMLTextAreaElement && tgt instanceof HTMLTextAreaElement) {
        tgt.value = src.value;
        return;
      }
      if (src instanceof HTMLSelectElement && tgt instanceof HTMLSelectElement) {
        Array.from(src.options).forEach((option, optionIndex) => {
          const targetOption = tgt.options[optionIndex];
          if (targetOption) targetOption.selected = option.selected;
        });
        return;
      }
      if (src instanceof HTMLCanvasElement && tgt instanceof HTMLCanvasElement) {
        tgt.getContext('2d')?.drawImage(src, 0, 0);
      }
    });
  },

  /** 等图片与字体就绪再打印，否则打印件会出现空白图与回退字体 */
  async waitForAssets(doc: Document) {
    await Promise.all(
      Array.from(doc.images).map(
        image =>
          new Promise<void>(resolve => {
            if (image.complete) {
              resolve();
              return;
            }
            // 加载失败也要放行，不能把打印卡死
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    );
    if (doc.fonts) await doc.fonts.ready;
    // 双帧：等样式落地并完成一次布局，避免打印到「样式还没应用」的中间态
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
  },

  async printing(): Promise<void> {
    const frame = unref(iframeRef);
    const content = unref(contentRef);
    const doc = frame?.contentDocument;
    if (!frame || !content || !doc) {
      // 开发者侧异常（组件未挂载 / iframe 文档不可用），不面向终端用户
      throw new Error('[PrintingBody] print source is not ready');
    }

    methods.prepareDocument(doc);
    const clone = content.cloneNode(true) as HTMLElement;
    doc.body.appendChild(clone);
    methods.syncLiveState(content, clone);
    await methods.waitForAssets(doc);

    // 不调 contentWindow.focus()：iframe 在视口外，聚焦会把页面滚走
    frame.contentWindow?.print();
  },

  handleAfterPrint() {
    $emits('after-print');
  },
};

onMounted(() => {
  unref(iframeRef)?.contentWindow?.addEventListener('afterprint', methods.handleAfterPrint);
});

onBeforeUnmount(() => {
  const frame = unref(iframeRef);
  frame?.contentWindow?.removeEventListener('afterprint', methods.handleAfterPrint);
  // 打印完不留残页，避免大单据持续占内存
  const doc = frame?.contentDocument;
  if (doc) doc.body.innerHTML = '';
});

defineExpose({
  printing: methods.printing,
});
</script>

<style lang="less" scoped>
.printing-body {
  // 打印源不占版面：绝对定位移出视口。
  // 不用 display: none —— WebKit 对隐藏 iframe 的打印行为历来有差异。
  .printing-frame {
    position: absolute;
    top: 0;
    left: -9999px;
    width: 0;
    height: 0;
    border: 0;
  }
}
</style>
