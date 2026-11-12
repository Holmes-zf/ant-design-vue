<template>
  <demo-sort :cols="1">
    <eye-basic />
    <input-basic />
    <attrs />
  </demo-sort>
</template>

<script lang="ts">
import EyeBasic from './eye-basic.vue';
import InputBasic from './input-basic.vue';
import Attrs from './attrs.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    EyeBasic,
    InputBasic,
    Attrs,
  },
});
</script>
