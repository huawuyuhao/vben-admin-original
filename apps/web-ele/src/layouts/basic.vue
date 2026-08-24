<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';

import '#/views/_shared/styles/portal.css';

const route = useRoute();

/** 门户首页 / 登录注册：隐藏侧栏与标签栏（未登录也可浏览门户） */
const isPublicPage = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/';
  return (
    path === '/portal' ||
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password'
  );
});

/** 离开门户首页后，顶栏一级菜单左侧显示「首页」快捷入口 */
const showPortalHomeTab = computed(() => !isPublicPage.value);

watch(
  isPublicPage,
  (isPublic) => {
    // 公开页与业务页共用 Vben 顶栏（Logo + 一级菜单 + 右侧工具）
    // 仅隐藏侧栏 / 标签栏 / 面包屑，避免营销页被后台壳挤占
    updatePreferences({
      app: { enablePreferences: !isPublic },
      breadcrumb: { enable: !isPublic, showIcon: true },
      header: { enable: true, hidden: false },
      logo: { enable: true },
      sidebar: { enable: true, hidden: isPublic },
      tabbar: { enable: !isPublic },
    });
  },
  { immediate: true },
);

const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    id: 2,
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    id: 3,
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    id: 4,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
  {
    id: 5,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '跳转Workspace示例',
    link: '/workspace',
  },
  {
    id: 6,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '跳转外部链接示例',
    link: 'https://doc.vben.pro',
  },
]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      router.push('/mine/profile/info');
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function goPortalHome() {
  if (route.path === '/portal' || route.name === 'PortalHome') {
    return;
  }
  router.push({ name: 'PortalHome' }).catch(() => {
    router.push('/portal');
  });
}

/** 点击左上角 Logo / 标题回到门户首页 */
function handleClickLogo() {
  goPortalHome();
}

function handleNoticeClear() {
  notifications.value = [];
}

function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}

const viewAll = () => {};

const handleClick = (item: NotificationItem) => {
  // 如果通知项有链接，点击时跳转
  if (item.link) {
    navigateTo(item.link, item.query, item.state);
  }
};

function navigateTo(
  link: string,
  query?: Record<string, any>,
  state?: Record<string, any>,
) {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    // 外部链接，在新标签页打开
    window.open(link, '_blank');
  } else {
    // 内部路由链接，支持 query 参数和 state
    router.push({
      path: link,
      query: query || {},
      state,
    });
  }
}

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';

      await updateWatermark({
        advancedStyle: {
          colorStops: [
            {
              color: watermarkColor,
              offset: 0,
            },
            {
              color: watermarkColor,
              offset: 1,
            },
          ],
          type: 'linear',
        },
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <!-- 始终挂载 BasicLayout，只用偏好隐藏侧栏；禁止 v-if 切换 RouterView，否则进出门户会空白 -->
  <div
    class="portal-app site-admin-shell"
    :class="{ 'is-public-page': isPublicPage }"
    :style="{
      '--admin-vben-header-height': `${preferences.header.height}px`,
    }"
  >
    <div class="site-admin-body">
      <BasicLayout
        :avatar
        :text="userStore.userInfo?.realName"
        @clear-preferences-and-logout="handleLogout"
        @click-logo="handleClickLogo"
        @logout="handleLogout"
      >
        <!-- index>100：面包屑之后、一级水平菜单之前（紧贴「门户服务」左侧） -->
        <template #header-left-101>
          <Transition name="portal-home-tab">
            <span
              v-if="showPortalHomeTab"
              class="portal-home-header-tab-wrap"
            >
              <button
                class="portal-home-header-tab"
                type="button"
                aria-label="返回门户首页"
                @click="goPortalHome"
              >
                <IconifyIcon
                  class="portal-home-header-tab__icon"
                  icon="ep:home-filled"
                />
                首页
              </button>
            </span>
          </Transition>
        </template>
        <template #user-dropdown>
          <UserDropdown
            :avatar
            :menus
            :text="userStore.userInfo?.realName"
            description="ann.vben@gmail.com"
            tag-text="Pro"
            @clear-preferences-and-logout="handleLogout"
            @logout="handleLogout"
          />
        </template>
        <template #notification>
          <Notification
            :dot="showDot"
            :notifications="notifications"
            @clear="handleNoticeClear"
            @read="(item) => item.id && markRead(item.id)"
            @remove="(item) => item.id && remove(item.id)"
            @make-all="handleMakeAll"
            @on-click="handleClick"
            @view-all="viewAll"
          />
        </template>
        <template #extra>
          <AuthenticationLoginExpiredModal
            v-model:open="accessStore.loginExpired"
            :avatar
          >
            <div class="flex flex-col items-center gap-3 p-6">
              <p class="text-muted-foreground text-sm">登录已过期，请重新登录</p>
              <button
                class="bg-primary rounded-md px-4 py-2 text-sm text-white"
                type="button"
                @click="
                  accessStore.setLoginExpired(false);
                  router.push('/login');
                "
              >
                前往登录
              </button>
            </div>
          </AuthenticationLoginExpiredModal>
        </template>
        <template #lock-screen>
          <LockScreen :avatar @to-login="handleLogout" />
        </template>
      </BasicLayout>
    </div>
  </div>
</template>

<style>
/*
 * 布局原则：
 * 1) html/body 不滚动，避免双滚动条
 * 2) 业务页：由 Vben 内容区 [data-layout-region=scroll] 单独滚动（侧栏 fixed 不受影响）
 * 3) 不改 Vben 根节点 flex 方向，避免侧栏盖住主内容
 * 4) 全站顶栏统一走 Vben；公开页只藏侧栏/标签，内容全宽
 */
html,
body,
#app {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.portal-app.site-admin-shell,
.site-admin-shell {
  --portal-header-height: 50px;
  --portal-admin-gap: 0px;
  --admin-offset-top: 0px;
  --admin-vben-header-height: 50px;

  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  padding-top: 0 !important;
  overflow: hidden !important;
}

.site-admin-shell .site-admin-body {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  overflow: hidden !important;
}

/* 保持 Vben 根布局为横向 flex，勿强制 column */
.site-admin-shell .site-admin-body > div {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

.site-admin-shell [data-layout-region='sidebar'],
.site-admin-shell aside.fixed.left-0 {
  top: var(--admin-offset-top) !important;
  height: calc(100vh - var(--admin-offset-top)) !important;
  margin-top: 0 !important;
}

.site-admin-shell [data-layout-region='header'] {
  top: var(--admin-offset-top) !important;
}

/* 左上角 Logo / 标题可点回首页 */
.site-admin-shell [data-layout-region='logo'] a {
  cursor: pointer;
}

/*
 * 混合垂直(mixed-nav) / 侧边顶部混合(header-sidebar-nav)：
 * Vben 顶栏通栏，侧栏本应在顶栏下方（靠 margin-top: headerHeight）。
 * 上面统一 margin-top:0 会让侧栏盖住面包屑，这里单独把侧栏再下移一截。
 */
.site-admin-shell [data-layout='mixed-nav'] aside.fixed.left-0,
.site-admin-shell [data-layout='header-sidebar-nav'] aside.fixed.left-0,
.site-admin-shell [data-layout='mixed-nav'] [data-layout-region='sidebar'],
.site-admin-shell [data-layout='header-sidebar-nav'] [data-layout-region='sidebar'] {
  top: calc(var(--admin-offset-top) + var(--admin-vben-header-height)) !important;
  height: calc(
    100vh - var(--admin-offset-top) - var(--admin-vben-header-height)
  ) !important;
  margin-top: 0 !important;
}

.site-admin-shell [data-layout='mixed-nav'] [data-layout-region='header'],
.site-admin-shell [data-layout='header-sidebar-nav'] [data-layout-region='header'] {
  top: var(--admin-offset-top) !important;
  z-index: 300 !important;
  /*
   * 开启 Tab 后，header 容器高度 = 顶栏 + 标签栏，且 mixed-nav 下 left:0 通栏。
   * 标签栏本身有 margin-left 避开侧栏，但容器空白区仍会挡住侧栏第一项点击。
   * 容器不接事件，子元素（顶栏/标签栏）照常可点。
   */
  pointer-events: none !important;
}

.site-admin-shell [data-layout='mixed-nav'] [data-layout-region='header'] > *,
.site-admin-shell [data-layout='header-sidebar-nav'] [data-layout-region='header'] > * {
  pointer-events: auto !important;
}

/* 业务页：只让内容区滚动（一根滚动条）
 * 注意：不要清 margin-top，Vben 用它给 fixed 面包屑顶栏让位，清掉会把大标题盖住 */
.site-admin-shell:not(.is-public-page) [data-layout-region='scroll'],
.site-admin-shell:not(.is-public-page) #__vben_layout_scroll {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  background: var(--portal-bg, #f8f9fc) !important;
}

/* 公开页：只藏侧栏；顶栏继续用 Vben，内容全宽 */
.is-public-page [data-layout-region='sidebar'],
.is-public-page aside.fixed.left-0 {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: none !important;
}

.is-public-page [data-layout-region='main'] {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

.is-public-page [data-layout-region='scroll'],
.is-public-page #__vben_layout_scroll {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  background: transparent !important;
}

.is-public-page #__vben_main_content,
.is-public-page main.relative,
.is-public-page .page-route-container,
.is-public-page .portal-page-wrap {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  min-height: 0 !important;
}

/* 业务页内容区内边距 */
.site-admin-shell:not(.is-public-page) #__vben_main_content,
.site-admin-shell:not(.is-public-page) [data-layout-region='main'] > main,
.site-admin-shell:not(.is-public-page) main.relative {
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: none !important;
  padding: 12px 16px 20px !important;
  margin: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.site-admin-shell:not(.is-public-page) .page-route-container,
.site-admin-shell:not(.is-public-page) .portal-inner-page {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  padding: 0 !important;
  margin: 0 !important;
}

/* 业务页顶栏：一级菜单左侧临时「首页」入口（样式对齐 Vben 水平菜单项） */
.portal-home-header-tab-wrap {
  display: inline-flex;
  max-width: 96px;
  margin-right: 4px;
  overflow: hidden;
  vertical-align: middle;
  white-space: nowrap;
}

.portal-home-header-tab {
  box-sizing: border-box;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: hsl(var(--accent-foreground));
  white-space: nowrap;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.portal-home-header-tab__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.portal-home-header-tab:hover {
  color: hsl(var(--accent-foreground));
  background: hsl(var(--accent));
}

.portal-home-header-tab:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* 左右滑入 / 滑出，宽度同步收缩避免菜单硬跳 */
.portal-home-tab-enter-active,
.portal-home-tab-leave-active {
  transition:
    max-width 0.28s ease,
    margin-right 0.28s ease,
    opacity 0.24s ease,
    transform 0.28s ease;
}

.portal-home-tab-enter-from,
.portal-home-tab-leave-to {
  max-width: 0;
  margin-right: 0;
  opacity: 0;
  transform: translateX(-14px);
}

.portal-home-tab-enter-to,
.portal-home-tab-leave-from {
  max-width: 96px;
  margin-right: 4px;
  opacity: 1;
  transform: translateX(0);
}
</style>
