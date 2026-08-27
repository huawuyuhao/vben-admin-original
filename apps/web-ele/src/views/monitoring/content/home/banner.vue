<script lang="ts" setup>
import { PORTAL_CONTENT_TYPE } from './data';
import ContentListPage from './modules/content-list-page.vue';

defineOptions({ name: 'ContentHomeBanner' });
</script>

<template>
  <ContentListPage :content-type="PORTAL_CONTENT_TYPE.BANNER" page-key="banner" />
</template>
