<script lang="ts" setup>
import { PORTAL_CONTENT_TYPE } from './data';
import ContentListPage from './modules/content-list-page.vue';

defineOptions({ name: 'ContentHomeBilling' });
</script>

<template>
  <ContentListPage :content-type="PORTAL_CONTENT_TYPE.BILLING" page-key="billing" />
</template>
