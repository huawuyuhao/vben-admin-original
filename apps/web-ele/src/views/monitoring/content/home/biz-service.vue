<script lang="ts" setup>
import { PORTAL_CONTENT_TYPE } from './data';
import ContentListPage from './modules/content-list-page.vue';

defineOptions({ name: 'ContentHomeBizService' });
</script>

<template>
  <ContentListPage
    :content-type="PORTAL_CONTENT_TYPE.SERVICE"
    page-key="bizService"
  />
</template>
