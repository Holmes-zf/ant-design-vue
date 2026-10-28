<template>
  <!--
    页面骨架：返回头 + 内容 + **页面级**底栏槽（一个页面一个脚）。
    区块各自要底栏时用 DetailContainer，不要在一个页面里塞多个 #footer。
  -->
  <div class="detail-content">
    <div class="detail-page-body">
      <PageBody>
        <template v-if="showHeader" #header>
          <!-- 页头行（返回 + 标题 + 副标题 + 标签 | 右侧工具位）由 DetailHeader 承担；
               本件只保留「是否渲染页头」与横条外观（.page-header 覆盖），props/slots 原样转发 -->
          <DetailHeader :title="title" :sub-title="subTitle" :back="back">
            <template #tags>
              <slot name="tags"></slot>
            </template>
            <template #headerRight>
              <slot name="headerRight"></slot>
            </template>
          </DetailHeader>
        </template>

        <!-- 其他内容插槽 -->
        <slot></slot>
      </PageBody>
    </div>

    <!--
      底部操作栏：**有 #footer 槽才渲染**（无底栏页面的这一段 DOM 根本不存在 ⇒ 不需要探测、不需要算让位空间）。
      · 条件底栏（如某些状态才出现）把 v-if 写在 <template #footer v-if="…"> 上，$slots.footer 随之消失
      · 容器不设高度：高度由槽内容（通常是 FormFooter）决定，空槽即 0 高
    -->
    <div v-if="$slots.footer" class="detail-content-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageBody from './PageBody.vue';
import DetailHeader from './DetailHeader.vue';

// 页头三件事（返回 / 标题 / 副标题）连同默认回退行为都在 DetailHeader 内，本件只做透传
defineProps({
  showHeader: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  subTitle: {
    type: String,
    default: undefined,
  },
  back: {
    type: Function,
    default: undefined,
  },
});
</script>

<style lang="less" scoped>
// 页面用「祖先类 + .detail-content」覆盖（如 .detail-wrap { .detail-content { background: transparent } }）。
// height 组件不声明 ⇒ 页面直接写 height:100% 也没有竞争。
.detail-content {
  display: flex;
  flex-direction: column;
  // 高度不在此声明：随内容；页面若需要定高，用自己的 scoped 规则写 `.detail-content { height }`
  // 撑满父级：短内容时把底栏推到底部（长内容随内容长高，由外层容器滚动）
  min-height: 100%;
  // sticky 承重：overflow 非 visible 的祖先会截走 sticky 的滚动容器
  overflow: visible;
  background: var(--bg-color-white, #fff);
}

.detail-page-body {
  // basis 用 auto（不是 0）：外壳高度随内容时（绝大多数页）内容照旧把外壳撑高、整页滚动，行为不变；
  // 只有外壳高度确定时（页面自己写了 height:100%）才会收缩到可用高度。
  flex: 1 1 auto;
  min-width: 0;
  // flex 项默认最小尺寸 = 内容最小高度，会被内容顶破外壳（表现为整页多出一条滚动条）。
  // 不在这里开 overflow：一旦成为滚动容器，页面内 position:sticky 的元素会改以它为参照而失去吸附。
  min-height: 0;
}

// 页头横条外观（详情专属规格）：PageBodyHeader 的默认白底 60px / 0 10px / 下间距 12px 在此就地改写。
// 左右分配与右侧工具位归 DetailHeader（自身 flex + width:100%），本件只给横条内缩、去掉下间距。
.detail-page-body :deep(.page-header) {
  padding: 8px 16px;
  margin-bottom: 0;
  height: auto;
  min-height: auto;
}

// 底栏：流内占位 + 贴滚动容器底部常驻。空槽 0 高；不用 absolute、不靠 padding-bottom 让位
.detail-content-footer {
  flex: none;
  position: sticky;
  bottom: 0;
  z-index: var(--z-index-fixed-footer, 600);
  background: var(--bg-color-white, #fff);
  box-shadow: var(--form-footer-shadow, 0 1px 8px rgba(19, 32, 67, 0.1));

  // 吸附形态下不存在「与上文的流内间距」：FormFooter 默认的 margin-top（服务于随内容滚动的形态）
  // 在这里只会变成底栏上方的一条空白。只归零这条间距，不碰背景/层级/投影（那些仍归 FormFooter）。
  > :deep(.form-footer) {
    margin-top: 0;
  }
}
</style>
