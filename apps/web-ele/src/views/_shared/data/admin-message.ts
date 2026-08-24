/** 消息管理 mock */

export const messageNotifyList = [
  {
    id: 1,
    title: '华东算力开通申请待审批',
    category: '需求任务消息',
    source: '客户需求任务',
    time: '2025-07-24 09:30',
    status: '未读',
  },
  {
    id: 2,
    title: '实名认证已通过',
    category: '认证消息',
    source: '认证系统',
    time: '2025-07-24 08:15',
    status: '已读',
  },
  {
    id: 3,
    title: '子账号创建成功',
    category: '新建子账号消息',
    source: '运营平台',
    time: '2025-07-23 18:40',
    status: '未读',
  },
  {
    id: 4,
    title: '算力资源即将到期提醒',
    category: '需求任务消息',
    source: '资源调度',
    time: '2025-07-23 16:20',
    status: '已读',
  },
];

export const messageCategories = [
  {
    id: 1,
    name: '需求任务消息',
    code: 'CAT-TASK',
    desc: '算力需求相关通知',
    status: '启用',
  },
  {
    id: 2,
    name: '认证消息',
    code: 'CAT-AUTH',
    desc: '实名/资质认证通知',
    status: '启用',
  },
  {
    id: 3,
    name: '新建子账号消息',
    code: 'CAT-SUB',
    desc: '子账号开通通知',
    status: '停用',
  },
];

export const messageTemplates = [
  {
    id: 1,
    name: '开通申请提醒',
    category: '需求任务消息',
    title: '【算力网】您的开通申请待审批',
    status: '启用',
  },
  {
    id: 2,
    name: '认证通过通知',
    category: '认证消息',
    title: '【算力网】实名认证已通过',
    status: '启用',
  },
  {
    id: 3,
    name: '子账号开通通知',
    category: '新建子账号消息',
    title: '【算力网】子账号已创建成功',
    status: '停用',
  },
];

export const messagePushList = [
  {
    id: 1,
    task: '紧急停机预警',
    scope: '全体运维',
    channel: '短信',
    status: '已推送',
    time: '2025-07-24 09:00',
  },
  {
    id: 2,
    task: '版本发布通知',
    scope: '指定用户组',
    channel: '站内信',
    status: '已推送',
    time: '2025-07-23 18:00',
  },
  {
    id: 3,
    task: '认证结果同步',
    scope: '王芳',
    channel: '邮件',
    status: '推送中',
    time: '2025-07-24 09:40',
  },
];

export const approvalTodoList = [
  {
    id: 1,
    title: '华东算力开通申请',
    bizType: '需求任务',
    applicant: '张明',
    time: '2025-07-24 09:10',
    status: '即将超时',
  },
  {
    id: 2,
    title: '企业资质认证申请',
    bizType: '认证',
    applicant: '李雷',
    time: '2025-07-24 08:40',
    status: '待审批',
  },
  {
    id: 3,
    title: '新建子账号申请',
    bizType: '新建子账号',
    applicant: '王芳',
    time: '2025-07-23 17:20',
    status: '已超时',
  },
];

export const approvalHistoryList = [
  {
    id: 1,
    title: '华南算力扩容申请',
    approver: '李伟',
    opinion: '同意，资源充足',
    time: '2025-07-22 15:30',
    result: '通过',
  },
  {
    id: 2,
    title: '企业资质认证',
    approver: '系统管理员',
    opinion: '材料不全，请补充营业执照',
    time: '2025-07-21 11:05',
    result: '驳回',
  },
  {
    id: 3,
    title: '子账号开通申请',
    approver: '赵敏',
    opinion: '同意开通',
    time: '2025-07-20 16:48',
    result: '通过',
  },
];
