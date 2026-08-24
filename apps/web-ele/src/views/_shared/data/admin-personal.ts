/** 个人中心 mock */

export const profileOverview = {
  accountStatus: '正常',
  verified: true,
  securityLevel: '高',
  devices: 2,
  todos: 3,
};

export const profileFields = [
  {
    id: 1,
    field: '姓名',
    value: '张明',
    verify: '已校验',
    remark: '实名认证',
  },
  {
    id: 2,
    field: '手机号',
    value: '138****6021',
    verify: '已校验',
    remark: '已绑定',
  },
  {
    id: 3,
    field: '邮箱',
    value: 'zhangming@example.com',
    verify: '待校验',
    remark: '用于通知',
  },
  {
    id: 4,
    field: '所属组织',
    value: '华东算力运营中心',
    verify: '已校验',
    remark: '总部下属',
  },
  {
    id: 5,
    field: '角色',
    value: '管理员',
    verify: '已校验',
    remark: '系统管理权限',
  },
  {
    id: 6,
    field: '注册时间',
    value: '2024-03-12',
    verify: '已校验',
    remark: '-',
  },
];

export const contactList = [
  {
    id: 1,
    type: '手机号',
    value: '138****6821',
    status: '已验证',
    lastVerify: '2025-07-01',
  },
  {
    id: 2,
    type: '邮箱',
    value: 'zhangming@example.com',
    status: '已验证',
    lastVerify: '2025-06-15',
  },
];

export const passwordChecks = [
  {
    id: 1,
    item: '强度校验',
    result: '通过',
    desc: '长度≥8且含大小写数字',
  },
  {
    id: 2,
    item: '历史密码比对',
    result: '通过',
    desc: '未与近5次重复',
  },
  {
    id: 3,
    item: '两次一致',
    result: '通过',
    desc: '新密码与确认一致',
  },
];

export const activeSessions = [
  {
    id: 1,
    session: 'Web 会话 (Chrome)',
    device: 'Windows PC',
    status: '活跃',
  },
  {
    id: 2,
    session: '移动端会话',
    device: 'iOS App',
    status: '活跃',
  },
];

export const loginRecords = [
  {
    id: 1,
    time: '2025-07-24 09:12',
    ip: '10.12.3.45',
    device: 'Windows PC / Chrome',
    status: '成功',
  },
  {
    id: 2,
    time: '2025-07-23 18:40',
    ip: '10.12.3.45',
    device: 'Windows PC / Chrome',
    status: '成功',
  },
  {
    id: 3,
    time: '2025-07-22 08:05',
    ip: '203.0.113.8',
    device: 'iOS App',
    status: '失败',
  },
  {
    id: 4,
    time: '2025-07-21 22:18',
    ip: '198.51.100.22',
    device: '未知设备',
    status: '失败',
  },
  {
    id: 5,
    time: '2025-07-20 11:03',
    ip: '10.12.3.45',
    device: 'Windows PC / Edge',
    status: '成功',
  },
];
