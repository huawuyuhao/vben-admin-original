import type { RouteRecordRaw } from 'vue-router';

/** 暂未单独做页的菜单，统一落到用户管理 */
const userComponent = () => import('#/views/admin/index.vue');
/** 原监测模块占位页 */
const strategyComponent = () => import('#/views/monitoring/index.vue');

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:setting',
      order: 4,
      title: '管理',
    },
    name: 'Admin',
    path: '/admin',
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
            meta: {
              icon: 'ep:data-analysis',
              title: '数据统计',
            },
            name: 'MonitoringStats',
            path: '/monitoring/stats',
            redirect: '/monitoring/stats/task',
            children: [
              {
                name: 'StatsTask',
                path: '/monitoring/stats/task',
                component: () => import('#/views/monitoring/stats/task.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 1,
                  title: '任务数据统计',
                },
              },
              {
                name: 'StatsDevice',
                path: '/monitoring/stats/device',
                component: () => import('#/views/monitoring/stats/device.vue'),
                meta: {
                  icon: 'ep:cpu',
                  order: 2,
                  title: '设备数据统计',
                },
              },
              {
                name: 'StatsUser',
                path: '/monitoring/stats/user',
                component: () => import('#/views/monitoring/stats/user.vue'),
                meta: {
                  icon: 'ep:user',
                  order: 3,
                  title: '用户数据统计',
                },
              },
              {
                name: 'StatsMonitor',
                path: '/monitoring/stats/monitor',
                component: () =>
                  import('#/views/monitoring/stats/monitor.vue'),
                meta: {
                  icon: 'ep:monitor',
                  order: 4,
                  title: '监测数据统计',
                },
              },
              {
                name: 'StatsCarbon',
                path: '/monitoring/stats/carbon',
                component: () => import('#/views/monitoring/stats/carbon.vue'),
                meta: {
                  icon: 'ep:mostly-cloudy',
                  order: 5,
                  title: '碳排放统计',
                },
              },
              {
                name: 'StatsComponent',
                path: '/monitoring/stats/component',
                component: () =>
                  import('#/views/monitoring/stats/component.vue'),
                meta: {
                  icon: 'ep:data-board',
                  order: 6,
                  title: '数据监控分析管理组件',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:bell',
              title: '告警管理',
            },
            name: 'MonitoringAlarm',
            path: '/monitoring/alarm',
            redirect: '/monitoring/alarm/manage',
            children: [
              {
                name: 'AlarmManage',
                path: '/monitoring/alarm/manage',
                component: () => import('#/views/monitoring/alarm/manage.vue'),
                meta: {
                  icon: 'ep:bell',
                  order: 1,
                  title: '告警管理',
                },
              },
              {
                name: 'AlarmStrategy',
                path: '/monitoring/alarm/strategy',
                component: () =>
                  import('#/views/monitoring/alarm/strategy.vue'),
                meta: {
                  icon: 'ep:warning',
                  order: 2,
                  title: '策略校核告警',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:setting',
              title: '系统运行管理',
            },
            name: 'MonitoringSystem',
            path: '/monitoring/system',
            redirect: '/monitoring/system/audit-log',
            children: [
              {
                name: 'SysAuditLog',
                path: '/monitoring/system/audit-log',
                component: () =>
                  import('#/views/monitoring/system/audit-log.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 1,
                  title: '系统审计日志',
                },
              },
              {
                name: 'SysStrategyLog',
                path: '/monitoring/system/strategy-log',
                component: () =>
                  import('#/views/monitoring/system/strategy-log.vue'),
                meta: {
                  icon: 'ep:data-analysis',
                  order: 2,
                  title: '策略校核日志分析',
                },
              },
              {
                name: 'SysRuntime',
                path: '/monitoring/system/runtime',
                component: () =>
                  import('#/views/monitoring/system/runtime.vue'),
                meta: {
                  icon: 'ep:monitor',
                  order: 3,
                  title: '系统运行状态',
                },
              },
            ],
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
        redirect: '/monitoring/customer/enterprise-archive',
        children: [
          {
            meta: {
              icon: 'ep:user',
              title: '客户管理',
            },
            name: 'MonitoringCustomer',
            path: '/monitoring/customer',
            redirect: '/monitoring/customer/enterprise-archive',
            children: [
              {
                name: 'EnterpriseArchive',
                path: '/monitoring/customer/enterprise-archive',
                component: () =>
                  import('#/views/basic/customer/enterprise-archive.vue'),
                meta: {
                  icon: 'ep:office-building',
                  order: 1,
                  title: '企业客户档案管理',
                },
              },
              {
                name: 'EnterpriseAuthMgr',
                path: '/monitoring/customer/enterprise-auth',
                component: () =>
                  import('#/views/basic/customer/enterprise-auth.vue'),
                meta: {
                  icon: 'ep:checked',
                  order: 2,
                  title: '企业客户认证管理',
                },
              },
              {
                name: 'PersonArchive',
                path: '/monitoring/customer/person-archive',
                component: () =>
                  import('#/views/basic/customer/person-archive.vue'),
                meta: {
                  icon: 'ep:user',
                  order: 3,
                  title: '个人客户档案管理',
                },
              },
              {
                name: 'PersonAuthMgr',
                path: '/monitoring/customer/person-auth',
                component: () =>
                  import('#/views/basic/customer/person-auth.vue'),
                meta: {
                  icon: 'ep:postcard',
                  order: 4,
                  title: '个人客户认证管理',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:document',
              title: '内容管理',
            },
            name: 'MonitoringContent',
            path: '/monitoring/content',
            redirect: '/monitoring/content/banner',
            children: [
              {
                name: 'ContentBanner',
                path: '/monitoring/content/banner',
                component: () => import('#/views/basic/content/banner.vue'),
                meta: { icon: 'ep:picture', order: 1, title: '轮播图内容管理' },
              },
              {
                name: 'ContentBizIntro',
                path: '/monitoring/content/biz-intro',
                component: () => import('#/views/basic/content/biz-intro.vue'),
                meta: {
                  icon: 'ep:briefcase',
                  order: 2,
                  title: '业务介绍内容管理',
                },
              },
              {
                name: 'ContentNews',
                path: '/monitoring/content/news',
                component: () => import('#/views/basic/content/news.vue'),
                meta: {
                  icon: 'ep:reading',
                  order: 3,
                  title: '行业资讯内容管理',
                },
              },
              {
                name: 'ContentAbout',
                path: '/monitoring/content/about',
                component: () => import('#/views/basic/content/about.vue'),
                meta: {
                  icon: 'ep:info-filled',
                  order: 4,
                  title: '关于我们内容管理',
                },
              },
              {
                name: 'ContentModelCard',
                path: '/monitoring/content/model-card',
                component: () => import('#/views/basic/content/model-card.vue'),
                meta: {
                  icon: 'ep:grid',
                  order: 5,
                  title: '应用模型卡片管理',
                },
              },
              {
                name: 'ContentCase',
                path: '/monitoring/content/case',
                component: () => import('#/views/basic/content/case.vue'),
                meta: { icon: 'ep:collection', order: 6, title: '案例内容管理' },
              },
              {
                name: 'ContentFaq',
                path: '/monitoring/content/faq',
                component: () => import('#/views/basic/content/faq.vue'),
                meta: {
                  icon: 'ep:question-filled',
                  order: 7,
                  title: '常见问题管理',
                },
              },
              {
                name: 'ContentAnnounce',
                path: '/monitoring/content/announce',
                component: () => import('#/views/basic/content/announce.vue'),
                meta: {
                  icon: 'ep:bell',
                  order: 8,
                  title: '活动公告管理',
                },
              },
              {
                name: 'ContentPartner',
                path: '/monitoring/content/partner',
                component: () => import('#/views/basic/content/partner.vue'),
                meta: {
                  icon: 'ep:office-building',
                  order: 9,
                  title: '合作伙伴展示管理',
                },
              },
              {
                name: 'ContentLegal',
                path: '/monitoring/content/legal',
                component: () => import('#/views/basic/content/legal.vue'),
                meta: {
                  icon: 'ep:document-checked',
                  order: 10,
                  title: '法律条款与协议管理',
                },
              },
              {
                name: 'ContentHomeLayout',
                path: '/monitoring/content/home-layout',
                component: () =>
                  import('#/views/basic/content/home-layout.vue'),
                meta: {
                  icon: 'ep:menu',
                  order: 11,
                  title: '首页排版管理',
                },
              },
              {
                name: 'ContentAudit',
                path: '/monitoring/content/audit',
                component: () => import('#/views/basic/content/audit.vue'),
                meta: {
                  icon: 'ep:finished',
                  order: 12,
                  title: '门户内容审核管理',
                },
              },
              {
                name: 'ContentProduct',
                path: '/monitoring/content/product',
                component: () => import('#/views/basic/content/product.vue'),
                meta: {
                  icon: 'ep:cpu',
                  order: 13,
                  title: '算力产品管理',
                },
              },
              {
                name: 'ContentContract',
                path: '/monitoring/content/contract',
                component: () => import('#/views/basic/content/contract.vue'),
                meta: {
                  icon: 'ep:notebook',
                  order: 14,
                  title: '算力合同',
                },
              },
              {
                name: 'ContentSettlement',
                path: '/monitoring/content/settlement',
                component: () =>
                  import('#/views/basic/content/settlement.vue'),
                meta: {
                  icon: 'ep:coin',
                  order: 15,
                  title: '算力结算',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:files',
              title: '数据中心管理',
            },
            name: 'MonitoringDataCenter',
            path: '/monitoring/data-center',
            redirect: '/monitoring/data-center/collect',
            children: [
              {
                name: 'DcCollect',
                path: '/monitoring/data-center/collect',
                component: () =>
                  import('#/views/basic/data-center/collect.vue'),
                meta: {
                  icon: 'ep:odometer',
                  order: 1,
                  title: '电力、算力数据高频采集',
                },
              },
              {
                name: 'DcApi',
                path: '/monitoring/data-center/api',
                component: () => import('#/views/basic/data-center/api.vue'),
                meta: { icon: 'ep:connection', order: 2, title: 'API服务' },
              },
              {
                name: 'DcInfo',
                path: '/monitoring/data-center/info',
                component: () => import('#/views/basic/data-center/info.vue'),
                meta: {
                  icon: 'ep:office-building',
                  order: 3,
                  title: '数据中心信息管理',
                },
              },
              {
                name: 'DcDataCollect',
                path: '/monitoring/data-center/data-collect',
                component: () =>
                  import('#/views/basic/data-center/data-collect.vue'),
                meta: {
                  icon: 'ep:download',
                  order: 4,
                  title: '数据采集',
                },
              },
              {
                name: 'DcDataService',
                path: '/monitoring/data-center/data-service',
                component: () =>
                  import('#/views/basic/data-center/data-service.vue'),
                meta: {
                  icon: 'ep:share',
                  order: 5,
                  title: '数据服务管理',
                },
              },
              {
                name: 'DcQuality',
                path: '/monitoring/data-center/quality',
                component: () =>
                  import('#/views/basic/data-center/quality.vue'),
                meta: {
                  icon: 'ep:circle-check',
                  order: 6,
                  title: '数据质量',
                },
              },
              {
                name: 'DcStandard',
                path: '/monitoring/data-center/standard',
                component: () =>
                  import('#/views/basic/data-center/standard.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 7,
                  title: '数据标准',
                },
              },
              {
                name: 'DcArchive',
                path: '/monitoring/data-center/archive',
                component: () =>
                  import('#/views/basic/data-center/archive.vue'),
                meta: {
                  icon: 'ep:folder-opened',
                  order: 8,
                  title: '数据归档',
                },
              },
              {
                name: 'DcCluster',
                path: '/monitoring/data-center/cluster',
                component: () =>
                  import('#/views/basic/data-center/cluster.vue'),
                meta: { icon: 'ep:box', order: 9, title: '集群管理' },
              },
              {
                name: 'DcContainer',
                path: '/monitoring/data-center/container',
                component: () =>
                  import('#/views/basic/data-center/container.vue'),
                meta: {
                  icon: 'ep:coin',
                  order: 10,
                  title: '容器管理',
                },
              },
              {
                name: 'DcNetwork',
                path: '/monitoring/data-center/network',
                component: () =>
                  import('#/views/basic/data-center/network.vue'),
                meta: {
                  icon: 'ep:link',
                  order: 11,
                  title: '网络资源',
                },
              },
              {
                name: 'DcMulti',
                path: '/monitoring/data-center/multi',
                component: () => import('#/views/basic/data-center/multi.vue'),
                meta: {
                  icon: 'ep:coordinate',
                  order: 12,
                  title: '多数据中心管理',
                },
              },
              {
                name: 'DcAccess',
                path: '/monitoring/data-center/access',
                component: () =>
                  import('#/views/basic/data-center/access.vue'),
                meta: {
                  icon: 'ep:set-up',
                  order: 13,
                  title: '基础接入管理',
                },
              },
              {
                name: 'DcComputeLink',
                path: '/monitoring/data-center/compute-link',
                component: () =>
                  import('#/views/basic/data-center/compute-link.vue'),
                meta: {
                  icon: 'ep:cpu',
                  order: 14,
                  title: '算力连接管理',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:chat-dot-round',
              title: '用户意见反馈管理',
            },
            name: 'MonitoringFeedback',
            path: '/monitoring/feedback',
            redirect: '/monitoring/feedback/ledger',
            children: [
              {
                name: 'FeedbackLedger',
                path: '/monitoring/feedback/ledger',
                component: () =>
                  import('#/views/basic/feedback/ledger.vue'),
                meta: {
                  icon: 'ep:notebook',
                  order: 1,
                  title: '用户意见反馈台账',
                },
              },
              {
                name: 'FeedbackCategory',
                path: '/monitoring/feedback/category',
                component: () =>
                  import('#/views/basic/feedback/category.vue'),
                meta: {
                  icon: 'ep:menu',
                  order: 2,
                  title: '用户意见反馈分类配置',
                },
              },
              {
                name: 'FeedbackReply',
                path: '/monitoring/feedback/reply',
                component: () => import('#/views/basic/feedback/reply.vue'),
                meta: {
                  icon: 'ep:chat-line-round',
                  order: 3,
                  title: '反馈消息回复',
                },
              },
              {
                name: 'FeedbackForm',
                path: '/monitoring/feedback/form',
                component: () => import('#/views/basic/feedback/form.vue'),
                meta: {
                  icon: 'ep:document',
                  order: 4,
                  title: '评价表单配置',
                },
              },
            ],
          },
        ],
      },
      {
        meta: {
          icon: 'ep:tools',
          order: 3,
          title: '系统管理',
        },
        name: 'AdminSystem',
        path: '/admin/system',
        redirect: '/admin/user',
        children: [
          {
            meta: {
              icon: 'ep:office-building',
              title: '组织管理',
            },
            name: 'AdminOrg',
            path: '/admin/org',
            redirect: '/admin/org/maintain',
            children: [
              {
                name: 'AdminOrgMaintain',
                path: '/admin/org/maintain',
                component: () => import('#/views/admin/org/maintain.vue'),
                meta: {
                  icon: 'ep:office-building',
                  order: 1,
                  title: '组织维护',
                },
              },
              {
                name: 'AdminOrgHistory',
                path: '/admin/org/history',
                component: () => import('#/views/admin/org/history.vue'),
                meta: {
                  icon: 'ep:clock',
                  order: 2,
                  title: '组织架构变更历史',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:user-filled',
              title: '用户管理',
            },
            name: 'AdminUser',
            path: '/admin/user',
            redirect: '/admin/user/maintain',
            children: [
              {
                name: 'AdminUserMaintain',
                path: '/admin/user/maintain',
                component: () => import('#/views/admin/user/maintain.vue'),
                meta: {
                  icon: 'ep:user',
                  order: 1,
                  title: '用户维护',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:avatar',
              title: '角色管理',
            },
            name: 'AdminRole',
            path: '/admin/role',
            redirect: '/admin/role/maintain',
            children: [
              {
                name: 'AdminRoleMaintain',
                path: '/admin/role/maintain',
                component: () => import('#/views/admin/role/maintain.vue'),
                meta: {
                  icon: 'ep:avatar',
                  order: 1,
                  title: '角色维护',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:key',
              title: '权限管理',
            },
            name: 'AdminPermission',
            path: '/admin/permission',
            redirect: '/admin/permission/maintain',
            children: [
              {
                name: 'AdminPermissionMaintain',
                path: '/admin/permission/maintain',
                component: () =>
                  import('#/views/admin/permission/maintain.vue'),
                meta: {
                  icon: 'ep:key',
                  order: 1,
                  title: '权限维护',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:set-up',
              title: '流程配置',
            },
            name: 'AdminWorkflow',
            path: '/admin/workflow',
            redirect: '/admin/workflow/design',
            children: [
              {
                name: 'AdminWorkflowDesign',
                path: '/admin/workflow/design',
                component: () => import('#/views/admin/workflow/design.vue'),
                meta: {
                  icon: 'ep:share',
                  order: 1,
                  title: '流程设计',
                },
              },
              {
                name: 'AdminWorkflowApproval',
                path: '/admin/workflow/approval',
                component: () => import('#/views/admin/workflow/approval.vue'),
                meta: {
                  icon: 'ep:finished',
                  order: 2,
                  title: '流程审批',
                },
              },
              {
                name: 'AdminWorkflowVersion',
                path: '/admin/workflow/version',
                component: () => import('#/views/admin/workflow/version.vue'),
                meta: {
                  icon: 'ep:collection-tag',
                  order: 3,
                  title: '流程版本管理',
                },
              },
              {
                name: 'AdminWorkflowRole',
                path: '/admin/workflow/role',
                component: () => import('#/views/admin/workflow/role.vue'),
                meta: {
                  icon: 'ep:user',
                  order: 4,
                  title: '流程角色配置',
                },
              },
              {
                name: 'AdminWorkflowPermission',
                path: '/admin/workflow/permission',
                component: () =>
                  import('#/views/admin/workflow/permission.vue'),
                meta: {
                  icon: 'ep:lock',
                  order: 5,
                  title: '流程权限配置',
                },
              },
            ],
          },
          {
            meta: {
              icon: 'ep:message',
              title: '消息管理',
            },
            name: 'AdminMessage',
            path: '/admin/message',
            redirect: '/admin/message/notify',
            children: [
              {
                name: 'AdminMessageNotify',
                path: '/admin/message/notify',
                component: () => import('#/views/admin/message/notify.vue'),
                meta: {
                  icon: 'ep:bell',
                  order: 1,
                  title: '消息通知管理',
                },
              },
              {
                name: 'AdminMessageConfig',
                path: '/admin/message/config',
                component: () => import('#/views/admin/message/config.vue'),
                meta: {
                  icon: 'ep:setting',
                  order: 2,
                  title: '消息配置',
                },
              },
              {
                name: 'AdminMessagePush',
                path: '/admin/message/push',
                component: () => import('#/views/admin/message/push.vue'),
                meta: {
                  icon: 'ep:promotion',
                  order: 3,
                  title: '消息推送',
                },
              },
              {
                name: 'AdminMessageApproval',
                path: '/admin/message/approval',
                component: () => import('#/views/admin/message/approval.vue'),
                meta: {
                  icon: 'ep:checked',
                  order: 4,
                  title: '审批工作台',
                },
              },
            ],
          },
        ],
      },
      {
        meta: {
          icon: 'ep:office-building',
          order: 4,
          title: '企业中心',
        },
        name: 'AdminEnterprise',
        path: '/admin/enterprise',
        redirect: '/admin/enterprise/info',
        children: [
          {
            name: 'AdminEnterpriseInfo',
            path: '/admin/enterprise/info',
            component: () => import('#/views/admin/enterprise/info.vue'),
            meta: {
              icon: 'ep:document',
              title: '企业信息管理',
            },
          },
          {
            name: 'AdminEnterpriseAccounts',
            path: '/admin/enterprise/accounts',
            component: () => import('#/views/admin/enterprise/accounts.vue'),
            meta: {
              icon: 'ep:user',
              title: '企业子账号管理',
            },
          },
          {
            name: 'AdminEnterpriseStats',
            path: '/admin/enterprise/stats',
            component: () => import('#/views/admin/enterprise/stats.vue'),
            meta: {
              icon: 'ep:data-analysis',
              title: '服务数据统计',
            },
          },
        ],
      },
      {
        meta: {
          icon: 'ep:user',
          order: 5,
          title: '个人中心',
        },
        name: 'AdminPersonal',
        path: '/admin/personal',
        redirect: '/admin/personal/service/profile',
        children: [
          {
            meta: {
              icon: 'ep:user-filled',
              title: '个人中心服务',
            },
            name: 'AdminPersonalService',
            path: '/admin/personal/service',
            redirect: '/admin/personal/service/profile',
            children: [
              {
                name: 'AdminPersonalProfile',
                path: '/admin/personal/service/profile',
                component: () =>
                  import('#/views/admin/personal/profile.vue'),
                meta: {
                  icon: 'ep:postcard',
                  order: 1,
                  title: '个人信息管理',
                },
              },
              {
                name: 'AdminPersonalContact',
                path: '/admin/personal/service/contact',
                component: () =>
                  import('#/views/admin/personal/contact.vue'),
                meta: {
                  icon: 'ep:phone',
                  order: 2,
                  title: '联系信息更新',
                },
              },
              {
                name: 'AdminPersonalSecurity',
                path: '/admin/personal/service/security',
                component: () =>
                  import('#/views/admin/personal/security.vue'),
                meta: {
                  icon: 'ep:lock',
                  order: 3,
                  title: '账户安全管理',
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
