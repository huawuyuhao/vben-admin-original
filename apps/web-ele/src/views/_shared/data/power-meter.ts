/** 智算任务电力计量 mock */

export type PowerPeriod = 'month' | 'today' | 'week';

export interface PowerMeterKpi {
  key: string;
  label: string;
  value: string;
  unit: string;
  trend: string;
  up: boolean;
  tone: 'green' | 'green-light' | 'orange' | 'orange-light';
  icon: string;
}

export interface PowerMeterTask {
  id: string;
  name: string;
  type: string;
  stage: string;
  status: '异常' | '正常' | '缓慢' | '警告' | '超时';
  priority: '中' | '低' | '高';
  elapsed: string;
  progress: number;
  powerKwh: string;
  peakKw: string;
}

export const powerPeriodKpis: Record<PowerPeriod, PowerMeterKpi[]> = {
  today: [
    {
      key: 'power',
      label: '累计电力消耗',
      value: '6,284.5',
      unit: 'kWh',
      trend: '7.9% 较昨日',
      up: true,
      tone: 'orange',
      icon: '⚡',
    },
    {
      key: 'pue',
      label: '数据中心 PUE',
      value: '1.28',
      unit: 'PUE 值',
      trend: '2.3% 较上月',
      up: false,
      tone: 'orange-light',
      icon: '↻',
    },
    {
      key: 'carbon',
      label: '关联碳排放量',
      value: '3,268.7',
      unit: 'kg CO₂e',
      trend: '6.8% 较昨日',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'intensity',
      label: '电力碳强度',
      value: '0.52',
      unit: 'kg CO₂e / kWh',
      trend: '4.1% 较上月',
      up: false,
      tone: 'green-light',
      icon: '📊',
    },
  ],
  week: [
    {
      key: 'power',
      label: '累计电力消耗',
      value: '38,420',
      unit: 'kWh',
      trend: '5.2% 较上周',
      up: true,
      tone: 'orange',
      icon: '⚡',
    },
    {
      key: 'pue',
      label: '数据中心 PUE',
      value: '1.26',
      unit: 'PUE 值',
      trend: '1.8% 较上月',
      up: false,
      tone: 'orange-light',
      icon: '↻',
    },
    {
      key: 'carbon',
      label: '关联碳排放量',
      value: '19,980',
      unit: 'kg CO₂e',
      trend: '4.6% 较上周',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'intensity',
      label: '电力碳强度',
      value: '0.51',
      unit: 'kg CO₂e / kWh',
      trend: '3.2% 较上月',
      up: false,
      tone: 'green-light',
      icon: '📊',
    },
  ],
  month: [
    {
      key: 'power',
      label: '累计电力消耗',
      value: '156,800',
      unit: 'kWh',
      trend: '8.4% 较上月',
      up: true,
      tone: 'orange',
      icon: '⚡',
    },
    {
      key: 'pue',
      label: '数据中心 PUE',
      value: '1.25',
      unit: 'PUE 值',
      trend: '2.1% 较上月',
      up: false,
      tone: 'orange-light',
      icon: '↻',
    },
    {
      key: 'carbon',
      label: '关联碳排放量',
      value: '81,540',
      unit: 'kg CO₂e',
      trend: '7.1% 较上月',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'intensity',
      label: '电力碳强度',
      value: '0.50',
      unit: 'kg CO₂e / kWh',
      trend: '5.0% 较上月',
      up: false,
      tone: 'green-light',
      icon: '📊',
    },
  ],
};

export const powerTrendWeek = {
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  power: [820, 960, 1040, 980, 1120, 890, 760],
  carbon: [428, 502, 544, 512, 586, 466, 398],
};

export const powerMeterTasks: PowerMeterTask[] = [
  {
    id: 'TASK-8742',
    name: 'ImageNet 图像识别模型训练',
    type: '模型训练',
    stage: '模型训练（第3轮）',
    status: '异常',
    priority: '高',
    elapsed: '5小时23分',
    progress: 68,
    powerKwh: '1,240',
    peakKw: '318',
  },
  {
    id: 'TASK-8738',
    name: 'NLP 文本分类推理服务',
    type: '推理服务',
    stage: '在线推理',
    status: '正常',
    priority: '中',
    elapsed: '12小时08分',
    progress: 100,
    powerKwh: '286',
    peakKw: '72',
  },
  {
    id: 'TASK-8735',
    name: '大规模数据预处理',
    type: '数据处理',
    stage: '数据清洗',
    status: '警告',
    priority: '中',
    elapsed: '2小时45分',
    progress: 42,
    powerKwh: '168',
    peakKw: '96',
  },
  {
    id: 'TASK-8729',
    name: '推荐系统模型微调',
    type: '模型训练',
    stage: '微调（第1轮）',
    status: '缓慢',
    priority: '低',
    elapsed: '8小时16分',
    progress: 55,
    powerKwh: '920',
    peakKw: '210',
  },
  {
    id: 'TASK-8721',
    name: '视频分析批处理任务',
    type: '批处理',
    stage: '特征提取',
    status: '超时',
    priority: '高',
    elapsed: '14小时32分',
    progress: 88,
    powerKwh: '1,680',
    peakKw: '286',
  },
  {
    id: 'TASK-8718',
    name: 'LLM 对话模型 SFT',
    type: '模型训练',
    stage: 'SFT 训练',
    status: '正常',
    priority: '高',
    elapsed: '6小时40分',
    progress: 72,
    powerKwh: '1,860',
    peakKw: '420',
  },
];
