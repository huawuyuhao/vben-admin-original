/** 全景看板 mock 数据 */

export const dcStats = [
  { label: '服务器总数', value: '12,860', unit: '台', icon: '🖥' },
  { label: 'GPU 卡数', value: '48,320', unit: '卡', icon: '🎮' },
  { label: '算力内存', value: '1.86', unit: 'PB', icon: '💾' },
  { label: '存储容量', value: '62.4', unit: 'PB', icon: '📦' },
  { label: 'CPU 利用率', value: '68.2', unit: '%', icon: '⚙' },
  { label: 'GPU 利用率', value: '81.5', unit: '%', icon: '🔥' },
  { label: '网络带宽', value: '920', unit: 'Gbps', icon: '🌐' },
  { label: '机柜占用', value: '74.6', unit: '%', icon: '🏢' },
];

export const aiScenes = [
  { label: '场景总数', value: 770, tone: 'cyan' },
  { label: '已建成', value: 207, tone: 'green' },
  { label: '建设中', value: 207, tone: 'blue' },
  { label: '拟建', value: 356, tone: 'orange' },
];

export const sceneTop5 = [
  { name: '配电自动化', value: 186 },
  { name: '新能源消纳', value: 152 },
  { name: '市场营销', value: 128 },
  { name: '设备巡检', value: 98 },
  { name: '负荷预测', value: 76 },
];

export const kpiBubbles = [
  { label: '全网算力', value: '486', unit: 'PFLOPS' },
  { label: '本地算力', value: '312', unit: 'PFLOPS' },
  { label: '占比', value: '64.2', unit: '%' },
  { label: '外部算力', value: '174', unit: 'PFLOPS' },
];

export const mapNodes = [
  { name: '贵阳核心', x: 48, y: 42, status: 'online' },
  { name: '遵义节点', x: 52, y: 28, status: 'online' },
  { name: '毕节边缘', x: 28, y: 36, status: 'busy' },
  { name: '安顺节点', x: 38, y: 58, status: 'online' },
  { name: '凯里节点', x: 68, y: 48, status: 'warn' },
  { name: '兴义边缘', x: 32, y: 72, status: 'online' },
  { name: '铜仁节点', x: 78, y: 32, status: 'online' },
];

/** 24 小时任务负荷 / 电价 */
export const hours = Array.from({ length: 25 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`,
);

export const taskLoadSeries = [
  32, 28, 25, 22, 20, 24, 38, 55, 68, 72, 70, 66, 64, 62, 65, 74, 82, 88, 80,
  70, 58, 48, 40, 35, 32,
];

export const priceSeries = [
  0.28, 0.28, 0.26, 0.24, 0.22, 0.22, 0.3, 0.42, 0.55, 0.62, 0.58, 0.5, 0.48,
  0.46, 0.5, 0.58, 0.72, 0.85, 0.78, 0.62, 0.48, 0.38, 0.32, 0.3, 0.28,
];

export const taskOps = {
  completed: 128_460,
  energySaved: '286.4',
  physical: 76,
  logical: 82,
  cpu: 68,
  gpu: 81,
};

export const taskQueue = [
  {
    name: '机器学习图像识别',
    status: '运行中',
    strategy: '电价优先',
    app: '视觉巡检平台',
    planStart: '2026-03-15 09:10',
    bias: '低电价窗口',
    dc: '贵阳核心机房',
  },
  {
    name: '新能源出力预测',
    status: '排队中',
    strategy: '碳优调度',
    app: '风光预测服务',
    planStart: '2026-03-15 09:40',
    bias: '绿电优先',
    dc: '遵义节点',
  },
  {
    name: '配电负荷仿真',
    status: '运行中',
    strategy: '时延优先',
    app: '配电仿真引擎',
    planStart: '2026-03-15 08:55',
    bias: '就近计算',
    dc: '安顺节点',
  },
  {
    name: '碳足迹核算批次',
    status: '运行中',
    strategy: '成本优先',
    app: '碳核算中台',
    planStart: '2026-03-15 08:20',
    bias: '错峰执行',
    dc: '毕节边缘',
  },
  {
    name: '设备缺陷检测',
    status: '待启动',
    strategy: '电价优先',
    app: '巡检 AI',
    planStart: '2026-03-15 10:00',
    bias: '谷段启动',
    dc: '凯里节点',
  },
];

export const dispatchTimeline = [
  { time: '08:00', title: '日前计划下发', status: '完成', detail: '区域 A/B 共 126 条' },
  { time: '09:15', title: '日内滚动调优', status: '执行中', detail: '电价波动触发重排' },
  { time: '10:02', title: '跨区算力借用', status: '执行中', detail: '遵义 → 贵阳 32 GPU' },
  { time: '11:30', title: '高峰错峰策略', status: '待执行', detail: '预留绿电窗口' },
];

export const resourcePools = [
  { name: '贵阳核心池', cpu: 72, gpu: 88, mem: 65, storage: 70 },
  { name: '遵义池', cpu: 58, gpu: 64, mem: 52, storage: 48 },
  { name: '毕节边缘池', cpu: 41, gpu: 55, mem: 38, storage: 44 },
  { name: '安顺池', cpu: 66, gpu: 71, mem: 60, storage: 58 },
];

export const taskBoardStats = [
  { label: '运行中', value: 186, color: '#00d8ff' },
  { label: '排队中', value: 64, color: '#ffb74d' },
  { label: '已完成', value: 1284, color: '#69f0ae' },
  { label: '失败/重试', value: 12, color: '#ff5252' },
];

export const systemMetrics = [
  { name: 'API 网关', latency: '42ms', qps: '8.6k', health: 99.9 },
  { name: '调度引擎', latency: '68ms', qps: '2.1k', health: 99.6 },
  { name: '计量服务', latency: '35ms', qps: '5.4k', health: 99.8 },
  { name: '消息总线', latency: '12ms', qps: '18k', health: 99.95 },
];

export const alarms = [
  {
    level: '紧急',
    title: 'GPU 节点超温',
    node: '贵阳-GPU-03',
    time: '09:26:12',
    status: '未确认',
  },
  {
    level: '重要',
    title: '调度延迟超阈值',
    node: '调度引擎',
    time: '09:18:40',
    status: '处理中',
  },
  {
    level: '一般',
    title: '存储水位偏高',
    node: '遵义存储集群',
    time: '08:55:03',
    status: '已确认',
  },
  {
    level: '提示',
    title: '证书即将过期',
    node: 'API 网关',
    time: '08:12:21',
    status: '未确认',
  },
];

export const strategyStates = [
  {
    name: '电价优先策略',
    region: '全网',
    status: '生效',
    passRate: 98.2,
    lastCheck: '09:20:11',
  },
  {
    name: '碳约束策略',
    region: '贵阳核心',
    status: '生效',
    passRate: 96.5,
    lastCheck: '09:20:11',
  },
  {
    name: '时延保障策略',
    region: '边缘节点',
    status: '告警',
    passRate: 88.4,
    lastCheck: '09:18:02',
  },
  {
    name: '跨区借用策略',
    region: '遵义↔贵阳',
    status: '生效',
    passRate: 97.1,
    lastCheck: '09:15:44',
  },
  {
    name: '错峰削峰策略',
    region: '全网',
    status: '待启用',
    passRate: 0,
    lastCheck: '-',
  },
];
