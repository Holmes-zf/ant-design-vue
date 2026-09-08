<template>
  <demo-sort :cols="1">
    <demo-basic />
    <demo-pdf />
    <demo-image />
    <demo-excel />
    <demo-word />
    <demo-text />
    <demo-empty />
  </demo-sort>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DemoBasic from './basic.vue';
import DemoPdf from './pdf.vue';
import DemoImage from './image.vue';
import DemoExcel from './excel.vue';
import DemoWord from './word.vue';
import DemoText from './text.vue';
import DemoEmpty from './empty.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';

export default defineComponent({
  CN,
  US,
  components: {
    DemoBasic,
    DemoPdf,
    DemoImage,
    DemoExcel,
    DemoWord,
    DemoText,
    DemoEmpty,
  },
});
</script>
