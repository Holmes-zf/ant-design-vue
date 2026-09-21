<template>
  <demo-sort>
    <basic />
    <arow />
    <box />
    <title-bar />
    <footer-bar />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Arow from './arow.vue';
import Box from './box.vue';
import TitleBar from './titlebar.vue';
import FooterBar from './footerbar.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: { Basic, Arow, Box, TitleBar, FooterBar },
});
</script>
