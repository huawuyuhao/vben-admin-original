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

/**
 * 判断是否为登录 / 注册 / 找回密码等认证页路径
 * @param path 路由 path
 */
function isAuthPath(path: string) {
  return (
    path === PORTAL_LOGIN_PATH ||
    path === '/register' ||
    path === '/forgot-password' ||
    path.startsWith('/auth/')
  );
}

/**
 * generateAccess 会 remove/add Root，兜底保证门户 / 登录等子路由仍在
 * @param router 路由实例
 */
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
  if (!router.hasRoute('PortalNewsDetail')) {
    router.addRoute('Root', {
      name: 'PortalNewsDetail',
      path: '/portal/news/:id',
      component: () => import('#/views/portal/news/detail/index.vue'),
      meta: {
        hideInMenu: true,
        hideInTab: true,
        title: '资讯详情',
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
  if (!router.hasRoute('Register')) {
    router.addRoute('Root', {
      name: 'Register',
      path: '/register',
      component: () => import('#/views/login/index.vue'),
      meta: {
        hideInMenu: true,
        hideInTab: true,
        title: '注册',
      },
    });
  }
  if (!router.hasRoute('ForgotPassword')) {
    router.addRoute('Root', {
      name: 'ForgotPassword',
      path: '/forgot-password',
      component: () => import('#/views/login/index.vue'),
      meta: {
        hideInMenu: true,
        hideInTab: true,
        title: '找回密码',
      },
    });
  }
}

/**
 * 生成菜单与动态路由
 * 公开页也需生成，保证顶栏一级菜单可见；业务页访问仍由鉴权拦截
 * @param router 路由实例
 * @param roles 用户角色列表
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

    // 门户首页 / 登录注册等核心公开路由
    if (coreRouteNames.includes(to.name as string)) {
      // 已登录再进登录页：带 redirect 则回原页，否则进首页
      if (isAuthPath(to.path) && accessStore.accessToken) {
        await ensureAccess(router, userStore.userInfo?.roles ?? []);
        return (
          userStore.userInfo?.homePath || preferences.app.defaultHomePath
        );
      }
      // 公开页也要生成菜单，否则 Vben 顶栏一级菜单为空
      if (!accessStore.isAccessChecked) {
        await ensureAccess(router, userStore.userInfo?.roles ?? []);
      }
      return true;
    }

    // 未登录：业务路由兜底拦截（顶栏/首页入口已在点击前校验；此处防直接输 URL）
    if (!accessStore.accessToken) {
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 从登录页后退到业务页：直接回门户，避免在登录↔业务间打转
      if (isAuthPath(from.path) && !isAuthPath(to.path)) {
        return {
          path: preferences.app.defaultHomePath,
          replace: true,
        };
      }

      // 不带 redirect，登录成功统一回门户；replace 避免业务页留在历史栈
      return {
        path: PORTAL_LOGIN_PATH,
        replace: true,
      };
    }

    // 已登录且动态路由已生成
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 已登录首次进入：拉取用户信息并生成动态路由
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo?.roles ?? [];
    await ensureAccess(router, userRoles);

    const redirectPath = (
      to.path === preferences.app.defaultHomePath
        ? userInfo?.homePath || preferences.app.defaultHomePath
        : to.fullPath
    ) as string;

    return {
      ...router.resolve(redirectPath),
      replace: true,
    };
  });
}

/**
 * 创建并挂载路由守卫
 * @param router 路由实例
 */
function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupAccessGuard(router);
}

export { createRouterGuard };
