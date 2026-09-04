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
import MessageDetailDialog from '#/views/mine/messages/all/modules/detail-dialog.vue';
import PortalSearchBar from '#/views/search/index.vue';

import { useHeaderNotifications } from './composables/use-header-notifications';

import '#/views/_shared/styles/portal.css';

const route = useRoute();

/** 门户首页 / 登录注册 / 资讯详情：隐藏侧栏与标签栏（未登录也可浏览） */
const isPublicPage = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/';
  return (
    path === '/portal' ||
    path.startsWith('/portal/news/') ||
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password'
  );
});

/** 是否处于门户首页本身 */
const isPortalHome = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/';
  return path === '/portal' || route.name === 'PortalHome';
});

/** 离开门户首页后（含资讯详情等公开页），顶栏显示「首页」快捷入口 */
const showPortalHomeTab = computed(() => !isPortalHome.value);

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

// 强制关闭 Vben Ctrl+K 菜单搜索（本地 preferences 缓存会覆盖 preferences.ts 的 overrides）
updatePreferences({
  widget: { globalSearch: false },
  shortcutKeys: { globalSearch: false },
});

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();

/** 是否已登录（以 vben accessStore.accessToken 为准） */
const isLoggedIn = computed(() => !!accessStore.accessToken);

/** 顶栏消息详情弹窗 */
const headerDetailDialogRef =
  ref<InstanceType<typeof MessageDetailDialog>>();

/**
 * 顶栏点击单条通知：直接打开详情弹窗，不跳转页面
 * @param item 通知项
 */
function openHeaderMessageDetail(item: NotificationItem) {
  const id = Number(item.id);
  if (!Number.isFinite(id) || id <= 0) {
    return;
  }
  void headerDetailDialogRef.value?.open({
    messageId: id,
    title: item.title,
    content: item.message,
    isRead: item.isRead ? 1 : 0,
    messageType:
      typeof item.messageType === 'number' ? item.messageType : undefined,
  });
}

const {
  notifications,
  showDot,
  fetchNotifications,
  handleRead,
  handleRemove,
  handleMakeAll,
  handleClear,
  handleClick,
  handleViewAll,
} = useHeaderNotifications({
  isLoggedIn: () => isLoggedIn.value,
  onOpenDetail: openHeaderMessageDetail,
});

/**
 * 顶栏详情打开未读消息后：标记已读并刷新铃铛状态
 * @param messageId 消息 ID
 */
async function handleHeaderDetailRead(messageId: number) {
  const item = notifications.value.find(
    (row) => Number(row.id) === messageId,
  );
  if (item) {
    await handleRead(item);
    return;
  }
  await handleRead({
    id: messageId,
    avatar: '',
    date: '',
    isRead: false,
    message: '',
    title: '',
  });
}
/**
 * 从全部消息页返回时刷新顶栏未读
 */
watch(
  () => route.path,
  (path, prev) => {
    if (!isLoggedIn.value) {
      return;
    }
    if (prev?.startsWith('/mine/messages') && !path.startsWith('/mine/messages')) {
      void fetchNotifications();
    }
  },
);

/**
 * 顶栏展示用头像：无自定义头像时用系统默认头像
 */
const avatar = computed(() => {
  const custom = userStore.userInfo?.avatar?.trim();
  return custom || preferences.app.defaultAvatar;
});

/**
 * 顶栏展示用昵称：无真实姓名时回退用户名或「用户」
 */
const displayName = computed(() => {
  return (
    userStore.userInfo?.realName ||
    userStore.userInfo?.username ||
    '用户'
  );
});

const menus = computed(() => [
  {
    handler: () => {
      router.push('/mine/profile/info');
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
]);

/**
 * 退出登录（接口 + 本地态由 authStore.logout 统一处理）
 */
async function handleLogout() {
  await authStore.logout(false);
}

/**
 * 跳转登录或注册页
 * @param mode 可选：register 表示注册
 */
function goAuth(mode?: 'register') {
  router.push({ path: mode === 'register' ? '/register' : '/login' });
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

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgb(255 255 255 / 12%)'
        : 'rgb(0 0 0 / 12%)';

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
        <!-- 顶栏右侧靠前：业务全局搜索（替代已隐藏的 Vben Ctrl+K 菜单搜索） -->
        <template #header-right-1>
          <PortalSearchBar />
        </template>
        <template #user-dropdown>
          <!-- 未登录：登录 / 注册入口 -->
          <div v-if="!isLoggedIn" class="portal-header-auth">
            <button
              class="portal-header-auth__login"
              type="button"
              @click="goAuth()"
            >
              登录
            </button>
            <button
              class="portal-header-auth__register"
              type="button"
              @click="goAuth('register')"
            >
              注册
            </button>
          </div>
          <!-- 已登录：隐藏 Pro / 邮箱，无头像用默认图 -->
          <UserDropdown
            v-else
            :avatar="avatar"
            :menus="menus"
            :text="displayName"
            @clear-preferences-and-logout="handleLogout"
            @logout="handleLogout"
          />
        </template>
        <template #notification>
          <Notification
            v-if="isLoggedIn"
            :dot="showDot"
            :notifications="notifications"
            @clear="handleClear"
            @read="handleRead"
            @remove="handleRemove"
            @make-all="handleMakeAll"
            @on-click="handleClick"
            @view-all="handleViewAll"
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
          <MessageDetailDialog
            v-if="isLoggedIn"
            ref="headerDetailDialogRef"
            @read="handleHeaderDetailRead"
          />
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
  padding: 0 !important;
  margin: 0 !important;
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
  overflow: hidden auto !important;
  background: var(--portal-bg, #f8f9fc) !important;
}

/* 公开页：只藏侧栏；顶栏继续用 Vben，内容全宽 */
.is-public-page [data-layout-region='sidebar'],
.is-public-page aside.fixed.left-0 {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
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
  overflow: hidden auto !important;
  background: transparent !important;
}

.is-public-page #__vben_main_content,
.is-public-page main.relative,
.is-public-page .page-route-container,
.is-public-page .portal-page-wrap {
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

/* 业务页内容区内边距（全站统一：四边一致） */
.site-admin-shell:not(.is-public-page) #__vben_main_content,
.site-admin-shell:not(.is-public-page) [data-layout-region='main'] > main,
.site-admin-shell:not(.is-public-page) main.relative {
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: none !important;
  padding: 10px !important;
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
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.portal-home-header-tab__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
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

/* 顶栏未登录：登录 / 注册入口 */
.portal-header-auth {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-right: 4px;
}

.portal-header-auth__login,
.portal-header-auth__register {
  box-sizing: border-box;
  height: 32px;
  padding: 0 14px;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 999px;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.portal-header-auth__login {
  color: hsl(var(--foreground));
  background: transparent;
  border: 1px solid hsl(var(--border));
}

.portal-header-auth__login:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--accent));
}

.portal-header-auth__register {
  color: #fff;
  background: var(--portal-primary, #6b4cff);
  border: 1px solid transparent;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--portal-primary, #6b4cff) 28%, transparent);
}

.portal-header-auth__register:hover {
  filter: brightness(1.06);
}

.portal-header-auth__login:focus-visible,
.portal-header-auth__register:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
</style>
