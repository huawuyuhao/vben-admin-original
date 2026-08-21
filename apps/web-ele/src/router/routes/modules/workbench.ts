import type { RouteRecordRaw } from 'vue-router';

/** 暂未单独做页的菜单，统一落到全景展示 */
const overviewComponent = () => import('#/views/workbench/index.vue');

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:monitor',
      order: 2,
      title: '工作台',
    },
    name: 'Workbench',
    path: '/workbench',
    redirect: '/workbench/overview',
    children: [
      {
        meta: {
          icon: 'ep:location',
          order: 1,
          title: '区域算力调度',
        },
        name: 'WorkbenchDispatch',
        path: '/workbench/dispatch',
        redirect: '/workbench/overview',
        children: [
          {
            name: 'WorkbenchOverview',
            path: '/workbench/overview',
            component: overviewComponent,
            meta: {
              icon: 'ep:data-board',
              title: '全景展示',
            },
          },
          {
            name: 'WorkbenchApp',
            path: '/workbench/app',
            component: overviewComponent,
            meta: {
              icon: 'ep:box',
              title: '算力应用管理',
            },
          },
          {
            name: 'WorkbenchDemand',
            path: '/workbench/demand',
            component: overviewComponent,
            meta: {
              icon: 'ep:document',
              title: '算力需求管理',
            },
          },
          {
            name: 'WorkbenchRegion',
            path: '/workbench/region',
            component: overviewComponent,
            meta: {
              icon: 'ep:share',
              title: '区域调度管理',
            },
          },
          {
            name: 'WorkbenchStrategyCheck',
            path: '/workbench/strategy-check',
            component: overviewComponent,
            meta: {
              icon: 'ep:circle-check',
              title: '策略校验',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:cpu',
          order: 2,
          title: '算法模型库',
        },
        name: 'WorkbenchAlgo',
        path: '/workbench/algo',
        redirect: '/workbench/compute-meter',
        children: [
          {
            name: 'WorkbenchComputeMeter',
            path: '/workbench/compute-meter',
            component: overviewComponent,
            meta: {
              icon: 'ep:odometer',
              title: '算力计量',
            },
          },
          {
            name: 'WorkbenchPowerMeter',
            path: '/workbench/power-meter',
            component: overviewComponent,
            meta: {
              icon: 'ep:lightning',
              title: '电力计量',
            },
          },
          {
            name: 'WorkbenchCarbonMeter',
            path: '/workbench/carbon-meter',
            component: overviewComponent,
            meta: {
              icon: 'ep:mostly-cloudy',
              title: '碳排计量',
            },
          },
          {
            name: 'WorkbenchTaskSchedule',
            path: '/workbench/task-schedule',
            component: overviewComponent,
            meta: {
              icon: 'ep:sort',
              title: '任务调度',
            },
          },
          {
            name: 'WorkbenchEccModel',
            path: '/workbench/ecc-model',
            component: overviewComponent,
            meta: {
              icon: 'ep:files',
              title: '电碳算模型',
            },
          },
          {
            name: 'WorkbenchAlgoVersion',
            path: '/workbench/algo-version',
            component: overviewComponent,
            meta: {
              icon: 'ep:notebook',
              title: '算法版本管理',
            },
          },
        ],
      },
    ],
  },
];

export default routes;
