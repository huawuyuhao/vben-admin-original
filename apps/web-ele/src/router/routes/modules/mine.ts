import type { RouteRecordRaw } from 'vue-router';

/**
 * 我的（顶栏一级：管理右侧）
 */
const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:avatar',
      order: 6,
      title: '我的',
    },
    name: 'Mine',
    path: '/mine',
    redirect: '/mine/profile/info',
    children: [
      {
        meta: {
          icon: 'ep:user',
          order: 1,
          title: '我的信息中心',
        },
        name: 'MineProfile',
        path: '/mine/profile',
        redirect: '/mine/profile/info',
        children: [
          {
            name: 'MineProfileInfo',
            path: '/mine/profile/info',
            component: () => import('#/views/mine/profile/info/index.vue'),
            meta: {
              icon: 'ep:postcard',
              order: 1,
              title: '个人信息',
            },
          },
          {
            name: 'MineProfileLoginLog',
            path: '/mine/profile/login-log',
            component: () =>
              import('#/views/mine/profile/login-log/index.vue'),
            meta: {
              icon: 'ep:document',
              order: 2,
              title: '登录日志',
            },
          },
          {
            name: 'MineProfileFeedback',
            path: '/mine/profile/feedback',
            component: () =>
              import('#/views/mine/profile/feedback/index.vue'),
            meta: {
              icon: 'ep:chat-dot-round',
              order: 3,
              title: '意见反馈',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:star',
          order: 2,
          title: '我的收藏',
        },
        name: 'MineFavorites',
        path: '/mine/favorites',
        redirect: '/mine/favorites/products',
        children: [
          {
            name: 'MineFavoritesProducts',
            path: '/mine/favorites/products',
            component: () =>
              import('#/views/mine/favorites/products/index.vue'),
            meta: {
              icon: 'ep:goods',
              order: 1,
              title: '我的产品',
            },
          },
        ],
      },
      {
        /** 旧路径兼容：原「我的信息中心 / 我的收藏」及叶子「我的收藏」 */
        name: 'MineProfileFavoritesRedirect',
        path: '/mine/profile/favorites',
        redirect: '/mine/favorites/products',
        meta: {
          hideInMenu: true,
          title: '我的产品',
        },
      },
      {
        meta: {
          icon: 'ep:bell',
          order: 3,
          title: '消息通知',
        },
        name: 'MineMessages',
        path: '/mine/messages',
        redirect: '/mine/messages/all',
        children: [
          {
            name: 'MineMessagesAll',
            path: '/mine/messages/all',
            component: () => import('#/views/mine/messages/all/index.vue'),
            meta: {
              icon: 'ep:message',
              order: 1,
              title: '全部消息',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:key',
          order: 4,
          title: '注册认证',
        },
        name: 'MineRegister',
        path: '/mine/register',
        redirect: '/mine/register/enterprise',
        children: [
          {
            name: 'MineRegisterEnterprise',
            path: '/mine/register/enterprise',
            component: () =>
              import('#/views/mine/register/enterprise/index.vue'),
            meta: {
              icon: 'ep:office-building',
              order: 1,
              title: '企业用户认证',
            },
          },
          {
            name: 'MineRegisterPerson',
            path: '/mine/register/person',
            component: () => import('#/views/mine/register/person/index.vue'),
            meta: {
              icon: 'ep:user',
              order: 2,
              title: '个人用户认证',
            },
          },
        ],
      },
    ],
  },
];

export default routes;
