/** 组织管理 mock */

export const orgList = [
  {
    id: 1,
    name: '华东算力运营中心',
    code: 'ORG-HD-001',
    parent: '总部',
    status: '启用',
  },
  {
    id: 2,
    name: '华南运营分部',
    code: 'ORG-HN-002',
    parent: '华东算力运营中心',
    status: '启用',
  },
  {
    id: 3,
    name: '华北企业租户组',
    code: 'ORG-HB-003',
    parent: '总部',
    status: '启用',
  },
  {
    id: 4,
    name: '西南边缘节点组',
    code: 'ORG-XN-004',
    parent: '总部',
    status: '停用',
  },
  {
    id: 5,
    name: '广州交付中心',
    code: 'ORG-GZ-005',
    parent: '华南运营分部',
    status: '启用',
  },
  {
    id: 6,
    name: '贵安智算基地',
    code: 'ORG-GA-006',
    parent: '总部',
    status: '启用',
  },
];

export const orgChangeHistory = [
  {
    id: 1,
    org: '华南运营分部',
    action: '新增',
    operator: '系统管理员',
    time: '2025-07-20 10:12',
    remark: '创建组织并挂靠华东',
  },
  {
    id: 2,
    org: '华北企业租户组',
    action: '编辑',
    operator: '系统管理员',
    time: '2025-07-18 15:40',
    remark: '调整上级组织为总部',
  },
  {
    id: 3,
    org: '华东算力运营中心',
    action: '停用',
    operator: '系统管理员',
    time: '2025-07-15 09:22',
    remark: '组织临时停用',
  },
  {
    id: 4,
    org: '广州交付中心',
    action: '新增',
    operator: '系统管理员',
    time: '2025-07-12 14:05',
    remark: '新建交付中心挂靠华南运营分部',
  },
  {
    id: 5,
    org: '西南边缘节点组',
    action: '编辑',
    operator: '系统管理员',
    time: '2025-07-10 11:30',
    remark: '更新组织编码与联系人',
  },
  {
    id: 6,
    org: '贵安智算基地',
    action: '新增',
    operator: '系统管理员',
    time: '2025-07-08 16:18',
    remark: '新建智算基地组织节点',
  },
];
