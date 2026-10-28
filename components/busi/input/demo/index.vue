<template>
  <demo-sort>
    <basic />
    <demo-form-textarea />
    <demo-select-multi-input />
    <demo-select-textarea />
    <demo-multi-input-modal />
  </demo-sort>
</template>

<script lang="ts">
import Basic from './basic.vue';
import DemoFormTextarea from './form-textarea.vue';
import DemoSelectMultiInput from './select-multi-input.vue';
import DemoSelectTextarea from './select-textarea.vue';
import DemoMultiInputModal from './multi-input-modal.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    Basic,
    DemoFormTextarea,
    DemoSelectMultiInput,
    DemoSelectTextarea,
    DemoMultiInputModal,
  },
});
</script>
