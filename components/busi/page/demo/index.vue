<template>
  <demo-sort :cols="1">
    <demo-page-body />
    <demo-detail-page />
    <demo-detail-container />
  </demo-sort>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DemoPageBody from './page-body.vue';
import DemoDetailPage from './detail-page.vue';
import DemoDetailContainer from './detail-container.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';

export default defineComponent({
  CN,
  US,
  components: {
    DemoPageBody,
    DemoDetailPage,
    DemoDetailContainer,
  },
});
</script>
