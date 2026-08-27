<template>
  <demo-sort :cols="1">
    <all />
  </demo-sort>
</template>

<script lang="ts">
import All from './all.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: { All },
});
</script>
