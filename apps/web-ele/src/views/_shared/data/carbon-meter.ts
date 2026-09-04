/** 智算任务碳排计量 mock */

export type CarbonPeriod = 'month' | 'today' | 'week';

export interface CarbonMeterKpi {
  key: string;
  label: string;
  value: string;
  unit: string;
  trend: string;
  up: boolean;
  tone: 'green' | 'green-light' | 'teal' | 'teal-light';
  icon: string;
}

export interface CarbonMeterTask {
  id: string;
  name: string;
  type: string;
  region: string;
  status: '已完成' | '待核算' | '计量中';
  gross: string;
  offset: string;
  net: string;
  intensity: string;
  greenRatio: string;
  progress: number;
}

export const carbonPeriodKpis: Record<CarbonPeriod, CarbonMeterKpi[]> = {
  today: [
    {
      key: 'gross',
      label: '累计碳排放量',
      value: '3,268.7',
      unit: 'kg CO₂e',
      trend: '6.8% 较昨日',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'net',
      label: '净碳排放量',
      value: '2,186.4',
      unit: 'kg CO₂e',
      trend: '5.2% 较昨日',
      up: true,
      tone: 'green-light',
      icon: '♻',
    },
    {
      key: 'intensity',
      label: '碳排强度',
      value: '0.52',
      unit: 'kg CO₂e / kWh',
      trend: '4.1% 较上月',
      up: false,
      tone: 'teal',
      icon: '📊',
    },
    {
      key: 'offset',
      label: '绿电抵消量',
      value: '1,082.3',
      unit: 'kg CO₂e',
      trend: '12.6% 较昨日',
      up: true,
      tone: 'teal-light',
      icon: '⚡',
    },
  ],
  week: [
    {
      key: 'gross',
      label: '累计碳排放量',
      value: '19,980',
      unit: 'kg CO₂e',
      trend: '4.6% 较上周',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'net',
      label: '净碳排放量',
      value: '13,420',
      unit: 'kg CO₂e',
      trend: '3.8% 较上周',
      up: true,
      tone: 'green-light',
      icon: '♻',
    },
    {
      key: 'intensity',
      label: '碳排强度',
      value: '0.51',
      unit: 'kg CO₂e / kWh',
      trend: '3.2% 较上月',
      up: false,
      tone: 'teal',
      icon: '📊',
    },
    {
      key: 'offset',
      label: '绿电抵消量',
      value: '6,560',
      unit: 'kg CO₂e',
      trend: '9.4% 较上周',
      up: true,
      tone: 'teal-light',
      icon: '⚡',
    },
  ],
  month: [
    {
      key: 'gross',
      label: '累计碳排放量',
      value: '81,540',
      unit: 'kg CO₂e',
      trend: '7.1% 较上月',
      up: true,
      tone: 'green',
      icon: '🌿',
    },
    {
      key: 'net',
      label: '净碳排放量',
      value: '54,860',
      unit: 'kg CO₂e',
      trend: '6.2% 较上月',
      up: true,
      tone: 'green-light',
      icon: '♻',
    },
    {
      key: 'intensity',
      label: '碳排强度',
      value: '0.50',
      unit: 'kg CO₂e / kWh',
      trend: '5.0% 较上月',
      up: false,
      tone: 'teal',
      icon: '📊',
    },
    {
      key: 'offset',
      label: '绿电抵消量',
      value: '26,680',
      unit: 'kg CO₂e',
      trend: '11.2% 较上月',
      up: true,
      tone: 'teal-light',
      icon: '⚡',
    },
  ],
};

/** 参考图：近 7 天碳排放量趋势 */
export const carbonTrendWeek = {
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  carbon: [2226, 2418, 2610, 2709, 2850, 3193, 3269],
};

export const carbonIntensityWeek = {
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  intensity: [0.54, 0.53, 0.52, 0.52, 0.51, 0.50, 0.49],
};

export const carbonRegionRows = [
  { region: '贵阳核心', gross: '1,240', offset: '420', net: '820', ratio: '33.9%' },
  { region: '遵义节点', gross: '680', offset: '180', net: '500', ratio: '26.5%' },
  { region: '安顺节点', gross: '520', offset: '210', net: '310', ratio: '40.4%' },
  { region: '毕节边缘', gross: '286', offset: '96', net: '190', ratio: '33.6%' },
];

export const carbonMeterTasks: CarbonMeterTask[] = [
  {
    id: 'CM-T8742',
    name: 'LLM-SFT-70B 训练',
    type: '模型训练',
    region: '贵阳',
    status: '计量中',
    gross: '820 kg',
    offset: '280 kg',
    net: '540 kg',
    intensity: '0.48',
    greenRatio: '34%',
    progress: 68,
  },
  {
    id: 'CM-T8738',
    name: '客服推理服务池',
    type: '推理服务',
    region: '安顺',
    status: '计量中',
    gross: '186 kg',
    offset: '72 kg',
    net: '114 kg',
    intensity: '0.46',
    greenRatio: '39%',
    progress: 100,
  },
  {
    id: 'CM-T8735',
    name: '大规模数据预处理',
    type: '数据处理',
    region: '遵义',
    status: '待核算',
    gross: '-',
    offset: '-',
    net: '-',
    intensity: '-',
    greenRatio: '-',
    progress: 42,
  },
  {
    id: 'CM-T8729',
    name: '推荐系统模型微调',
    type: '模型训练',
    region: '贵阳',
    status: '计量中',
    gross: '612 kg',
    offset: '198 kg',
    net: '414 kg',
    intensity: '0.51',
    greenRatio: '32%',
    progress: 55,
  },
  {
    id: 'CM-T8721',
    name: '视频分析批处理',
    type: '批处理',
    region: '毕节',
    status: '已完成',
    gross: '428 kg',
    offset: '142 kg',
    net: '286 kg',
    intensity: '0.55',
    greenRatio: '33%',
    progress: 100,
  },
  {
    id: 'CM-T8718',
    name: '文档解析推理',
    type: '推理服务',
    region: '安顺',
    status: '已完成',
    gross: '96 kg',
    offset: '38 kg',
    net: '58 kg',
    intensity: '0.44',
    greenRatio: '40%',
    progress: 100,
  },
];

export const carbonRules = [
  '毛碳排 = 任务用电量 × 区域电网碳强度因子',
  '绿电抵消 = 任务用电量 × 绿电占比 × 基准碳强度',
  '净碳排 = 毛碳排 − 绿电抵消',
  '碳排强度 = 净碳排 / 任务用电量',
];
