import type { RouteRecordRaw } from 'vue-router';

/**
 * 门户服务（Vben 后台侧栏）
 */
const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:grid',
      order: 1,
      title: '门户服务',
    },
    name: 'PortalService',
    path: '/service',
    redirect: '/service/model',
    children: [
      {
        name: 'ServiceGoPortal',
        path: '/service/home',
        component: () => import('#/views/portal/redirect.vue'),
        meta: {
          hideInTab: true,
          icon: 'ep:home-filled',
          // 进入门户首页后不要作为「门户服务」顶栏点击的恢复路径
          title: '门户首页',
        },
      },
      {
        name: 'ServiceModel',
        path: '/service/model',
        component: () => import('#/views/model/index.vue'),
        meta: {
          affixTab: true,
          icon: 'ep:cpu',
          title: '模型服务',
        },
      },
      {
        name: 'ServiceProduct',
        path: '/service/product',
        component: () => import('#/views/product/index.vue'),
        meta: {
          icon: 'ep:goods',
          title: '产品服务',
        },
      },
      {
        name: 'ServiceCase',
        path: '/service/case',
        component: () => import('#/views/case/index.vue'),
        meta: {
          icon: 'ep:collection',
          title: '案例中心',
        },
      },
      {
        name: 'ServiceMyDemand',
        path: '/service/mydemand',
        component: () => import('#/views/mydemand/index.vue'),
        meta: {
          icon: 'ep:document',
          title: '我的需求',
        },
      },
      {
        name: 'ServiceEnterprise',
        path: '/service/enterprise',
        component: () => import('#/views/enterprise/index.vue'),
        meta: {
          icon: 'ep:office-building',
          title: '企业服务',
        },
      },
      {
        name: 'ServiceRegister',
        path: '/service/register',
        component: () => import('#/views/register/index.vue'),
        meta: {
          icon: 'ep:key',
          title: '注册认证',
        },
      },
      {
        name: 'ServiceMsgNotify',
        path: '/service/msgnotify',
        component: () => import('#/views/msgnotify/index.vue'),
        meta: {
          icon: 'ep:bell',
          title: '消息通知',
        },
      },
      {
        name: 'ServiceProfile',
        path: '/service/profile',
        component: () => import('#/views/profile/index.vue'),
        meta: {
          icon: 'ep:user',
          title: '我的信息中心',
        },
      },
    ],
  },
];

export default routes;
