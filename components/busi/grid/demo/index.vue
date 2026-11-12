<template>
  <demo-sort :cols="1">
    <pager-statistics />
    <action-body />
    <grid-action />
    <grid-qry-btn />
    <columns-config />
    <dc-grid-qry-form />
  </demo-sort>
</template>

<script lang="ts">
import PagerStatistics from './pager-statistics.vue';
import ActionBody from './action-body.vue';
import GridAction from './grid-action.vue';
import GridQryBtn from './grid-qry-btn.vue';
import ColumnsConfigDemo from './columns-config.vue';
import DcGridQryForm from './dc-grid-qry-form.vue';
import CN from '../index.zh-CN.md';
import US from '../index.en-US.md';
import { defineComponent } from 'vue';

export default defineComponent({
  CN,
  US,
  components: {
    PagerStatistics,
    ActionBody,
    GridAction,
    GridQryBtn,
    ColumnsConfigDemo,
    DcGridQryForm,
  },
});
</script>
