/** 策略校核算法 mock */

export const preWarningRules = [
  {
    id: 'WR-01',
    name: '算力过载预警',
    scope: '区域调度',
    threshold: 'GPU 利用率 > 85%',
    level: '高',
    status: '启用',
    hits: 12,
  },
  {
    id: 'WR-02',
    name: '电价窗口偏离',
    scope: '策略校核',
    threshold: '偏离谷段 > 15min',
    level: '中',
    status: '启用',
    hits: 6,
  },
  {
    id: 'WR-03',
    name: '碳排强度超标',
    scope: '电碳算模型',
    threshold: '强度 > 0.55 kg/kWh',
    level: '高',
    status: '启用',
    hits: 4,
  },
  {
    id: 'WR-04',
    name: '跨域带宽抖动',
    scope: '任务调度',
    threshold: '抖动率 > 12%',
    level: '中',
    status: '停用',
    hits: 0,
  },
];

export const preWarningAlerts = [
  {
    id: 'PA-1001',
    time: '2026-03-12 14:22',
    rule: '算力过载预警',
    target: '贵阳核心 / LLM-SFT',
    level: '高',
    forecast: '预计 30min 内 GPU 达 92%',
    status: '待处理',
  },
  {
    id: 'PA-1000',
    time: '2026-03-12 11:08',
    rule: '碳排强度超标',
    target: '遵义节点 / 批处理',
    level: '高',
    forecast: '净碳排强度 0.58 kg/kWh',
    status: '已确认',
  },
  {
    id: 'PA-0998',
    time: '2026-03-11 22:40',
    rule: '电价窗口偏离',
    target: '安顺节点 / 推理池',
    level: '中',
    forecast: '调度窗口偏离 22min',
    status: '已忽略',
  },
];

export const attributionEvents = [
  {
    id: 'EV-2401',
    name: '跨域调度失败',
    time: '2026-03-11 09:18',
    impact: '高',
    root: '带宽瞬时抖动 + 策略权重冲突',
    confidence: '91%',
    status: '已归因',
  },
  {
    id: 'EV-2398',
    name: '策略校核未通过',
    time: '2026-03-10 16:42',
    impact: '中',
    root: 'PUE 假设值与实测偏差 8%',
    confidence: '86%',
    status: '已归因',
  },
  {
    id: 'EV-2395',
    name: '模型预测偏差过大',
    time: '2026-03-09 21:05',
    impact: '中',
    root: '训练样本覆盖不足（边缘推理）',
    confidence: '78%',
    status: '复核中',
  },
];

export const attributionFactors = [
  { factor: '网络带宽', weight: 38, color: '#409eff' },
  { factor: '策略参数', weight: 26, color: '#67c23a' },
  { factor: '资源争用', weight: 18, color: '#e6a23c' },
  { factor: '数据质量', weight: 12, color: '#909399' },
  { factor: '其它', weight: 6, color: '#c0c4cc' },
];

export const optimizeJobs = [
  {
    id: 'OPT-88',
    model: '电碳算预测 v2.3',
    trigger: '精度低于 88%',
    before: '86.2%',
    after: '91.4%',
    params: '学习率 ↓、样本加权',
    status: '已完成',
    time: '2026-03-12 06:00',
  },
  {
    id: 'OPT-87',
    model: '策略校核 v2.4',
    trigger: '损失函数震荡',
    before: '0.082',
    after: '0.041',
    params: '正则化 ↑、窗口 7→14',
    status: '运行中',
    time: '2026-03-12 13:20',
  },
  {
    id: 'OPT-86',
    model: '事前预警 v1.6',
    trigger: '误报率 > 8%',
    before: '9.6%',
    after: '5.2%',
    params: '阈值动态化',
    status: '排队中',
    time: '-',
  },
];

export const fusionModels = [
  { name: '算力预测模型 A', weight: 35, score: 0.912, status: '在线' },
  { name: '电力预测模型 B', weight: 30, score: 0.886, status: '在线' },
  { name: '碳排预测模型 C', weight: 25, score: 0.874, status: '在线' },
  { name: '成本预测模型 D', weight: 10, score: 0.851, status: '降级' },
];

export const fusionResults = [
  {
    task: 'LLM-SFT-贵阳',
    single: '86.4 PFLOPS',
    fused: '84.8 PFLOPS',
    delta: '-1.9%',
    confidence: '93%',
  },
  {
    task: '客服推理池',
    single: '920 QPS',
    fused: '948 QPS',
    delta: '+3.0%',
    confidence: '90%',
  },
  {
    task: '批处理-C',
    single: '334 kWh',
    fused: '318 kWh',
    delta: '-4.8%',
    confidence: '88%',
  },
];

export const kbStats = [
  { key: 'history', label: '历史运行记录', value: '12,480', icon: '🕐' },
  { key: 'version', label: '策略模型版本', value: 'v2.4.1', icon: '🔗' },
  { key: 'entries', label: '知识条目总数', value: '856', icon: '🗄' },
  { key: 'freq', label: '模型更新频率', value: '24h/次', icon: '↻' },
];

export const kbTrainingTrend = {
  dates: ['02-24', '02-25', '02-26', '02-27', '02-28', '02-29', '03-01'],
  accuracy: [82, 84, 85, 86, 87, 88, 89],
  loss: [0.12, 0.1, 0.09, 0.08, 0.07, 0.06, 0.05],
};

export const kbRecentUpdates = [
  {
    id: 'KB-001',
    title: '大模型训练资源调度策略优化经验',
    time: '10 分钟前',
    tone: 'new',
  },
  {
    id: 'KB-002',
    title: '策略模型 v2.4.1 完成增量训练',
    time: '2 小时前',
    tone: 'ok',
  },
  {
    id: 'KB-003',
    title: '跨数据中心带宽抖动归因库更新',
    time: '5 小时前',
    tone: 'warn',
  },
  {
    id: 'KB-004',
    title: '绿电优先调度算法经验沉淀',
    time: '1 天前',
    tone: 'ok',
  },
];

export const kbEntries = [
  {
    id: 'KB-856',
    category: '调度策略',
    title: '谷段窗口偏移补偿规则',
    source: '历史运行',
    version: 'v2.4.1',
    updated: '2026-03-12',
  },
  {
    id: 'KB-855',
    category: '归因经验',
    title: '跨域带宽抖动典型模式',
    source: '事后归因',
    version: 'v2.4.0',
    updated: '2026-03-11',
  },
  {
    id: 'KB-854',
    category: '模型优化',
    title: '碳排预测样本加权方案',
    source: '自优化',
    version: 'v2.3.2',
    updated: '2026-03-10',
  },
];
