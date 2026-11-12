<template>
  <a-space>
    <!-- 原 i18n：$t('customs.Inquire')，按下值替换为「查询」（待核对） -->
    <vxe-button @click="query" status="primary" content="查询" />
    <vxe-button type="reset" content="重置" @click="reset" />
  </a-space>
</template>
<script lang="ts">
export default {
  name: 'GridQryBtn',
};
</script>
<script setup lang="ts">
import { isFunction } from 'lodash-es';
// vxe-button 改为组件内显式引入（外部系统靠全局 app.use(VXETable) 注册，本仓库文档站无全局注册点；
// 局部注册后宿主无需预装 vxe 也能渲染）。样式与 vxe-grid 同口径引入（.vxe-* 前缀，不污染宿主）。
import { Button as VxeButton } from 'vxe-table';
import 'vxe-table/lib/style.css';

const props = defineProps({
  // vxe-grid 实例（或含 commitProxy 方法的 mock 对象），查询时调用 grid.commitProxy("_init")
  grid: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emit = defineEmits(['beforeQueryCallback', 'queryCallback', 'resetCallback']);
// 原实现里的 updateTodoCount("") 副作用已删除：交宿主监听 queryCallback / resetCallback 自行处理
const query = () => {
  emit('beforeQueryCallback');
  isFunction(props.grid.commitProxy) && props.grid.commitProxy('_init');
  emit('queryCallback');
};
const reset = () => {
  emit('resetCallback');
};
</script>
