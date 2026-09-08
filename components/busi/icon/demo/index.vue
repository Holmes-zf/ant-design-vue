<template>
  <demo-sort :cols="1">
    <basic />
    <all />
    <core-basic />
    <core-all />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import All from './all.vue';
import CoreBasic from './core-basic.vue';
import CoreAll from './core-all.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: { Basic, All, CoreBasic, CoreAll },
});
</script>
