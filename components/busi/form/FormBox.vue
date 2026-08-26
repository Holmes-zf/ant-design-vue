<template>
  <div class="form-box light-form-box">
    <div class="form-box-body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-box {
  width: 100%;
  position: relative;
  .form-box-body {
    width: 100%;
    min-height: 100px;
    background: #ffffff;
  }
}
</style>
