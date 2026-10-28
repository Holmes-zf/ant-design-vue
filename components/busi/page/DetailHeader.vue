<template>
  <div class="detail-header">
    <div class="header-left">
      <!--
        a-page-header 保留官方能力：返回键（键盘可达 + aria-label 走 locale 多语言）、
        标题省略、副标题次级色、tags 与标题同行、<768px compact。
        本组件只负责「左标题 / 右工具位」的编排，不改写标题排版。
      -->
      <a-page-header :title="title" :sub-title="subTitle" @back="methods.back">
        <template #tags>
          <slot name="tags"></slot>
        </template>
      </a-page-header>
    </div>

    <div class="header-right">
      <slot name="headerRight"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  subTitle: {
    type: String,
    default: undefined,
  },
  // 返回键恒渲染（antd PageHeader 以 onBack 是否存在判定）；本 prop 只决定点击行为，缺省走历史回退
  back: {
    type: Function,
    default: undefined,
  },
});

const instance = getCurrentInstance();

const methods = {
  back() {
    if (props.back) {
      props.back();
      return;
    }
    // 缺省回退历史：接入 vue-router 时走 router.back()，未接入时回落浏览器历史
    const router = instance?.appContext.config.globalProperties.$router;
    if (router) {
      router.back();
      return;
    }
    window.history.back();
  },
};
</script>

<style lang="less" scoped>
// 详情页页头行：左「返回 + 标题 + 副标题 + 标签」｜右「页面工具位」。
//
// 外观契约（刻意不在此声明）：白底 / 高度 / 内外边距归宿主容器 —— 详情页里是
// PageBody 的 .page-header（内缩写在 DetailPage 的覆盖里），个性化页面里是页面自己的容器。
// 把内缩写进本件会让「独立使用」与「塞进 PageBodyHeader 默认内缩」叠成双份内边距。
//
// 结构契约：本件是宿主页头横条的唯一子节点 —— 左右分配靠自身 flex + width:100%，
// 不依赖宿主的 justify-content，也不该让宿主再插兄弟节点。
.detail-header {
  display: flex;
  align-items: center;
  width: 100%;

  .header-right {
    flex: 1;
    height: 40px;
  }
}

// antd PageHeader 自带内距，页头横条已提供内缩 ⇒ 只归零这一条
:deep(.ant-page-header-ghost) {
  padding: 0;
}
</style>
