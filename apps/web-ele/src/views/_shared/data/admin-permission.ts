/** 权限管理 mock */

export const permissionList = [
  {
    id: 1,
    target: '算力运营管理员',
    items: '组织管理 / 用户管理 / 流程审批',
    scope: '功能权限',
    status: '已授权',
  },
  {
    id: 2,
    target: '企业租户',
    items: '任务提交 / 资源查看',
    scope: '功能权限',
    status: '已授权',
  },
  {
    id: 3,
    target: '审计员',
    items: '日志查看 / 合规审查',
    scope: '数据权限',
    status: '已授权',
  },
  {
    id: 4,
    target: '客服专员',
    items: '工单处理 / 消息回复',
    scope: '功能权限',
    status: '已授权',
  },
  {
    id: 5,
    target: '财务专员',
    items: '结算查看 / 账单导出',
    scope: '数据权限',
    status: '未授权',
  },
  {
    id: 6,
    target: '系统管理员',
    items: '全部系统管理模块',
    scope: '功能权限',
    status: '已授权',
  },
];
