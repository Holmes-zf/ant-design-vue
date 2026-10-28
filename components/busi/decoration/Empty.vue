<template>
  <div class="empty_wrapper">
    <a-empty :image="image" :description="description || '暂无数据'" />
  </div>
</template>

<script setup lang="ts">
// 直接引本库的 Empty 源码模块（不走包名自引用，避免 busi 组件与库入口形成循环依赖）
import AntEmpty from '../../empty';

defineProps({
  // 默认项目统一用简版插画；需要换图时由调用点传 antd 的 image（字符串 src 或 PRESENTED_IMAGE_*）
  image: {
    type: [String, Object],
    default: () => AntEmpty.PRESENTED_IMAGE_SIMPLE,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
// flow-root = BFC：把 antd 空态自带的 32px 上下外边距收在壳内，避免折叠出去扰动父级布局。
// 本件只管布局隔离与文案/插画，底色、圆角、边框一律由所在容器负责（卡片感不是空态的职责）。
.empty_wrapper {
  display: flow-root;
}
</style>
