<template>
  <demo-sort :cols="1">
    <import-button />
    <form-file-item />
    <form-upload />
  </demo-sort>
</template>

<script lang="ts">
import ImportButton from './import-button.vue';
import FormFileItem from './form-file-item.vue';
import FormUpload from './form-upload.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    ImportButton,
    FormFileItem,
    FormUpload,
  },
});
</script>
