<template>
  <demo-sort>
    <basic />
    <multiple />
    <error-state />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Multiple from './multiple.vue';
import ErrorState from './error.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    Basic,
    Multiple,
    ErrorState,
  },
});
</script>
