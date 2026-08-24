/** 告警管理 mock */

export const alarmCategories = [
  {
    id: 1,
    name: '算力资源告警',
    code: 'AC-COMP',
    biz: '算力资源',
    rules: '通知规则-001',
    status: '启用',
  },
  {
    id: 2,
    name: '需求任务告警',
    code: 'AC-TASK',
    biz: '需求任务',
    rules: '通知规则-002',
    status: '启用',
  },
  {
    id: 3,
    name: '策略校核告警',
    code: 'AC-STGY',
    biz: '策略',
    rules: '通知规则-003',
    status: '停用',
  },
  {
    id: 4,
    name: '系统运行告警',
    code: 'AC-SYS',
    biz: '系统运行',
    rules: '通知规则-004',
    status: '启用',
  },
];

export const alarmLevels = [
  {
    id: 1,
    name: '紧急',
    code: 'L1',
    biz: '算力资源',
    severity: '紧急',
    color: '红色',
    status: '启用',
  },
  {
    id: 2,
    name: '重要',
    code: 'L2',
    biz: '需求任务',
    severity: '重要',
    color: '橙色',
    status: '启用',
  },
  {
    id: 3,
    name: '次要',
    code: 'L3',
    biz: '策略',
    severity: '次要',
    color: '蓝色',
    status: '启用',
  },
  {
    id: 4,
    name: '提示',
    code: 'L4',
    biz: '系统运行',
    severity: '提示',
    color: '灰色',
    status: '停用',
  },
];

export const alarmRules = [
  {
    id: 1,
    name: '算力负载超阈值',
    type: '阈值超限',
    condition: 'CPU 使用率 > 90% 持续 5min',
    level: '紧急',
    status: '启用',
  },
  {
    id: 2,
    name: '节点离线检测',
    type: '离线',
    condition: '心跳丢失 > 3min',
    level: '重要',
    status: '启用',
  },
  {
    id: 3,
    name: '策略校核异常',
    type: '状态异常',
    condition: '策略输出偏离基线 > 15%',
    level: '重要',
    status: '停用',
  },
  {
    id: 4,
    name: '存储容量预警',
    type: '阈值超限',
    condition: '磁盘使用率 > 85%',
    level: '次要',
    status: '启用',
  },
];

export const alarmPending = [
  {
    id: 1,
    title: '华东机房算力负载超阈值',
    category: '算力资源',
    level: '紧急',
    time: '2025-07-24 09:12',
    status: '待处理',
    owner: '王芳',
  },
  {
    id: 2,
    title: '策略校核输出偏离基线',
    category: '策略',
    level: '重要',
    time: '2025-07-24 08:45',
    status: '处理中',
    owner: '李雷',
  },
  {
    id: 3,
    title: '存储集群容量预警',
    category: '系统运行',
    level: '次要',
    time: '2025-07-24 07:30',
    status: '已处理',
    owner: '张明',
  },
  {
    id: 4,
    title: '需求任务排队超时',
    category: '需求任务',
    level: '重要',
    time: '2025-07-23 22:18',
    status: '已忽略',
    owner: '-',
  },
];

export const alarmNotifyRealtime = [
  {
    id: 1,
    level: '紧急',
    type: '算力资源',
    time: '2025-07-24 09:12',
    source: '华东机房-分区A',
    status: '待处理',
  },
  {
    id: 2,
    level: '重要',
    type: '策略',
    time: '2025-07-24 08:55',
    source: '策略校核引擎',
    status: '处理中',
  },
  {
    id: 3,
    level: '次要',
    type: '系统运行',
    time: '2025-07-24 08:20',
    source: '存储集群',
    status: '已处理',
  },
  {
    id: 4,
    level: '提示',
    type: '需求任务',
    time: '2025-07-24 07:05',
    source: '任务调度服务',
    status: '已处理',
  },
];

export const strategyAlarmKpis = [
  { label: '实时待处理', value: '2', tag: 'CRITICAL', tone: 'danger' },
  { label: '今日告警总量', value: '3', tag: 'TOTAL', tone: 'mute' },
  { label: '平均响应时间', value: '12.5m', tag: 'RESPONSE', tone: 'info' },
  { label: '闭环处置率', value: '94.2%', tag: 'CLOSED', tone: 'ok' },
];

export const strategyAlarmRows = [
  {
    id: 'ALM-996573',
    title: '策略校核输出偏离基线',
    level: '致命',
    type: '策略校核异常',
    task: '电价优先实时调度',
    status: '待处理',
    time: '2026-03-12 14:22',
  },
  {
    id: 'ALM-20240302-002',
    title: '资源调度冲突',
    level: '警告',
    type: '资源调度冲突',
    task: '跨域算力迁移',
    status: '处理中',
    time: '2026-03-12 13:08',
  },
  {
    id: 'ALM-20240301-018',
    title: '校核规则阈值触发',
    level: '提示',
    type: '阈值超限',
    task: '碳优策略校核',
    status: '已处理',
    time: '2026-03-11 18:40',
  },
];

export const strategyLevelPie = [
  { name: '致命', value: 4, color: '#f56c6c' },
  { name: '警告', value: 12, color: '#e6a23c' },
  { name: '提示', value: 8, color: '#409eff' },
];
