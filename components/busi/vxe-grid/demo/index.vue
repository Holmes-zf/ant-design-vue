<template>
  <demo-sort :cols="1">
    <basic />
    <query />
    <virtual />
    <clipboard />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Query from './query.vue';
import Virtual from './virtual.vue';
import Clipboard from './clipboard.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: { Basic, Query, Virtual, Clipboard },
});
</script>
