import type { RouteRecordRaw } from 'vue-router';

/** 暂未单独做页的菜单，统一落到策略校核监控 */
const strategyComponent = () => import('#/views/monitoring/index.vue');

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:warning',
      order: 3,
      title: '监测',
    },
    name: 'Monitoring',
    path: '/monitoring',
    redirect: '/monitoring/strategy',
    children: [
      {
        meta: {
          icon: 'ep:data-line',
          order: 1,
          title: '监测管理',
        },
        name: 'MonitoringManage',
        path: '/monitoring/manage',
        redirect: '/monitoring/strategy',
        children: [
          {
            name: 'MonitoringStrategy',
            path: '/monitoring/strategy',
            component: strategyComponent,
            meta: {
              icon: 'ep:histogram',
              title: '策略校核监控',
            },
          },
          {
            name: 'MonitoringStats',
            path: '/monitoring/stats',
            component: strategyComponent,
            meta: {
              icon: 'ep:data-analysis',
              title: '数据统计',
            },
          },
          {
            name: 'MonitoringAlarm',
            path: '/monitoring/alarm',
            component: strategyComponent,
            meta: {
              icon: 'ep:bell',
              title: '告警管理',
            },
          },
          {
            name: 'MonitoringSystem',
            path: '/monitoring/system',
            component: strategyComponent,
            meta: {
              icon: 'ep:setting',
              title: '系统运行管理',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:management',
          order: 2,
          title: '基础管理',
        },
        name: 'MonitoringBasic',
        path: '/monitoring/basic',
        redirect: '/monitoring/customer',
        children: [
          {
            name: 'MonitoringCustomer',
            path: '/monitoring/customer',
            component: strategyComponent,
            meta: {
              icon: 'ep:user',
              title: '客户管理',
            },
          },
          {
            name: 'MonitoringContent',
            path: '/monitoring/content',
            component: strategyComponent,
            meta: {
              icon: 'ep:document',
              title: '内容管理',
            },
          },
          {
            name: 'MonitoringDataCenter',
            path: '/monitoring/data-center',
            component: strategyComponent,
            meta: {
              icon: 'ep:files',
              title: '数据中心管理',
            },
          },
          {
            name: 'MonitoringFeedback',
            path: '/monitoring/feedback',
            component: strategyComponent,
            meta: {
              icon: 'ep:chat-dot-round',
              title: '用户意见反馈',
            },
          },
        ],
      },
    ],
  },
];

export default routes;
