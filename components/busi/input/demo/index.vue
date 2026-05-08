<template>
  <demo-sort>
    <basic />
    <mode />
  </demo-sort>
</template>

<script>
import Basic from './basic.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    Basic,
  },
});
</script>
<style></style>
