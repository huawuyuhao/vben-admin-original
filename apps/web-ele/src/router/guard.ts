import type { Router } from 'vue-router';

import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { PORTAL_LOGIN_PATH } from '#/router/routes/core';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 */
function setupCommonGuard(router: Router) {
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    loadedPaths.add(to.path);
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/** generateAccess 会 remove/add Root，兜底保证门户/登录子路由仍在 */
function ensurePublicRoutes(router: Router) {
  if (!router.hasRoute('PortalHome')) {
    router.addRoute('Root', {
      name: 'PortalHome',
      path: '/portal',
      component: () => import('#/views/portal/home/index.vue'),
      meta: {
        hideInMenu: true,
        hideInTab: true,
        title: '门户首页',
      },
    });
  }
  if (!router.hasRoute('Login')) {
    router.addRoute('Root', {
      name: 'Login',
      path: '/login',
      component: () => import('#/views/login/index.vue'),
      meta: {
        hideInMenu: true,
        hideInTab: true,
        title: '登录',
      },
    });
  }
}

/**
 * 生成菜单与动态路由（支持访客，无需登录即可进入后台布局页）
 */
async function ensureAccess(router: Router, roles: string[] = []) {
  const accessStore = useAccessStore();
  if (accessStore.isAccessChecked) {
    return;
  }
  const { accessibleMenus, accessibleRoutes } = await generateAccess({
    roles,
    router,
    routes: accessRoutes,
  });
  ensurePublicRoutes(router);
  accessStore.setAccessMenus(accessibleMenus);
  accessStore.setAccessRoutes(accessibleRoutes);
  accessStore.setIsAccessChecked(true);
}

/**
 * 权限访问守卫配置
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 门户首页 / 登录等核心路由
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === PORTAL_LOGIN_PATH && accessStore.accessToken) {
        await ensureAccess(router, userStore.userInfo?.roles ?? []);
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      // 公开页也要生成菜单，否则 Vben 顶栏一级菜单为空
      if (!accessStore.isAccessChecked) {
        await ensureAccess(router, userStore.userInfo?.roles ?? []);
      }
      return true;
    }

    // 未登录：按访客生成后台菜单，可直接访问业务页
    if (!accessStore.accessToken) {
      if (!accessStore.isAccessChecked) {
        await ensureAccess(router, []);
        return {
          ...router.resolve(to.fullPath),
          replace: true,
        };
      }
      return true;
    }

    if (accessStore.isAccessChecked) {
      return true;
    }

    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];
    await ensureAccess(router, userRoles);

    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupAccessGuard(router);
}

export { createRouterGuard };
