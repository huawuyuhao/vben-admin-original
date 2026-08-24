import type { RouteRecordRaw } from 'vue-router';

const BasicLayout = () => import('#/layouts/basic.vue');

/** 登录路径（门户公开页，与首页同壳：有顶栏、无侧栏） */
export const PORTAL_LOGIN_PATH = '/login';

/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/**
 * 核心路由
 * 门户首页 / 登录注册与后台业务共用 Root（basic.vue），
 * 由布局按路由切换「公开壳」与「侧栏后台」。
 */
const coreRoutes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: '/portal',
    children: [
      {
        name: 'PortalHome',
        path: '/portal',
        component: () => import('#/views/portal/home/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          title: '门户首页',
        },
      },
      {
        name: 'Login',
        path: '/login',
        component: () => import('#/views/login/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          title: '登录',
        },
      },
      {
        name: 'Register',
        path: '/register',
        component: () => import('#/views/login/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          title: '注册',
        },
      },
      {
        name: 'ForgotPassword',
        path: '/forgot-password',
        component: () => import('#/views/login/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          title: '找回密码',
        },
      },
    ],
  },
  {
    meta: {
      hideInMenu: true,
      hideInTab: true,
      title: 'AuthCompatRedirect',
    },
    name: 'AuthCompatRedirect',
    path: '/auth/:path(.*)*',
    redirect: PORTAL_LOGIN_PATH,
  },
];

export { coreRoutes, fallbackNotFoundRoute };
