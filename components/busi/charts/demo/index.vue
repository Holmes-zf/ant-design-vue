<template>
  <demo-sort :cols="1">
    <basic />
    <attrs />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Attrs from './attrs.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    Basic,
    Attrs,
  },
});
</script>
