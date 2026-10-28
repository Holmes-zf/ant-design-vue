<template>
  <div class="page-body-header">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
// 默认规格 = 「页面级页头条」：白底 / 60px / 左右 10px / 下间距 12px（单源）。
// 使用方要其它形态（灰底 50px、白底紧凑等）时，用「祖先类 + .page-body-header」覆盖即可，例如
//   .tabs-wrap { .page-body-header { background: #ebedef; min-height: 50px; } }
.page-body-header {
  width: 100%;
  min-height: 60px;
  background: var(--bg-color-white, #fff);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 12px;
}
</style>
