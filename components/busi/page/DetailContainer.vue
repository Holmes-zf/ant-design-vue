<template>
  <!-- 区块级容器：内容 + 可选的「本区块自己的」底部操作条 -->
  <div class="detail-container" :class="{ 'is-footer-fixed': footer === 'fixed' && $slots.footer }">
    <!-- 滚动放在这一层：不穿透 PageBody 内部（其 .page-content 是 overflow:hidden，会裁内容） -->
    <div class="detail-container__content">
      <!-- 内容皮肤（宽度口径 / 白底）复用 PageBody；height="auto" 让高度由内容/上层决定，
           避免 height:100% 把脚的高度也算进来 -->
      <PageBody height="auto">
        <slot></slot>
      </PageBody>
    </div>

    <!-- 本区块的脚：跟着内容排在末尾（流内），不遮挡、不需要任何人让位。
         页面级的脚（常驻、一个页面一个）请用 DetailPage 的 #footer 槽，不要用这里 -->
    <div v-if="$slots.footer" class="detail-container__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageBody from './PageBody.vue';

defineProps({
  // 本块 footer 的形态：
  // · flow（默认）→ 按 flex 列尾排布：宿主定高时随容器常驻，宿主随内容时排在末尾
  // · fixed        → 常驻浮层（配合 FormFooter 的 fixed 形态，absolute 锚页面祖先），
  //                  容器自己给内容层留出浮层高度（业务不用写任何 padding）
  //                  ⚠️ 同一页面只放一个 fixed 容器：多个会重叠；
  //                  多块各自要底栏时用 flow（各块定高 → 各自列尾常驻，互不干扰）
  footer: {
    type: String,
    default: 'flow',
    validator: (v: string) => ['flow', 'fixed'].includes(v),
  },
});
</script>

<style lang="less" scoped>
// 只做「内容 + 可选脚」的纵向排布，不做任何视觉（不加背景/圆角/内外边距）。
//
// 两种高度上下文自动适配，不需要任何开关：
// · 宿主给了确定高度（tab 面板 / 弹窗体 / 定高卡片 / 已定高的页面外壳）
//   ⇒ height:100% 生效，内容超出时「内容区自己滚」，脚常驻在列尾（不遮挡、不需要让位）
// · 宿主高度随内容（页面级滚动，未定高）
//   ⇒ height:100% 退化为 auto，overflow:auto 不产生滚动条，脚随内容排在末尾
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

// 内容层：占满剩余空间，超出时在「这一层」滚。
// 滚动刻意放在这层而不是 PageBody 内部：PageBody 的 .page-content 是 overflow:hidden，
// 在确定高度下会把内容裁掉；而这一层滚，既不裁内容，也不依赖祖先 overflow / sticky。
.detail-container__content {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

// 脚：流内、不被压缩。位置由 flex 分配 ⇒ 常驻与否只取决于「容器有没有确定高度」，
// 不需要 position / margin / 让位补偿。
.detail-container__footer {
  flex: none;
}

// footer="fixed"：脚是浮层（FormFooter 的 fixed 形态，absolute 锚页面祖先），不占流内空间，
// 由容器自己给内容层留出它的高度 —— 业务侧不写任何 padding。
.detail-container.is-footer-fixed .detail-container__content {
  padding-bottom: var(--form-footer-height, 60px);
}
</style>
