<template>
  <div class="echart" ref="mychart" :id="id"></div>
</template>

<script setup lang="ts">
/***
 * 按需引入了饼图，此次需求只需要饼图，echart太大，如果后续有大范围统计图，再改造全局引入
 * echarts 依赖本地未安装，import 照外部原样保留
 * ***/
import { onMounted, watch, reactive } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, CanvasRenderer, LabelLayout]);

const props = defineProps({
  id: {
    type: String,
    default: 'mychart',
  },
  options: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const state = reactive<{ myChartId: echarts.ECharts | undefined }>({
  myChartId: undefined,
});
onMounted(() => {
  state.myChartId = echarts.init(document.getElementById(props.id));
  state.myChartId.setOption(props.options);
});
watch(
  () => props.options,
  value => {
    if (state.myChartId) {
      state.myChartId.setOption(value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<style lang="less" scoped>
.echart {
  width: 100%;
  height: 100%;
}
</style>
