<script lang="ts" setup>
import type { PortalSidebarItem } from './portal-sidebar.vue';

import PortalSidebar from './portal-sidebar.vue';

defineProps<{
  breadcrumb: string[];
  description?: string;
  groups: Array<{
    items: PortalSidebarItem[];
    title: string;
  }>;
  title: string;
}>();
</script>

<template>
  <div class="portal-inner">
    <PortalSidebar :groups="groups" />
    <div class="portal-inner-content">
      <div class="portal-breadcrumb">
        <template v-for="(crumb, index) in breadcrumb" :key="crumb">
          <template v-if="index > 0"><span class="sep">/</span></template>
          <span v-if="index === breadcrumb.length - 1">{{ crumb }}</span>
          <template v-else>{{ crumb }}</template>
        </template>
      </div>
      <div class="portal-page-title">
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
