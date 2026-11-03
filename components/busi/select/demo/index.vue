<template>
  <demo-sort>
    <basic />
    <multiple />
    <error-state />
    <default-select />
    <select-group />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import Multiple from './multiple.vue';
import ErrorState from './error.vue';
import DefaultSelect from './default-select.vue';
import SelectGroup from './select-group.vue';
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
    DefaultSelect,
    SelectGroup,
  },
});
</script>
