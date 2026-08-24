/** 任务调度 mock */

export const realtimePlanRows = [
  {
    task: 'LLM-Train-001',
    node: '910B-A01',
    start: '14:00',
    end: '14:15',
    power: '35kW',
    status: '运行中',
  },
  {
    task: 'Inference-021',
    node: '910B-A02',
    start: '14:00',
    end: '14:15',
    power: '28kW',
    status: '运行中',
  },
  {
    task: 'FineTune-007',
    node: 'P800-B01',
    start: '14:00',
    end: '14:15',
    power: '42kW',
    status: '运行中',
  },
  {
    task: 'Batch-Proc-33',
    node: 'P800-B02',
    start: '14:00',
    end: '14:15',
    power: '31kW',
    status: '待启动',
  },
  {
    task: 'LLM-Train-002',
    node: '910B-A01',
    start: '14:15',
    end: '14:30',
    power: '36kW',
    status: '待启动',
  },
];

export const dayaheadPlanRows = [
  {
    slot: '00:00-06:00',
    task: 'Inference-W03',
    node: 'P800-B01',
    power: '60kW',
    price: '低',
    basis: '利用低价时段',
  },
  {
    slot: '03:00-08:00',
    task: 'LLM-Train-W01',
    node: '910B-A01~A04',
    power: '200kW',
    price: '低',
    basis: '谷段集中训练',
  },
  {
    slot: '08:00-10:00',
    task: '空间等待',
    node: '-',
    power: '-',
    price: '中',
    basis: '避让平段高峰',
  },
  {
    slot: '10:00-12:00',
    task: 'Inference-W05',
    node: '910B-A02',
    power: '45kW',
    price: '中',
    basis: '满足优先级调度',
  },
  {
    slot: '18:00-22:00',
    task: 'FineTune-W02',
    node: 'P800-B02',
    power: '80kW',
    price: '高',
    basis: '仅保留刚性推理',
  },
];

export const managePlans = [
  {
    id: 'PLAN-2026-M-001',
    name: '手动计划-华东A',
    type: '手动',
    status: '成功',
    enabled: true,
    source: '华东算力中心A',
    target: '-',
    scope: '3个任务批次',
    window: '2026-06-15 09:00–18:00',
    trigger: '手动触发',
    exec: '已完成',
  },
  {
    id: 'PLAN-2026-C-014',
    name: '日前跨域计划-华东→西部',
    type: '日前跨域',
    status: '运行中',
    enabled: true,
    source: '华东算力中心A',
    target: '西部算力中心A',
    scope: '8个任务批次',
    window: '2026-06-16 00:00–24:00',
    trigger: '定时触发 (22:00)',
    exec: '运行中',
  },
  {
    id: 'PLAN-2026-L-018',
    name: '日前本地计划-贵阳核心',
    type: '日前本地',
    status: '完成',
    enabled: true,
    source: '贵阳核心区',
    target: '贵阳核心区',
    scope: '12个任务批次',
    window: '2026-06-14 00:00–24:00',
    trigger: '定时触发 (21:30)',
    exec: '已完成',
  },
  {
    id: 'PLAN-2026-R-011',
    name: '实时本地计划-安顺节点',
    type: '实时',
    status: '运行中',
    enabled: true,
    source: '安顺节点',
    target: '安顺节点',
    scope: '滚动 15 分钟',
    window: '持续',
    trigger: '周期触发',
    exec: '运行中',
  },
  {
    id: 'PLAN-2026-M-005',
    name: '手动计划-西部B',
    type: '手动',
    status: '停用',
    enabled: false,
    source: '西部算力中心B',
    target: '-',
    scope: '2个任务批次',
    window: '2026-06-10 10:00–16:00',
    trigger: '手动触发',
    exec: '已停用',
  },
];

export const manageOps = [
  {
    name: '手动计划-华东A',
    type: '手动执行',
    creator: '张工程师',
    time: '2026-06-15 09:20',
    enabled: '启用',
    result: '成功',
  },
  {
    name: '日前跨域-华东→西部',
    type: '日前跨域',
    creator: '系统自动',
    time: '2026-06-15 22:05',
    enabled: '启用',
    result: '运行中',
  },
  {
    name: '日前本地-贵阳核心',
    type: '日前本地',
    creator: '系统自动',
    time: '2026-06-14 21:30',
    enabled: '启用',
    result: '成功',
  },
  {
    name: '实时本地-安顺节点',
    type: '实时本地',
    creator: '系统自动',
    time: '2026-06-16 14:00',
    enabled: '启用',
    result: '运行中',
  },
];

export const strategyProfiles: Record<
  string,
  {
    desc: string;
    kpis: Array<{ label: string; value: string }>;
    steps: string[];
    rows: Array<Record<string, string>>;
    columns: string[];
    footer: string;
  }
> = {
  'carbon-realtime': {
    desc: '以实时碳排强度为驱动，每 15 分钟滚动生成本地调度方案，优先消纳低碳窗口任务。',
    kpis: [
      { label: '当前碳强度', value: '0.42 tCO₂/MWh' },
      { label: '本轮绿电占比', value: '71%' },
      { label: '算力利用率', value: '74.8%' },
      { label: '告警节点', value: '1' },
    ],
    steps: ['调度触发', '碳排采集', '输入读取', '方案生成', '约束核验', '任务分配', '结果评估'],
    rows: [
      { 任务: 'LLM-Train-C01', 节点: '910B-A03', 时段: '14:00-14:15', 碳排: '低', 状态: '运行中' },
      { 任务: 'Infer-C12', 节点: 'P800-B03', 时段: '14:00-14:15', 碳排: '中', 状态: '运行中' },
      { 任务: 'Batch-C08', 节点: '910B-A04', 时段: '14:15-14:30', 碳排: '低', 状态: '待启动' },
    ],
    columns: ['任务', '节点', '时段', '碳排', '状态'],
    footer: '本轮评估正常：低碳窗口任务已优先排布，1 个节点接近功耗上限。',
  },
  'carbon-dayahead': {
    desc: '基于次日碳排与绿电预测，生成日前本地调度方案，降低高碳时段训练负载。',
    kpis: [
      { label: '规划日期', value: '2026-07-24' },
      { label: '预测均碳强度', value: '0.48 tCO₂/MWh' },
      { label: '规划任务', value: '6 个' },
      { label: '方案版本', value: 'V2' },
    ],
    steps: ['任务登记', '碳排预测', '资源评估', '方案生成', '方案核查', '方案下发', '执行监控'],
    rows: [
      { 时段: '00:00-06:00', 任务: 'Train-DA-01', 节点: 'A01~A04', 碳排: '低', 依据: '绿电高发' },
      { 时段: '10:00-14:00', 任务: 'Infer-DA-03', 节点: 'B01', 碳排: '中', 依据: '刚性推理' },
      { 时段: '18:00-22:00', 任务: '空间等待', 节点: '-', 碳排: '高', 依据: '避让高碳' },
    ],
    columns: ['时段', '任务', '节点', '碳排', '依据'],
    footer: '方案校验通过：高碳时段已压降可中断训练，绿电窗口利用率提升。',
  },
  'multi-balance': {
    desc: '多中心协同平衡算力小时数，生成日前跨中心调度方案，避免单中心过载。',
    kpis: [
      { label: '参与中心', value: '4' },
      { label: '平衡偏差', value: '±3.2%' },
      { label: '迁移批次', value: '8' },
      { label: '方案状态', value: '已生成' },
    ],
    steps: ['中心容量汇聚', '小时数测算', '平衡求解', '方案生成', '跨域校验', '下发', '监控'],
    rows: [
      { 中心: '华东A', 原计划小时: '1200', 调整后: '980', 方向: '迁出' },
      { 中心: '西部A', 原计划小时: '640', 调整后: '860', 方向: '迁入' },
      { 中心: '贵阳核心', 原计划小时: '900', 调整后: '900', 方向: '持平' },
    ],
    columns: ['中心', '原计划小时', '调整后', '方向'],
    footer: '多中心算力小时数偏差已收敛至目标阈值内。',
  },
  'multi-economy': {
    desc: '以多中心综合电价与运行成本最优为目标，生成日前经济性调度方案。',
    kpis: [
      { label: '预计节约', value: '12.6%' },
      { label: '均价差', value: '0.08 元/kWh' },
      { label: '跨域任务', value: '5' },
      { label: '方案版本', value: 'V1' },
    ],
    steps: ['电价汇聚', '成本建模', '经济求解', '方案生成', '约束核验', '下发', '结算回写'],
    rows: [
      { 路径: '华东→西部', 任务: 'Train-E01', 节约: '9.2%', 状态: '已编排' },
      { 路径: '本地-贵阳', 任务: 'Infer-G02', 节约: '3.1%', 状态: '已编排' },
      { 路径: '安顺→贵阳', 任务: 'Batch-A03', 节约: '5.4%', 状态: '待确认' },
    ],
    columns: ['路径', '任务', '节约', '状态'],
    footer: '经济性目标达成，跨域路径时延约束全部满足。',
  },
  'multi-carbon': {
    desc: '多中心碳排优先日前调度，按区域碳强度差异迁移可延迟任务。',
    kpis: [
      { label: '预计减碳', value: '18.4 tCO₂' },
      { label: '低碳中心占比', value: '66%' },
      { label: '迁移批次', value: '7' },
      { label: '方案状态', value: '校验通过' },
    ],
    steps: ['碳排汇聚', '绿电路径', '碳优求解', '方案生成', '配额校验', '下发', '监测'],
    rows: [
      { 源中心: '凯里', 目标中心: '贵阳', 任务批次: '3', 减碳: '6.2 t' },
      { 源中心: '安顺', 目标中心: '遵义', 任务批次: '2', 减碳: '4.1 t' },
      { 源中心: '华东A', 目标中心: '西部A', 任务批次: '2', 减碳: '8.1 t' },
    ],
    columns: ['源中心', '目标中心', '任务批次', '减碳'],
    footer: '多中心碳优方案已通过配额与时延双重校验。',
  },
};

export const dispatchBoards: Record<
  string,
  {
    desc: string;
    mode: string;
    stats: Array<{ label: string; value: string }>;
    rows: Array<Record<string, string>>;
  }
> = {
  'dayahead-local': {
    desc: '管理并监控日前本地调度计划的生成、下发与执行结果。',
    mode: '日前本地',
    stats: [
      { label: '今日计划', value: '18' },
      { label: '待下发', value: '3' },
      { label: '执行中', value: '6' },
      { label: '完成率', value: '94%' },
    ],
    rows: [
      { 计划: '贵阳核心-DA-0723', 窗口: '次日 00:00-24:00', 任务数: '12', 状态: '已下发' },
      { 计划: '安顺节点-DA-0723', 窗口: '次日 00:00-24:00', 任务数: '8', 状态: '待确认' },
      { 计划: '遵义节点-DA-0722', 窗口: '当日 00:00-24:00', 任务数: '10', 状态: '已完成' },
    ],
  },
  'dayahead-cross': {
    desc: '管理日前跨域调度计划，跟踪源/宿中心迁移进度与约束满足情况。',
    mode: '日前跨域',
    stats: [
      { label: '跨域计划', value: '14' },
      { label: '迁移中', value: '5' },
      { label: '成功率', value: '98.7%' },
      { label: '平均时延', value: '42ms' },
    ],
    rows: [
      { 计划: '华东→西部-0723', 批次: '8', 进度: '5/8', 状态: '运行中' },
      { 计划: '安顺→贵阳-0723', 批次: '4', 进度: '0/4', 状态: '待执行' },
      { 计划: '凯里→遵义-0722', 批次: '3', 进度: '3/3', 状态: '已完成' },
    ],
  },
  'realtime-local': {
    desc: '监控实时本地调度滚动窗口，查看触发、分配与评估闭环。',
    mode: '实时本地',
    stats: [
      { label: '滚动周期', value: '15 min' },
      { label: '本轮任务', value: '5' },
      { label: '利用率', value: '76.4%' },
      { label: '告警', value: '2' },
    ],
    rows: [
      { 窗口: '14:00-14:15', 批次: '20240723-1400', 节点告警: '2', 状态: '评估完成' },
      { 窗口: '14:15-14:30', 批次: '20240723-1415', 节点告警: '0', 状态: '生成中' },
      { 窗口: '13:45-14:00', 批次: '20240723-1345', 节点告警: '1', 状态: '已完成' },
    ],
  },
};
