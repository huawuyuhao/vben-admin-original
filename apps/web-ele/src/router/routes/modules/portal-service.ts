import type { RouteRecordRaw } from 'vue-router';

/**
 * 门户服务（Vben 后台侧栏）
 * 顺序：产品服务 → 模型服务 → 案例中心 → 企业服务 → 我的需求
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
    redirect: '/service/product',
    children: [
      {
        name: 'ServiceProduct',
        path: '/service/product',
        component: () => import('#/views/service/product/index.vue'),
        meta: {
          icon: 'ep:goods',
          order: 1,
          title: '产品服务',
        },
      },
      {
        name: 'ServiceProductDetail',
        path: '/service/product/:id',
        component: () => import('#/views/service/product/detail/index.vue'),
        meta: {
          // 详情页不进侧栏，但激活态仍落在「产品服务」
          activePath: '/service/product',
          hideInMenu: true,
          hideInTab: false,
          title: '产品详情',
        },
      },
      {
        name: 'ServiceModel',
        path: '/service/model',
        component: () => import('#/views/service/model/index.vue'),
        meta: {
          icon: 'ep:cpu',
          order: 2,
          title: '模型服务',
        },
      },
      {
        name: 'ServiceModelDetail',
        path: '/service/model/:id',
        component: () => import('#/views/service/model/detail/index.vue'),
        meta: {
          // 详情页不进侧栏，但激活态仍落在「模型服务」
          activePath: '/service/model',
          hideInMenu: true,
          hideInTab: false,
          title: '模型详情',
        },
      },
      {
        name: 'ServiceCase',
        path: '/service/case',
        component: () => import('#/views/service/case/index.vue'),
        meta: {
          icon: 'ep:collection',
          order: 3,
          title: '案例中心',
        },
      },
      {
        name: 'ServiceCaseDetail',
        path: '/service/case/:id',
        component: () => import('#/views/service/case/detail/index.vue'),
        meta: {
          // 详情页不进侧栏，但激活态仍落在「案例中心」
          activePath: '/service/case',
          hideInMenu: true,
          hideInTab: false,
          title: '案例详情',
        },
      },
      {
        meta: {
          icon: 'ep:office-building',
          order: 4,
          title: '企业服务',
        },
        name: 'ServiceEnterprise',
        path: '/service/enterprise',
        redirect: '/service/enterprise/supply',
        children: [
          {
            name: 'ServiceEnterpriseSupply',
            path: '/service/enterprise/supply',
            component: () =>
              import('#/views/service/enterprise/supply/index.vue'),
            meta: {
              icon: 'ep:upload-filled',
              order: 1,
              title: '我的算力供给',
            },
          },
          {
            name: 'ServiceEnterpriseProducts',
            path: '/service/enterprise/products',
            component: () =>
              import('#/views/service/enterprise/products/index.vue'),
            meta: {
              icon: 'ep:box',
              order: 2,
              title: '我的算力产品',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:document',
          order: 5,
          title: '我的需求',
        },
        name: 'ServiceMyDemand',
        path: '/service/mydemand',
        redirect: '/service/mydemand/apps',
        children: [
          {
            name: 'ServiceMyDemandApps',
            path: '/service/mydemand/apps',
            component: () => import('#/views/service/mydemand/apps/index.vue'),
            meta: {
              icon: 'ep:menu',
              order: 1,
              title: '我的应用',
            },
          },
          {
            name: 'ServiceMyDemandCompute',
            path: '/service/mydemand/compute',
            component: () => import('#/views/mydemand/compute/index.vue'),
            meta: {
              icon: 'ep:cpu',
              order: 2,
              title: '我的算力需求',
            },
          },
          {
            name: 'ServiceMyDemandComputeCreate',
            path: '/service/mydemand/compute/create',
            component: () => import('#/views/mydemand/compute/create.vue'),
            meta: {
              activePath: '/service/mydemand/compute',
              hideInMenu: true,
              title: '新建算力需求',
            },
          },
          {
            name: 'ServiceMyDemandRuntime',
            path: '/service/mydemand/runtime',
            component: () => import('#/views/mydemand/runtime.vue'),
            meta: {
              icon: 'ep:monitor',
              order: 3,
              title: '应用运行管理',
            },
          },
        ],
      },
    ],
  },
];

export default routes;
