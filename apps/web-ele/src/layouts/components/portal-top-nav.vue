<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const navItems = [
  { key: 'portal', label: '首页', path: '/portal' },
  { key: 'model', label: '模型', path: '/service/model' },
  { key: 'product', label: '产品', path: '/service/product' },
  { key: 'case', label: '案例', path: '/service/case' },
  { key: 'workbench', label: '工作台', path: '/workbench/overview' },
  { key: 'monitoring', label: '监测', path: '/monitoring/strategy' },
  { key: 'admin', label: '管理', path: '/admin/user' },
] as const;

const activeKey = computed(() => {
  const path = route.path;
  if (path === '/portal' || path === '/login') return 'portal';
  if (path.startsWith('/service/model')) return 'model';
  if (path.startsWith('/service/product')) return 'product';
  if (path.startsWith('/service/case')) return 'case';
  if (path.startsWith('/workbench')) return 'workbench';
  if (path.startsWith('/monitoring')) return 'monitoring';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/service')) return 'model';
  return '';
});

function go(path: string) {
  if (path === '/portal') {
    router.push({ name: 'PortalHome' });
    return;
  }
  if (path === '/login') {
    router.push({ name: 'Login' });
    return;
  }
  router.push(path);
}
</script>

<template>
  <nav class="portal-top-nav">
    <div class="portal-nav-logo" @click="go('/portal')">
      <img class="portal-logo-icon" src="/logo.svg" alt="电碳算协同运营平台" />
      <span>电碳算协同运营平台</span>
    </div>
    <div class="portal-nav-menu">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="portal-nav-item"
        :class="{ active: activeKey === item.key }"
        @click="go(item.path)"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="portal-nav-right">
      <button
        class="portal-btn-trial"
        type="button"
        @click="go('/workbench/overview')"
      >
        免费体验
      </button>
      <button class="portal-btn-login" type="button" @click="go('/login')">
        登录
      </button>
    </div>
  </nav>
</template>
