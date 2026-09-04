/** 电碳算模型 mock */

export const predictProfiles: Record<
  string,
  {
    columns: string[];
    desc: string;
    formHints: string[];
    kpis: Array<{ label: string; value: string }>;
    rows: Array<Record<string, string>>;
    unit: string;
  }
> = {
  'train-compute': {
    desc: '基于模型规模、批量大小、精度与并行策略，预测训练类任务算力需求。',
    unit: 'PFLOPS',
    formHints: ['模型参数量', '全局 Batch', '精度', '并行策略'],
    kpis: [
      { label: '预测算力', value: '86.4 PFLOPS' },
      { label: '建议 GPU', value: '64 × A100' },
      { label: '置信区间', value: '±8%' },
      { label: '样本覆盖', value: '1,286' },
    ],
    columns: ['任务', '模型', '预测算力', '建议卡数', '状态'],
    rows: [
      { 任务: 'LLM-SFT-01', 模型: '70B', 预测算力: '72.1', 建议卡数: '48', 状态: '已出结果' },
      { 任务: 'Pretrain-02', 模型: '13B', 预测算力: '28.4', 建议卡数: '16', 状态: '已出结果' },
      { 任务: 'LoRA-09', 模型: '7B', 预测算力: '6.2', 建议卡数: '4', 状态: '草稿' },
    ],
  },
  'infer-compute': {
    desc: '按并发、时延目标与模型规格，预测推理类任务算力与实例需求。',
    unit: 'QPS / GPU',
    formHints: ['并发峰值', 'P99 时延', '模型规格', '量化方式'],
    kpis: [
      { label: '预测吞吐', value: '1,280 QPS' },
      { label: '建议实例', value: '12 GPU' },
      { label: 'P99 时延', value: '86 ms' },
      { label: '置信区间', value: '±6%' },
    ],
    columns: ['服务', '模型', '预测吞吐', '建议实例', '状态'],
    rows: [
      { 服务: '客服推理', 模型: '7B-INT8', 预测吞吐: '920', 建议实例: '8', 状态: '已出结果' },
      { 服务: '巡检推理', 模型: 'YOLO-v8', 预测吞吐: '340', 建议实例: '4', 状态: '已出结果' },
      { 服务: '文档解析', 模型: 'LayoutLM', 预测吞吐: '180', 建议实例: '2', 状态: '排队中' },
    ],
  },
  'power-demand': {
    desc: '结合算力占用、机型能效与负载曲线，预测智算任务电力需求。',
    unit: 'kWh',
    formHints: ['任务时长', '机型', '平均利用率', 'PUE'],
    kpis: [
      { label: '预测电量', value: '1,860 kWh' },
      { label: '峰值功率', value: '420 kW' },
      { label: 'PUE 折算', value: '1.25' },
      { label: '置信区间', value: '±9%' },
    ],
    columns: ['任务', '机型', '预测电量', '峰值功率', '状态'],
    rows: [
      { 任务: 'Train-A', 机型: 'A100×64', 预测电量: '1,240', 峰值功率: '310', 状态: '已出结果' },
      { 任务: 'Infer-B', 机型: 'T4×16', 预测电量: '286', 峰值功率: '68', 状态: '已出结果' },
      { 任务: 'Batch-C', 机型: '4090×8', 预测电量: '334', 峰值功率: '96', 状态: '草稿' },
    ],
  },
  'carbon-predict': {
    desc: '基于区域电网碳强度与任务用电曲线，预测智算任务碳排放。',
    unit: 'tCO₂',
    formHints: ['用电量', '区域', '绿电占比', '时段'],
    kpis: [
      { label: '预测碳排', value: '0.86 tCO₂' },
      { label: '绿电抵消', value: '0.31 tCO₂' },
      { label: '净碳排', value: '0.55 tCO₂' },
      { label: '强度', value: '0.46 t/MWh' },
    ],
    columns: ['任务', '区域', '预测碳排', '净碳排', '状态'],
    rows: [
      { 任务: 'Train-A', 区域: '贵阳', 预测碳排: '0.52', 净碳排: '0.28', 状态: '已出结果' },
      { 任务: 'Infer-B', 区域: '安顺', 预测碳排: '0.18', 净碳排: '0.12', 状态: '已出结果' },
      { 任务: 'Batch-C', 区域: '凯里', 预测碳排: '0.16', 净碳排: '0.15', 状态: '草稿' },
    ],
  },
  'cost-predict': {
    desc: '综合算力、电力与调度策略，预测智算任务运行成本。',
    unit: '元',
    formHints: ['算力单价', '电价曲线', '时长', '策略'],
    kpis: [
      { label: '预测总成本', value: '¥ 28,460' },
      { label: '算力成本', value: '¥ 21,200' },
      { label: '电力成本', value: '¥ 6,140' },
      { label: '可优化空间', value: '12.4%' },
    ],
    columns: ['任务', '策略', '预测成本', '优化后', '状态'],
    rows: [
      { 任务: 'Train-A', 策略: '电价优先', 预测成本: '18,200', 优化后: '15,960', 状态: '已出结果' },
      { 任务: 'Infer-B', 策略: '时延优先', 预测成本: '6,400', 优化后: '6,180', 状态: '已出结果' },
      { 任务: 'Batch-C', 策略: '碳优', 预测成本: '3,860', 优化后: '3,420', 状态: '草稿' },
    ],
  },
};

export const monitorTasks = [
  {
    id: 'T-1001',
    name: 'LLM-SFT-贵阳',
    status: '运行中',
    compute: '78%',
    power: '286 kW',
    carbon: '0.12 t/h',
    progress: 62,
  },
  {
    id: 'T-1002',
    name: '客服推理池',
    status: '运行中',
    compute: '54%',
    power: '96 kW',
    carbon: '0.04 t/h',
    progress: 100,
  },
  {
    id: 'T-1003',
    name: '巡检训练-安顺',
    status: '排队中',
    compute: '-',
    power: '-',
    carbon: '-',
    progress: 0,
  },
  {
    id: 'T-1004',
    name: '文档解析批处理',
    status: '告警',
    compute: '91%',
    power: '142 kW',
    carbon: '0.08 t/h',
    progress: 44,
  },
  {
    id: 'T-1005',
    name: '碳核算夜间任务',
    status: '已完成',
    compute: '0%',
    power: '0',
    carbon: '0',
    progress: 100,
  },
];

export const dcForecastRows = [
  {
    dc: '贵阳核心',
    compute: '312 PFLOPS',
    power: '18.6 MWh',
    carbon: '6.2 tCO₂',
    cost: '¥ 96,400',
  },
  {
    dc: '遵义节点',
    compute: '86 PFLOPS',
    power: '5.1 MWh',
    carbon: '2.4 tCO₂',
    cost: '¥ 28,100',
  },
  {
    dc: '安顺节点',
    compute: '64 PFLOPS',
    power: '3.8 MWh',
    carbon: '1.9 tCO₂',
    cost: '¥ 21,600',
  },
  {
    dc: '毕节边缘',
    compute: '22 PFLOPS',
    power: '1.2 MWh',
    carbon: '0.7 tCO₂',
    cost: '¥ 8,400',
  },
];

export const qaFaq = [
  {
    q: '什么是电碳算协同？',
    a: '电碳算协同是将电力调度、碳排放约束与算力编排统一建模，实现任务在合适电价与碳强度窗口执行。',
  },
  {
    q: '训练任务如何估算 GPU 数量？',
    a: '可依据参数量、序列长度、并行策略与目标吞吐，使用「训练类任务算力需求预测」给出建议卡数与置信区间。',
  },
  {
    q: '绿电占比如何影响碳排预测？',
    a: '系统按区域实时/日前碳强度与绿电消纳比例折算净碳排，绿电占比越高，净排放越低。',
  },
];

export const modelCards: Record<
  string,
  {
    accuracy: string;
    columns: string[];
    desc: string;
    features: string[];
    metric: string;
    samples: Array<Record<string, string>>;
    version: string;
  }
> = {
  'compute-max': {
    desc: '预测智算任务在既定配置下的算力峰值需求，用于资源预留与扩容决策。',
    version: 'v2.3.1',
    metric: 'MAPE 6.8%',
    accuracy: '92.4%',
    features: ['模型规模', '并行度', '精度', '激活重算'],
    columns: ['样本任务', '真实峰值', '预测峰值', '误差'],
    samples: [
      { 样本任务: 'SFT-70B', 真实峰值: '81.2', 预测峰值: '79.6', 误差: '2.0%' },
      { 样本任务: 'PT-13B', 真实峰值: '30.1', 预测峰值: '31.4', 误差: '4.3%' },
    ],
  },
  'power-max': {
    desc: '预测任务运行期最大电力负荷，支撑机房供电与功耗约束校核。',
    version: 'v1.8.0',
    metric: 'MAPE 7.5%',
    accuracy: '90.1%',
    features: ['机型 TDP', '利用率', 'PUE', '冷却附加'],
    columns: ['样本任务', '真实峰值kW', '预测峰值kW', '误差'],
    samples: [
      { 样本任务: 'Train-A', 真实峰值kW: '318', 预测峰值kW: '310', 误差: '2.5%' },
      { 样本任务: 'Infer-B', 真实峰值kW: '72', 预测峰值kW: '68', 误差: '5.6%' },
    ],
  },
  'start-time': {
    desc: '预测任务从提交到真正启动的排队与准备时长。',
    version: 'v1.4.2',
    metric: 'MAE 4.6 min',
    accuracy: '88.7%',
    features: ['队列深度', '镜像大小', '资源匹配度', '优先级'],
    columns: ['样本任务', '真实启动', '预测启动', '误差'],
    samples: [
      { 样本任务: 'Job-881', 真实启动: '12 min', 预测启动: '11 min', 误差: '1 min' },
      { 样本任务: 'Job-902', 真实启动: '28 min', 预测启动: '31 min', 误差: '3 min' },
    ],
  },
  'save-time': {
    desc: '预测检查点 / 模型保存耗时，辅助错峰落盘与存储带宽规划。',
    version: 'v1.2.0',
    metric: 'MAE 2.1 min',
    accuracy: '91.0%',
    features: ['权重体积', '存储带宽', '分片策略', '压缩比'],
    columns: ['样本任务', '真实保存', '预测保存', '误差'],
    samples: [
      { 样本任务: 'CKPT-70B', 真实保存: '9.5 min', 预测保存: '9.2 min', 误差: '0.3 min' },
      { 样本任务: 'CKPT-13B', 真实保存: '2.8 min', 预测保存: '3.1 min', 误差: '0.3 min' },
    ],
  },
  'run-time': {
    desc: '预测任务端到端运行时长，用于窗口编排与 SLA 评估。',
    version: 'v2.0.5',
    metric: 'MAPE 8.2%',
    accuracy: '89.3%',
    features: ['步数', '吞吐', '中断恢复', '数据管道'],
    columns: ['样本任务', '真实时长', '预测时长', '误差'],
    samples: [
      { 样本任务: 'Epoch-8', 真实时长: '6.2 h', 预测时长: '6.0 h', 误差: '3.2%' },
      { 样本任务: 'Batch-200', 真实时长: '1.4 h', 预测时长: '1.5 h', 误差: '7.1%' },
    ],
  },
};

export const frameworkJobs = [
  {
    id: 'CV-01',
    source: 'PyTorch JobSpec',
    target: '电碳算统一任务模型',
    status: '成功',
    time: '2026-03-12 10:22',
  },
  {
    id: 'CV-02',
    source: 'K8s Volcano YAML',
    target: '电碳算统一任务模型',
    status: '成功',
    time: '2026-03-12 09:40',
  },
  {
    id: 'CV-03',
    source: '自定义 JSON',
    target: '电碳算统一任务模型',
    status: '失败',
    time: '2026-03-11 16:18',
  },
];
