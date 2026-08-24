import type { RouteRecordRaw } from 'vue-router';

/** 暂未单独做页的菜单，统一落到全景全局看板 */
const placeholderComponent = () =>
  import('#/views/workbench/panorama/global.vue');

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:cpu',
      order: 3,
      title: '算力调度',
    },
    name: 'Workbench',
    path: '/workbench',
    redirect: '/workbench/panorama/global',
    children: [
      {
        meta: {
          icon: 'ep:location',
          order: 1,
          title: '区域算力调度',
        },
        name: 'WorkbenchDispatch',
        path: '/workbench/dispatch',
        redirect: '/workbench/panorama/global',
        children: [
          {
            meta: {
              icon: 'ep:data-board',
              order: 1,
              title: '全景展示',
            },
            name: 'WorkbenchPanorama',
            path: '/workbench/panorama',
            redirect: '/workbench/panorama/global',
            children: [
              {
                name: 'WorkbenchPanoramaGlobal',
                path: '/workbench/panorama/global',
                component: () =>
                  import('#/views/workbench/panorama/global.vue'),
                meta: {
                  icon: 'ep:monitor',
                  order: 1,
                  title: '全局看板',
                },
              },
              {
                name: 'WorkbenchPanoramaDispatch',
                path: '/workbench/panorama/dispatch',
                component: () =>
                  import('#/views/workbench/panorama/dispatch.vue'),
                meta: {
                  icon: 'ep:position',
                  order: 2,
                  title: '调度执行看板',
                },
              },
              {
                name: 'WorkbenchPanoramaResource',
                path: '/workbench/panorama/resource',
                component: () =>
                  import('#/views/workbench/panorama/resource.vue'),
                meta: {
                  icon: 'ep:coin',
                  order: 3,
                  title: '资源看板',
                },
              },
              {
                name: 'WorkbenchPanoramaTask',
                path: '/workbench/panorama/task',
                component: () =>
                  import('#/views/workbench/panorama/task.vue'),
                meta: {
                  icon: 'ep:list',
                  order: 4,
                  title: '任务看板',
                },
              },
              {
                name: 'WorkbenchPanoramaSystem',
                path: '/workbench/panorama/system',
                component: () =>
                  import('#/views/workbench/panorama/system.vue'),
                meta: {
                  icon: 'ep:odometer',
                  order: 5,
                  title: '系统运行看板',
                },
              },
              {
                name: 'WorkbenchPanoramaAlarm',
                path: '/workbench/panorama/alarm',
                component: () =>
                  import('#/views/workbench/panorama/alarm.vue'),
                meta: {
                  icon: 'ep:bell',
                  order: 6,
                  title: '告警看板',
                },
              },
              {
                name: 'WorkbenchPanoramaStrategy',
                path: '/workbench/panorama/strategy',
                component: () =>
                  import('#/views/workbench/panorama/strategy.vue'),
                meta: {
                  icon: 'ep:circle-check',
                  order: 7,
                  title: '校核策略状态视图',
                },
              },
            ],
          },
          {
            name: 'WorkbenchOverview',
            path: '/workbench/overview',
            redirect: '/workbench/panorama/global',
            meta: {
              hideInMenu: true,
              title: '全景展示',
            },
          },
          {
            meta: {
              icon: 'ep:box',
              order: 2,
              title: '算力应用管理',
            },
            name: 'WorkbenchApps',
            path: '/workbench/app',
            redirect: '/workbench/app/info',
            children: [
              {
                name: 'WorkbenchAppInfo',
                path: '/workbench/app/info',
                component: () => import('#/views/workbench/apps/info.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 1,
                  title: '应用信息管理',
                },
              },
              {
                name: 'WorkbenchAppInfoForm',
                path: '/workbench/app/info/form',
                component: () => import('#/views/workbench/apps/info-form.vue'),
                meta: {
                  activePath: '/workbench/app/info',
                  hideInMenu: true,
                  title: '新建应用',
                },
              },
              {
                name: 'WorkbenchAppBasic',
                path: '/workbench/app/basic',
                component: () => import('#/views/workbench/apps/basic.vue'),
                meta: {
                  icon: 'ep:setting',
                  order: 2,
                  title: '应用基础配置',
                },
              },
              {
                name: 'WorkbenchAppTags',
                path: '/workbench/app/tags',
                component: () => import('#/views/workbench/apps/tags.vue'),
                meta: {
                  icon: 'ep:price-tag',
                  order: 3,
                  title: '应用标签',
                },
              },
              {
                name: 'WorkbenchAppCategories',
                path: '/workbench/app/categories',
                component: () =>
                  import('#/views/workbench/apps/categories.vue'),
                meta: {
                  icon: 'ep:menu',
                  order: 4,
                  title: '应用分类',
                },
              },
              {
                name: 'WorkbenchAppWarehouse',
                path: '/workbench/app/warehouse',
                component: () =>
                  import('#/views/workbench/apps/warehouse.vue'),
                meta: {
                  icon: 'ep:box',
                  order: 5,
                  title: '应用出入库配置',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:document',
              order: 3,
              title: '算力需求管理',
            },
            name: 'WorkbenchDemand',
            path: '/workbench/demand',
            redirect: '/workbench/demand/audit',
            children: [
              {
                name: 'WorkbenchDemandAudit',
                path: '/workbench/demand/audit',
                component: () =>
                  import('#/views/workbench/demand/audit.vue'),
                meta: {
                  icon: 'ep:checked',
                  order: 1,
                  title: '用户需求审核',
                },
              },
              {
                name: 'WorkbenchDemandConvert',
                path: '/workbench/demand/convert',
                component: () =>
                  import('#/views/workbench/demand/convert.vue'),
                meta: {
                  icon: 'ep:refresh',
                  order: 2,
                  title: '需求转任务',
                },
              },
              {
                name: 'WorkbenchDemandTasks',
                path: '/workbench/demand/tasks',
                component: () =>
                  import('#/views/workbench/demand/tasks.vue'),
                meta: {
                  icon: 'ep:list',
                  order: 3,
                  title: '算力任务管理',
                },
              },
              {
                name: 'WorkbenchDemandSupply',
                path: '/workbench/demand/supply',
                component: () =>
                  import('#/views/workbench/demand/supply.vue'),
                meta: {
                  icon: 'ep:upload',
                  order: 4,
                  title: '算力供给服务管理',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:share',
              order: 4,
              title: '区域调度管理',
            },
            name: 'WorkbenchRegion',
            path: '/workbench/region',
            redirect: '/workbench/region/scheme',
            children: [
              {
                name: 'WorkbenchRegionScheme',
                path: '/workbench/region/scheme',
                component: () =>
                  import('#/views/workbench/region/scheme.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 1,
                  title: '区域调度方案',
                },
              },
              {
                name: 'WorkbenchRegionReassess',
                path: '/workbench/region/reassess',
                component: () =>
                  import('#/views/workbench/region/reassess.vue'),
                meta: {
                  icon: 'ep:refresh',
                  order: 2,
                  title: '调度方案重新评估',
                },
              },
              {
                name: 'WorkbenchRegionEvaluate',
                path: '/workbench/region/evaluate',
                component: () =>
                  import('#/views/workbench/region/evaluate.vue'),
                meta: {
                  icon: 'ep:data-analysis',
                  order: 3,
                  title: '调度方案评价',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:circle-check',
              order: 5,
              title: '策略校核',
            },
            name: 'WorkbenchStrategyCheck',
            path: '/workbench/strategy-check',
            redirect: '/workbench/strategy-check/analysis',
            children: [
              {
                name: 'WorkbenchStrategyAnalysis',
                path: '/workbench/strategy-check/analysis',
                component: () =>
                  import('#/views/workbench/strategy-check/analysis.vue'),
                meta: {
                  icon: 'ep:data-analysis',
                  order: 1,
                  title: '策略校核分析',
                },
              },
              {
                name: 'WorkbenchStrategyProcess',
                path: '/workbench/strategy-check/process',
                component: () =>
                  import('#/views/workbench/strategy-check/process.vue'),
                meta: {
                  icon: 'ep:list',
                  order: 2,
                  title: '策略校核过程管理',
                },
              },
              {
                name: 'WorkbenchStrategyConfirm',
                path: '/workbench/strategy-check/confirm',
                component: () =>
                  import('#/views/workbench/strategy-check/confirm.vue'),
                meta: {
                  icon: 'ep:checked',
                  order: 3,
                  title: '策略校核确认',
                },
              },
            ],
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
        redirect: '/workbench/task-schedule/price-realtime',
        children: [
          {
            meta: {
              icon: 'ep:sort',
              order: 1,
              title: '任务调度',
            },
            name: 'WorkbenchTaskSchedule',
            path: '/workbench/task-schedule',
            redirect: '/workbench/task-schedule/price-realtime',
            children: [
              {
                name: 'TsPriceRealtime',
                path: '/workbench/task-schedule/price-realtime',
                component: () =>
                  import('#/views/workbench/task-schedule/price-realtime.vue'),
                meta: {
                  icon: 'ep:timer',
                  order: 1,
                  title: '电价优先实时本地调度策略',
                },
              },
              {
                name: 'TsPriceDayahead',
                path: '/workbench/task-schedule/price-dayahead',
                component: () =>
                  import('#/views/workbench/task-schedule/price-dayahead.vue'),
                meta: {
                  icon: 'ep:calendar',
                  order: 2,
                  title: '电价优先日前本地调度策略',
                },
              },
              {
                name: 'TsPowerRealtime',
                path: '/workbench/task-schedule/power-realtime',
                component: () =>
                  import('#/views/workbench/task-schedule/power-realtime.vue'),
                meta: {
                  icon: 'ep:lightning',
                  order: 3,
                  title: '满足调度功耗的实时本地调度策略',
                },
              },
              {
                name: 'TsPowerDayahead',
                path: '/workbench/task-schedule/power-dayahead',
                component: () =>
                  import('#/views/workbench/task-schedule/power-dayahead.vue'),
                meta: {
                  icon: 'ep:odometer',
                  order: 4,
                  title: '满足调度功耗的日前本地调度策略',
                },
              },
              {
                name: 'TsCarbonRealtime',
                path: '/workbench/task-schedule/carbon-realtime',
                component: () =>
                  import('#/views/workbench/task-schedule/generic-strategy.vue'),
                meta: {
                  icon: 'ep:mostly-cloudy',
                  order: 5,
                  scheduleKind: 'carbon-realtime',
                  title: '碳排优先实时本地调度策略',
                },
              },
              {
                name: 'TsCarbonDayahead',
                path: '/workbench/task-schedule/carbon-dayahead',
                component: () =>
                  import('#/views/workbench/task-schedule/generic-strategy.vue'),
                meta: {
                  icon: 'ep:mostly-cloudy',
                  order: 6,
                  scheduleKind: 'carbon-dayahead',
                  title: '碳排优先日前本地调度策略',
                },
              },
              {
                name: 'TsMultiBalance',
                path: '/workbench/task-schedule/multi-balance',
                component: () =>
                  import('#/views/workbench/task-schedule/generic-strategy.vue'),
                meta: {
                  icon: 'ep:share',
                  order: 7,
                  scheduleKind: 'multi-balance',
                  title: '多中心平衡算力小时数日前调度策略',
                },
              },
              {
                name: 'TsMultiEconomy',
                path: '/workbench/task-schedule/multi-economy',
                component: () =>
                  import('#/views/workbench/task-schedule/generic-strategy.vue'),
                meta: {
                  icon: 'ep:coin',
                  order: 8,
                  scheduleKind: 'multi-economy',
                  title: '多中心经济性日前调度策略',
                },
              },
              {
                name: 'TsMultiCarbon',
                path: '/workbench/task-schedule/multi-carbon',
                component: () =>
                  import('#/views/workbench/task-schedule/generic-strategy.vue'),
                meta: {
                  icon: 'ep:connection',
                  order: 9,
                  scheduleKind: 'multi-carbon',
                  title: '多中心碳排优先日前调度策略',
                },
              },
              {
                name: 'TsManage',
                path: '/workbench/task-schedule/manage',
                component: () =>
                  import('#/views/workbench/task-schedule/manage.vue'),
                meta: {
                  icon: 'ep:management',
                  order: 10,
                  title: '调度管理',
                },
              },
              {
                name: 'TsDayaheadLocal',
                path: '/workbench/task-schedule/dayahead-local',
                component: () =>
                  import('#/views/workbench/task-schedule/dispatch-board.vue'),
                meta: {
                  icon: 'ep:location',
                  order: 11,
                  dispatchMode: 'dayahead-local',
                  title: '日前本地调度',
                },
              },
              {
                name: 'TsDayaheadCross',
                path: '/workbench/task-schedule/dayahead-cross',
                component: () =>
                  import('#/views/workbench/task-schedule/dispatch-board.vue'),
                meta: {
                  icon: 'ep:position',
                  order: 12,
                  dispatchMode: 'dayahead-cross',
                  title: '日前跨域调度',
                },
              },
              {
                name: 'TsRealtimeLocal',
                path: '/workbench/task-schedule/realtime-local',
                component: () =>
                  import('#/views/workbench/task-schedule/dispatch-board.vue'),
                meta: {
                  icon: 'ep:stopwatch',
                  order: 13,
                  dispatchMode: 'realtime-local',
                  title: '实时本地调度',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:files',
              order: 2,
              title: '电碳算模型',
            },
            name: 'WorkbenchEccModel',
            path: '/workbench/ecc-model',
            redirect: '/workbench/ecc-model/framework',
            children: [
              {
                name: 'EccFramework',
                path: '/workbench/ecc-model/framework',
                component: () =>
                  import('#/views/workbench/ecc-model/framework.vue'),
                meta: {
                  icon: 'ep:switch',
                  order: 1,
                  title: '任务模型框架转换',
                },
              },
              {
                name: 'EccTrainCompute',
                path: '/workbench/ecc-model/train-compute',
                component: () =>
                  import('#/views/workbench/ecc-model/predict.vue'),
                meta: {
                  icon: 'ep:cpu',
                  order: 2,
                  eccKind: 'train-compute',
                  title: '训练类任务算力需求预测',
                },
              },
              {
                name: 'EccInferCompute',
                path: '/workbench/ecc-model/infer-compute',
                component: () =>
                  import('#/views/workbench/ecc-model/predict.vue'),
                meta: {
                  icon: 'ep:cpu',
                  order: 3,
                  eccKind: 'infer-compute',
                  title: '推理类任务算力需求预测',
                },
              },
              {
                name: 'EccPowerDemand',
                path: '/workbench/ecc-model/power-demand',
                component: () =>
                  import('#/views/workbench/ecc-model/predict.vue'),
                meta: {
                  icon: 'ep:lightning',
                  order: 4,
                  eccKind: 'power-demand',
                  title: '智算任务电力需求预测',
                },
              },
              {
                name: 'EccCarbonPredict',
                path: '/workbench/ecc-model/carbon-predict',
                component: () =>
                  import('#/views/workbench/ecc-model/predict.vue'),
                meta: {
                  icon: 'ep:mostly-cloudy',
                  order: 5,
                  eccKind: 'carbon-predict',
                  title: '智算任务碳排预测',
                },
              },
              {
                name: 'EccCostPredict',
                path: '/workbench/ecc-model/cost-predict',
                component: () =>
                  import('#/views/workbench/ecc-model/predict.vue'),
                meta: {
                  icon: 'ep:coin',
                  order: 6,
                  eccKind: 'cost-predict',
                  title: '智算任务成本预测',
                },
              },
              {
                name: 'EccMonitor',
                path: '/workbench/ecc-model/monitor',
                component: () =>
                  import('#/views/workbench/ecc-model/monitor.vue'),
                meta: {
                  icon: 'ep:monitor',
                  order: 7,
                  title: '智算任务运行状态综合监测',
                },
              },
              {
                name: 'EccDcForecast',
                path: '/workbench/ecc-model/dc-forecast',
                component: () =>
                  import('#/views/workbench/ecc-model/dc-forecast.vue'),
                meta: {
                  icon: 'ep:office-building',
                  order: 8,
                  title: '数据中心电碳算综合预测',
                },
              },
              {
                name: 'EccQa',
                path: '/workbench/ecc-model/qa',
                component: () =>
                  import('#/views/workbench/ecc-model/qa.vue'),
                meta: {
                  icon: 'ep:chat-dot-round',
                  order: 9,
                  title: '电碳算知识库智能问答',
                },
              },
              {
                name: 'EccModelComputeMax',
                path: '/workbench/ecc-model/model-compute-max',
                component: () =>
                  import('#/views/workbench/ecc-model/model-card.vue'),
                meta: {
                  icon: 'ep:data-board',
                  order: 10,
                  eccKind: 'compute-max',
                  title: '智算任务算力最大值预测模型',
                },
              },
              {
                name: 'EccModelPowerMax',
                path: '/workbench/ecc-model/model-power-max',
                component: () =>
                  import('#/views/workbench/ecc-model/model-card.vue'),
                meta: {
                  icon: 'ep:data-board',
                  order: 11,
                  eccKind: 'power-max',
                  title: '智算任务电力最大值预测模型',
                },
              },
              {
                name: 'EccModelStartTime',
                path: '/workbench/ecc-model/model-start-time',
                component: () =>
                  import('#/views/workbench/ecc-model/model-card.vue'),
                meta: {
                  icon: 'ep:timer',
                  order: 12,
                  eccKind: 'start-time',
                  title: '智算任务启动时间预测模型',
                },
              },
              {
                name: 'EccModelSaveTime',
                path: '/workbench/ecc-model/model-save-time',
                component: () =>
                  import('#/views/workbench/ecc-model/model-card.vue'),
                meta: {
                  icon: 'ep:folder-checked',
                  order: 13,
                  eccKind: 'save-time',
                  title: '智算任务保存时间预测模型',
                },
              },
              {
                name: 'EccModelRunTime',
                path: '/workbench/ecc-model/model-run-time',
                component: () =>
                  import('#/views/workbench/ecc-model/model-card.vue'),
                meta: {
                  icon: 'ep:stopwatch',
                  order: 14,
                  eccKind: 'run-time',
                  title: '智算任务运行时间预测模型',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:odometer',
              order: 3,
              title: '算力计量',
            },
            name: 'WorkbenchComputeMeter',
            path: '/workbench/compute-meter',
            redirect: '/workbench/compute-meter/task',
            children: [
              {
                name: 'ComputeTaskMeter',
                path: '/workbench/compute-meter/task',
                component: () =>
                  import('#/views/workbench/compute-meter/task-meter.vue'),
                meta: {
                  icon: 'ep:data-analysis',
                  order: 1,
                  title: '智算任务算力计量',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:lightning',
              order: 4,
              title: '电力计量',
            },
            name: 'WorkbenchPowerMeter',
            path: '/workbench/power-meter',
            redirect: '/workbench/power-meter/task',
            children: [
              {
                name: 'PowerTaskMeter',
                path: '/workbench/power-meter/task',
                component: () =>
                  import('#/views/workbench/power-meter/task-meter.vue'),
                meta: {
                  icon: 'ep:lightning',
                  order: 1,
                  title: '智算任务电力计量',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:mostly-cloudy',
              order: 5,
              title: '碳排计量',
            },
            name: 'WorkbenchCarbonMeter',
            path: '/workbench/carbon-meter',
            redirect: '/workbench/carbon-meter/task',
            children: [
              {
                name: 'CarbonTaskMeter',
                path: '/workbench/carbon-meter/task',
                component: () =>
                  import('#/views/workbench/carbon-meter/task-meter.vue'),
                meta: {
                  icon: 'ep:mostly-cloudy',
                  order: 1,
                  title: '智算任务碳排计量',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:set-up',
              order: 6,
              title: '策略校核算法',
            },
            name: 'WorkbenchStrategyAlgo',
            path: '/workbench/strategy-algo',
            redirect: '/workbench/strategy-algo/pre-warning',
            children: [
              {
                name: 'StrategyPreWarning',
                path: '/workbench/strategy-algo/pre-warning',
                component: () =>
                  import('#/views/workbench/strategy-algo/pre-warning.vue'),
                meta: {
                  icon: 'ep:bell',
                  order: 1,
                  title: '事前预警算法',
                },
              },
              {
                name: 'StrategyPostAttribution',
                path: '/workbench/strategy-algo/post-attribution',
                component: () =>
                  import('#/views/workbench/strategy-algo/post-attribution.vue'),
                meta: {
                  icon: 'ep:search',
                  order: 2,
                  title: '事后归因算法',
                },
              },
              {
                name: 'StrategySelfOptimize',
                path: '/workbench/strategy-algo/self-optimize',
                component: () =>
                  import('#/views/workbench/strategy-algo/self-optimize.vue'),
                meta: {
                  icon: 'ep:magic-stick',
                  order: 3,
                  title: '模型自优化算法',
                },
              },
              {
                name: 'StrategyResultFusion',
                path: '/workbench/strategy-algo/result-fusion',
                component: () =>
                  import('#/views/workbench/strategy-algo/result-fusion.vue'),
                meta: {
                  icon: 'ep:connection',
                  order: 4,
                  title: '模型结果融合',
                },
              },
              {
                name: 'StrategyKnowledgeBase',
                path: '/workbench/strategy-algo/knowledge-base',
                component: () =>
                  import('#/views/workbench/strategy-algo/knowledge-base.vue'),
                meta: {
                  icon: 'ep:collection',
                  order: 5,
                  title: '策略校核模型知识库',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:notebook',
              order: 7,
              title: '算法版本管理',
            },
            name: 'WorkbenchAlgoVersion',
            path: '/workbench/algo-version',
            redirect: '/workbench/algo-version/ledger',
            children: [
              {
                name: 'AlgoLedger',
                path: '/workbench/algo-version/ledger',
                component: () =>
                  import('#/views/workbench/algo-version/ledger.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 1,
                  title: '算法台账管理',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

export default routes;
