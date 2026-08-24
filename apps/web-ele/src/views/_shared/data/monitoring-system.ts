/** 系统运行管理 mock */

export const auditLoginLogs = [
  {
    id: 1,
    user: '张工',
    dept: '技术部',
    time: '2023-09-15 09:23:45',
    ip: '192.168.1.101',
    location: '上海市 电信',
    device: 'Windows 10 · Chrome 116.0',
    status: '成功',
    reason: '-',
  },
  {
    id: 2,
    user: '李工',
    dept: '运维部',
    time: '2023-09-15 08:15:22',
    ip: '192.168.1.102',
    location: '上海市 电信',
    device: 'macOS 13.5 · Safari 16.6',
    status: '成功',
    reason: '-',
  },
  {
    id: 3,
    user: '王工',
    dept: '数据中心',
    time: '2023-09-15 07:45:10',
    ip: '10.0.0.15',
    location: '机房内网',
    device: 'Linux · Chrome 115.0',
    status: '成功',
    reason: '-',
  },
  {
    id: 4,
    user: '赵工',
    dept: '技术部',
    time: '2023-09-14 22:08:33',
    ip: '203.0.113.45',
    location: '贵阳市 联通',
    device: 'Windows 11 · Edge 118.0',
    status: '失败',
    reason: '密码错误',
  },
  {
    id: 5,
    user: '陈工',
    dept: '运维部',
    time: '2023-09-14 18:42:01',
    ip: '10.0.0.28',
    location: '机房内网',
    device: 'Linux · Firefox 117.0',
    status: '成功',
    reason: '-',
  },
];

export const auditOpLogs = [
  {
    id: 1,
    user: '张工',
    module: '策略校核',
    action: '发布策略',
    time: '2026-03-12 14:20:11',
    result: '成功',
  },
  {
    id: 2,
    user: '李工',
    module: '告警管理',
    action: '确认告警',
    time: '2026-03-12 13:05:44',
    result: '成功',
  },
  {
    id: 3,
    user: '王工',
    module: '数据统计',
    action: '导出报表',
    time: '2026-03-12 11:18:02',
    result: '成功',
  },
];

export const strategyReports = [
  {
    id: '327-001',
    title: '大模型训练资源调度校核报告 · 20240301',
    time: '2024-03-01 16:30',
    category: '策略校核',
    risk: '高风险',
  },
  {
    id: '327-002',
    title: '绿电优先调度策略运行分析 · 20240228',
    time: '2024-02-28 11:20',
    category: '运行分析',
    risk: '中风险',
  },
  {
    id: '327-003',
    title: '跨域算力迁移效能监控报告 · 20240225',
    time: '2024-02-25 09:45',
    category: '效能监控',
    risk: '低风险',
  },
  {
    id: '327-004',
    title: '电价优先实时策略校核报告 · 20240220',
    time: '2024-02-20 15:10',
    category: '策略校核',
    risk: '中风险',
  },
];

export const reportVersions = [
  { version: 'v1.2', date: '2024-03-01', current: true },
  { version: 'v1.1', date: '2024-02-25', current: false },
];

export const runtimeMetrics = [
  {
    label: 'CPU 使用率',
    value: '42.5%',
    pct: 42.5,
    tone: 'blue',
    status: '正常',
  },
  {
    label: '内存 占用率',
    value: '68.2%',
    pct: 68.2,
    tone: 'orange',
    status: '正常',
  },
  {
    label: '磁盘 空闲率',
    value: '54.8%',
    pct: 54.8,
    tone: 'blue',
    status: '正常',
  },
  {
    label: '网络 吞吐量',
    value: '2.05 GB/s',
    pct: 22,
    tone: 'green',
    status: '正常',
  },
];

export const runtimeHours = [
  '0:00',
  '4:00',
  '8:00',
  '12:00',
  '16:00',
  '20:00',
  '23:00',
];
export const runtimeCpu = [28, 32, 45, 58, 43, 38, 35];
export const runtimeMem = [52, 55, 60, 68, 65, 62, 58];

export const healthChecks = [
  {
    name: '核心策略引擎',
    status: '运行正常',
    ok: true,
    detail: '延迟: 12ms | 结果: 10秒前',
  },
  {
    name: '分布式计算集群',
    status: '运行正常',
    ok: true,
    detail: '延迟: 45ms | 结果: 15秒前',
  },
  {
    name: 'PostgreSQL 数据库',
    status: '运行正常',
    ok: true,
    detail: '延迟: 5ms | 结果: 5秒前',
  },
  {
    name: 'Redis 缓存集群',
    status: '运行正常',
    ok: true,
    detail: '延迟: 2ms | 结果: 2秒前',
  },
  {
    name: '消息队列 (Kafka)',
    status: '运行正常',
    ok: true,
    detail: '延迟: 18ms | 结果: 20秒前',
  },
  {
    name: '外部气象数据接口',
    status: '响应迟缓',
    ok: false,
    detail: '延迟: 850ms | 结果: 1分钟前',
  },
];
