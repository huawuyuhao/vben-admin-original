import type { RouteRecordRaw } from 'vue-router';

/** 暂未单独做页的菜单，统一落到用户管理 */
const userComponent = () => import('#/views/admin/index.vue');

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:setting',
      order: 4,
      title: '管理',
    },
    name: 'Admin',
    path: '/admin',
    redirect: '/admin/user',
    children: [
      {
        meta: {
          icon: 'ep:tools',
          order: 1,
          title: '系统管理',
        },
        name: 'AdminSystem',
        path: '/admin/system',
        redirect: '/admin/user',
        children: [
          {
            name: 'AdminOrg',
            path: '/admin/org',
            component: userComponent,
            meta: {
              icon: 'ep:office-building',
              title: '组织管理',
            },
          },
          {
            name: 'AdminUser',
            path: '/admin/user',
            component: userComponent,
            meta: {
              icon: 'ep:user-filled',
              title: '用户管理',
            },
          },
          {
            name: 'AdminRole',
            path: '/admin/role',
            component: userComponent,
            meta: {
              icon: 'ep:avatar',
              title: '角色管理',
            },
          },
          {
            name: 'AdminPermission',
            path: '/admin/permission',
            component: userComponent,
            meta: {
              icon: 'ep:key',
              title: '权限管理',
            },
          },
          {
            name: 'AdminWorkflow',
            path: '/admin/workflow',
            component: userComponent,
            meta: {
              icon: 'ep:set-up',
              title: '流程配置',
            },
          },
          {
            name: 'AdminMessage',
            path: '/admin/message',
            component: userComponent,
            meta: {
              icon: 'ep:message',
              title: '消息管理',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:wallet',
          order: 2,
          title: '算力结算',
        },
        name: 'AdminSettlement',
        path: '/admin/settlement',
        redirect: '/admin/contract',
        children: [
          {
            name: 'AdminContract',
            path: '/admin/contract',
            component: userComponent,
            meta: {
              icon: 'ep:document',
              title: '算力合同管理',
            },
          },
          {
            name: 'AdminSettleManage',
            path: '/admin/settle',
            component: userComponent,
            meta: {
              icon: 'ep:coin',
              title: '算力结算管理',
            },
          },
          {
            name: 'AdminTradeRecord',
            path: '/admin/trade',
            component: userComponent,
            meta: {
              icon: 'ep:tickets',
              title: '算力交易记录',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:cpu',
          order: 3,
          title: '算力资源管理',
        },
        name: 'AdminResource',
        path: '/admin/resource',
        redirect: '/admin/capability',
        children: [
          {
            name: 'AdminCapability',
            path: '/admin/capability',
            component: userComponent,
            meta: {
              icon: 'ep:upload',
              title: '算力能力发布',
            },
          },
        ],
      },
    ],
  },
];

export default routes;
