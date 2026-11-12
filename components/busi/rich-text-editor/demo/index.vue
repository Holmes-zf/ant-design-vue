<template>
  <demo-sort :cols="1">
    <basic />
    <disabled />
    <config />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Disabled from './disabled.vue';
import Config from './config.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    Basic,
    Disabled,
    Config,
  },
});
</script>
