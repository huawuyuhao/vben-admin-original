/** 监测管理 - 数据统计 mock */

export const taskStatsKpis = [
  {
    label: '总任务量',
    current: '128,563',
    compare: '114,333',
    period: '3月 vs 2月',
    change: '+12.4%',
    up: true,
  },
  {
    label: '任务完成率',
    current: '98.2%',
    compare: '95.9%',
    period: '3月 vs 2月',
    change: '+2.3%',
    up: true,
  },
  {
    label: '平均处理时长',
    current: '14.3 分钟/月',
    compare: '13.5 分钟/月',
    period: '3月 vs 2月',
    change: '-5.9%',
    up: false,
  },
  {
    label: '平均排队等待时长',
    current: '2.7 分钟/月',
    compare: '2.4 分钟/月',
    period: '3月 vs 2月',
    change: '-12.5%',
    up: false,
  },
];

export const taskTrendDays = [
  '3/1',
  '3/5',
  '3/10',
  '3/15',
  '3/20',
  '3/25',
  '3/31',
];

export const taskTrendCurrent = [6200, 7100, 7800, 8200, 8600, 9100, 9300];
export const taskTrendPrev = [5800, 6500, 7200, 7600, 7900, 8200, 8400];
export const taskGrowth = [6.9, 9.2, 8.3, 7.9, 8.9, 11.0, 10.7];

export const taskDurationBuckets = [
  '0-5min',
  '5-10min',
  '10-30min',
  '30-60min',
  '1-2hr',
  '2-6hr',
  '6hr+',
];
export const taskDurationCounts = [42, 68, 120, 86, 54, 28, 12];

export const taskQueueBuckets = [
  '0-1min',
  '1-2min',
  '2-5min',
  '5-10min',
  '10-30min',
  '30-60min',
  '60min+',
];
export const taskQueueCounts = [95, 82, 64, 38, 18, 8, 3];

export const deviceStatsKpis = [
  {
    label: '设备总数',
    value: '12,458',
    trend: '↑ 12.5% 较上月',
    up: true,
    tone: 'blue',
  },
  {
    label: '设备健康度',
    value: '94.2%',
    trend: '↑ 2.1% 较上月',
    up: true,
    tone: 'green',
  },
  {
    label: '平均在线率',
    value: '98.7%',
    trend: '↓ 0.3% 较上月',
    up: false,
    tone: 'purple',
  },
  {
    label: '月度总在线时长',
    value: '8.7M',
    unit: '小时',
    trend: '',
    up: true,
    tone: 'orange',
  },
];

export const deviceTypePie = [
  { name: 'GPU服务器', value: 3528, pct: '28.3%' },
  { name: 'CPU服务器', value: 4216, pct: '33.8%' },
  { name: '存储设备', value: 2138, pct: '17.2%' },
  { name: '网络设备', value: 1572, pct: '12.6%' },
  { name: '边缘节点', value: 1004, pct: '8.1%' },
];

export const deviceStatusPie = [
  { name: '运行中', value: 8732, pct: '70.1%' },
  { name: '待机中', value: 2984, pct: '24.0%' },
  { name: '维护中', value: 423, pct: '3.4%' },
  { name: '故障中', value: 319, pct: '2.5%' },
  { name: '已下线', value: 0, pct: '0.0%' },
];

export const deviceCountMonths = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];
export const deviceSupply = [820, 860, 900, 940, 980, 1020, 1060, 1100, 1140, 1180, 1200, 123];
export const deviceOwn = [420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 610, 62];

export const deviceOnlineRegions = ['分区A', '分区B', '分区C', '分区D', '分区E', '分区F'];
export const deviceOnlineLast = [82, 76, 88, 70, 85, 79];
export const deviceOnlineCurrent = [94, 86, 92, 78, 91, 84];

export const userStatsKpis = [
  { label: '注册用户总数', value: '28,640', trend: '+8.6% 较上月', up: true },
  { label: '月活跃用户', value: '12,380', trend: '+5.2% 较上月', up: true },
  { label: '企业客户数', value: '486', trend: '+3.1% 较上月', up: true },
  { label: '用户留存率', value: '76.4%', trend: '+1.8% 较上月', up: true },
];

export const userTypePie = [
  { name: '算力供给用户', value: 42 },
  { name: '算力需求用户', value: 35 },
  { name: '平台运营', value: 8 },
  { name: '企业管理员', value: 15 },
];

export const userGrowthMonths = ['10月', '11月', '12月', '1月', '2月', '3月'];
export const userNew = [820, 960, 1100, 1240, 1380, 1520];
export const userActive = [9200, 9800, 10400, 11000, 11600, 12380];

export const userRegionRows = [
  { region: '贵阳', users: 8420, enterprise: 128, active: 3680 },
  { region: '遵义', users: 5620, enterprise: 86, active: 2420 },
  { region: '安顺', users: 4860, enterprise: 72, active: 2180 },
  { region: '毕节', users: 3240, enterprise: 48, active: 1420 },
];

export const monitorStatsKpis = [
  { label: '告警总数', value: '34' },
  { label: '资源使用率', value: '89%' },
  { label: 'CPU 利用率', value: '20%' },
  { label: 'GPU 利用率', value: '80%' },
];

export const monitorAlarmTypes = [
  { name: '资源告警', value: 12 },
  { name: '性能告警', value: 8 },
  { name: '网络告警', value: 6 },
  { name: '策略告警', value: 5 },
  { name: '其它', value: 3 },
];

export const monitorResourceTrendHours = [
  '0:00',
  '4:00',
  '8:00',
  '12:00',
  '16:00',
  '20:00',
  '22:00',
];
export const monitorResourceUsage = [42, 38, 55, 72, 85, 78, 62];

export const monitorAlarmLevelDays = ['6-14', '6-15', '6-16', '6-17', '6-18', '6-19', '6-20'];
export const monitorAlarmGeneral = [8, 6, 10, 7, 9, 5, 6];
export const monitorAlarmSerious = [3, 2, 4, 3, 2, 1, 2];
export const monitorAlarmUrgent = [1, 0, 2, 1, 1, 0, 1];

export const monitorResourceTypes = ['计算', '存储', '网络'];
export const monitorResourceTotal = [820, 640, 480];
export const monitorResourceUsed = [672, 416, 341];

export const monitorStrategyEvents = [
  {
    time: '2026-06-20 14:22',
    type: '策略告警',
    name: '电价优先实时调度',
    result: '成功',
    level: '一般',
  },
  {
    time: '2026-06-20 13:08',
    type: '校核通过',
    name: '碳优跨域调度',
    result: '成功',
    level: '提示',
  },
  {
    time: '2026-06-20 11:45',
    type: '高危预警',
    name: '算力过载校核',
    result: '待优化',
    level: '紧急',
  },
];

export const carbonStatsKpis = [
  {
    label: '累计碳排放总量 (kg)',
    value: '128,563.24',
    yoy: '同比上涨 4.2%',
    up: true,
  },
  {
    label: '今日碳排放 (kg)',
    value: '1,258.76',
    yoy: '同比上涨 8.7%',
    up: true,
    warn: true,
  },
  {
    label: '绿色电力使用比例',
    value: '68.3%',
    yoy: '同比上涨 5.6%',
    up: true,
  },
  {
    label: '算力任务总数',
    value: '8,542',
    yoy: '同比上涨 12.3%',
    up: true,
  },
];

export const carbonTrendWeeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'];
export const carbonTotal = [980, 1050, 1120, 1180, 1250, 1320];
export const carbonGreen = [620, 680, 720, 780, 840, 900];

export const carbonStrategyBars = [
  { name: '时间优先', value: 86 },
  { name: '低价优先', value: 72 },
  { name: '绿电优先', value: 58 },
];

export const carbonTaskTypePie = [
  { name: '普通任务', value: 78.5 },
  { name: '训练任务', value: 12.3 },
  { name: '推理任务', value: 6.8 },
  { name: '其它', value: 2.4 },
];

export const componentKpis = [
  { label: '全网总算力', value: '15,840', unit: 'TFLOPS', tip: '较上月 ▲ 8.3%', tone: 'blue' },
  { label: '接入节点数', value: '246', unit: '个', tip: '在线 238 / 离线 8', tone: 'purple' },
  { label: '平均资源利用率', value: '73.6', unit: '%', tip: 'GPU峰值 92.4%', tone: 'green' },
  { label: '整体健康度', value: '91.2', unit: '分', tip: '告警节点 15 个', tone: 'orange' },
];

export const componentTrendHours = [
  '00:00',
  '04:00',
  '08:00',
  '12:00',
  '16:00',
  '20:00',
  '22:00',
];
export const componentTrendCpu = [45, 42, 58, 72, 78, 68, 55];
export const componentTrendGpu = [52, 48, 65, 82, 92, 85, 70];

export const componentHealthPie = [
  { name: '正常', value: 55 },
  { name: '关注', value: 20 },
  { name: '告警', value: 12 },
  { name: '故障', value: 8 },
  { name: '离线', value: 5 },
];

export const componentFeatures = [
  {
    title: '资源状态感知与数据采集',
    desc: '多源异构节点统一纳管，自动发现与多协议监测，链路健康感知。',
  },
  {
    title: '统一度量与资源画像',
    desc: '标准算力度量模型，多维评估与实时画像更新，供需分析支撑。',
  },
  {
    title: '全景可视化与态势呈现',
    desc: '地理分布、拓扑关系、热力趋势，一图呈现全网算力态势。',
  },
  {
    title: '智能告警与数据服务',
    desc: '自适应告警触发，时序故障预测，影响评估与标准化数据接口。',
  },
];

export const componentNodes = [
  {
    name: 'GPU-Cluster-BJ-01',
    type: 'GPU集群',
    region: '华北',
    util: '82%',
    health: '94分',
    alarms: 0,
    status: '正常采集',
  },
  {
    name: 'CPU-Pool-GY-02',
    type: 'CPU池',
    region: '西南',
    util: '68%',
    health: '88分',
    alarms: 1,
    status: '正常采集',
  },
  {
    name: 'Storage-SH-03',
    type: '存储节点',
    region: '华东',
    util: '54%',
    health: '91分',
    alarms: 0,
    status: '正常采集',
  },
  {
    name: 'Edge-AV-04',
    type: '边缘节点',
    region: '西南',
    util: '76%',
    health: '72分',
    alarms: 3,
    status: '告警采集',
  },
];
