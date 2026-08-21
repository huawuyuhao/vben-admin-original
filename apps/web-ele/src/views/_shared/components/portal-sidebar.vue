<script lang="ts" setup>
import { useRouter } from 'vue-router';

export interface PortalSidebarItem {
  icon: string;
  label: string;
  path?: string;
  active?: boolean;
}

defineProps<{
  groups: Array<{
    title: string;
    items: PortalSidebarItem[];
  }>;
}>();

const router = useRouter();

function onClick(item: PortalSidebarItem) {
  if (item.path) {
    router.push(item.path);
  }
}
</script>

<template>
  <aside class="portal-sidebar">
    <div v-for="group in groups" :key="group.title" class="portal-sidebar-group">
      <div class="portal-sidebar-title">{{ group.title }}</div>
      <div
        v-for="item in group.items"
        :key="item.label"
        class="portal-sidebar-item"
        :class="{ active: item.active }"
        @click="onClick(item)"
      >
        <span class="si-icon">{{ item.icon }}</span>
        {{ item.label }}
      </div>
    </div>
  </aside>
</template>
