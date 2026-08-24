/** 流程配置 mock */

export const workflowDesignList = [
  {
    id: 1,
    name: '算力资源开通流程',
    nodes: 6,
    type: '并行',
    created: '2025-07-15',
    status: '已发布',
  },
  {
    id: 2,
    name: '需求任务审批流程',
    nodes: 4,
    type: '串行',
    created: '2025-07-12',
    status: '已发布',
  },
  {
    id: 3,
    name: '子账号开通流程',
    nodes: 3,
    type: '串行',
    created: '2025-07-08',
    status: '草稿',
  },
  {
    id: 4,
    name: '合同变更审批流程',
    nodes: 5,
    type: '并行',
    created: '2025-07-05',
    status: '已发布',
  },
];

export const workflowApprovalList = [
  {
    id: 1,
    name: '算力资源开通流程',
    nodes: '运营初审 → 合规复审',
    limit: '48h',
    warn: '提前 4h',
    status: '启用',
  },
  {
    id: 2,
    name: '需求任务审批流程',
    nodes: '业务负责人 → 运营确认',
    limit: '24h',
    warn: '提前 2h',
    status: '启用',
  },
  {
    id: 3,
    name: '子账号开通流程',
    nodes: '企业管理员 → 平台审核',
    limit: '72h',
    warn: '-',
    status: '停用',
  },
];

export const workflowVersionList = [
  {
    id: 1,
    name: '算力资源开通流程',
    version: 'v1.3',
    created: '2025-07-15',
    diff: '新增并行分支',
    status: '当前',
  },
  {
    id: 2,
    name: '算力资源开通流程',
    version: 'v1.2',
    created: '2025-06-30',
    diff: '调整时限',
    status: '历史',
  },
  {
    id: 3,
    name: '需求任务审批流程',
    version: 'v2.0',
    created: '2025-07-12',
    diff: '重构节点',
    status: '当前',
  },
  {
    id: 4,
    name: '需求任务审批流程',
    version: 'v1.5',
    created: '2025-06-20',
    diff: '新增抄送节点',
    status: '历史',
  },
];

export const workflowRoleList = [
  {
    id: 1,
    name: '流程发起人',
    duty: '提交并跟踪流程',
    perms: '发起 / 查看',
    status: '启用',
  },
  {
    id: 2,
    name: '流程审批人',
    duty: '审批与退回',
    perms: '审批 / 回退',
    status: '启用',
  },
  {
    id: 3,
    name: '流程管理员',
    duty: '全流程配置',
    perms: '配置 / 发布',
    status: '启用',
  },
];

export const workflowPermissionList = [
  {
    id: 1,
    flow: '算力资源开通流程',
    target: '流程发起人',
    access: '允许',
    edit: '允许',
    approve: '拒绝',
  },
  {
    id: 2,
    flow: '算力资源开通流程',
    target: '流程审批人',
    access: '允许',
    edit: '拒绝',
    approve: '允许',
  },
  {
    id: 3,
    flow: '需求任务审批流程',
    target: '业务负责人',
    access: '允许',
    edit: '允许',
    approve: '允许',
  },
];
