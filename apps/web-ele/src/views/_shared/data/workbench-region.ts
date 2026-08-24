/** 区域调度管理 mock 数据 */

export type SchemeStatus =
  | '草稿'
  | '已生成'
  | '执行中'
  | '已完成'
  | '已终止';

export type ReassessResult = '优于预期' | '符合预期' | '低于预期' | '待评估';

export interface RegionScheme {
  id: string;
  name: string;
  region: string;
  strategy: string;
  status: SchemeStatus;
  createdAt: string;
  executeAt: string;
  owner: string;
  targetUtil: number;
  greenRatio: number;
  costSave: number;
  logic: string;
  flow: string[];
}

export interface SchemeReassess {
  id: string;
  schemeId: string;
  schemeName: string;
  region: string;
  assessAt: string;
  assessor: string;
  expectUtil: number;
  actualUtil: number;
  expectGreen: number;
  actualGreen: number;
  expectCost: number;
  actualCost: number;
  result: ReassessResult;
  gapNote: string;
  suggest: string;
}

export interface SchemeEvaluate {
  id: string;
  schemeId: string;
  schemeName: string;
  region: string;
  period: string;
  score: number;
  utilScore: number;
  greenScore: number;
  costScore: number;
  latencyScore: number;
  rank: number;
  summary: string;
}

export const regionSchemes: RegionScheme[] = [
  {
    id: 'RS-20260301',
    name: '贵阳核心区绿电错峰方案',
    region: '贵阳核心区',
    strategy: '电价优先 + 绿电约束',
    status: '执行中',
    createdAt: '2026-03-01 09:20',
    executeAt: '2026-03-01 10:00',
    owner: '调度一组',
    targetUtil: 82,
    greenRatio: 68,
    costSave: 12.6,
    logic: '按日前电价曲线与绿电出力预测，优先将可延迟训练任务排入谷段，刚性推理任务就近部署。',
    flow: ['需求汇聚', '约束求解', '方案生成', '人工确认', '下发执行', '效果回传'],
  },
  {
    id: 'RS-20260305',
    name: '遵义—贵阳跨区借用方案',
    region: '遵义/贵阳',
    strategy: '跨区协同',
    status: '已完成',
    createdAt: '2026-03-05 14:10',
    executeAt: '2026-03-05 15:00',
    owner: '调度二组',
    targetUtil: 75,
    greenRatio: 55,
    costSave: 8.2,
    logic: '遵义空闲 GPU 借调至贵阳高峰窗口，按时延上限与碳配额双约束求解。',
    flow: ['容量探测', '路径选择', '配额校验', '方案下发', '执行监控', '归还结算'],
  },
  {
    id: 'RS-20260308',
    name: '毕节边缘推理保供方案',
    region: '毕节边缘',
    strategy: '时延优先',
    status: '已生成',
    createdAt: '2026-03-08 11:05',
    executeAt: '2026-03-09 08:00',
    owner: '边缘调度组',
    targetUtil: 60,
    greenRatio: 40,
    costSave: 3.1,
    logic: '边缘节点预留推理配额，超限请求回源核心区，保障本地 SLA。',
    flow: ['SLA 识别', '配额预留', '溢出策略', '方案确认', '待执行'],
  },
  {
    id: 'RS-20260310',
    name: '安顺夜间训练批处理方案',
    region: '安顺节点',
    strategy: '成本优先',
    status: '草稿',
    createdAt: '2026-03-10 16:40',
    executeAt: '-',
    owner: '调度一组',
    targetUtil: 88,
    greenRatio: 72,
    costSave: 15.4,
    logic: '聚合可中断训练任务至 00:00–06:00 谷电窗口，绑定绿电合约比例。',
    flow: ['任务筛选', '窗口匹配', '合约绑定', '方案草稿'],
  },
  {
    id: 'RS-20260220',
    name: '凯里碳约束削峰方案',
    region: '凯里节点',
    strategy: '碳约束',
    status: '已终止',
    createdAt: '2026-02-20 10:15',
    executeAt: '2026-02-20 12:00',
    owner: '碳排调度组',
    targetUtil: 70,
    greenRatio: 80,
    costSave: 5.0,
    logic: '碳排超阈值时强制降载非关键任务，并触发绿电替代路径。',
    flow: ['碳排监测', '阈值触发', '降载执行', '人工终止'],
  },
  {
    id: 'RS-20260312',
    name: '全网日前统一编排方案',
    region: '全网',
    strategy: '综合最优',
    status: '执行中',
    createdAt: '2026-03-12 08:30',
    executeAt: '2026-03-12 09:00',
    owner: '总调中心',
    targetUtil: 78,
    greenRatio: 62,
    costSave: 18.9,
    logic: '全域多目标求解：利用率、绿电占比、成本、时延加权优化。',
    flow: ['全网采集', '多目标求解', '分区拆解', '并行下发', '滚动校正'],
  },
];

export const schemeReassessList: SchemeReassess[] = [
  {
    id: 'RA-01',
    schemeId: 'RS-20260305',
    schemeName: '遵义—贵阳跨区借用方案',
    region: '遵义/贵阳',
    assessAt: '2026-03-07 18:00',
    assessor: '评估专班',
    expectUtil: 75,
    actualUtil: 79,
    expectGreen: 55,
    actualGreen: 52,
    expectCost: 8.2,
    actualCost: 7.6,
    result: '符合预期',
    gapNote: '绿电占比略低于预期（-3pp），主要因借用窗口风光出力波动。',
    suggest: '下一轮增加备用绿电路径，并缩短跨区借用切片粒度。',
  },
  {
    id: 'RA-02',
    schemeId: 'RS-20260301',
    schemeName: '贵阳核心区绿电错峰方案',
    region: '贵阳核心区',
    assessAt: '2026-03-11 17:30',
    assessor: '调度一组',
    expectUtil: 82,
    actualUtil: 86,
    expectGreen: 68,
    actualGreen: 71,
    expectCost: 12.6,
    actualCost: 14.1,
    result: '优于预期',
    gapNote: '利用率与绿电均超预期，成本节约高于目标。',
    suggest: '可扩大可延迟任务纳入比例，并固化为模板方案。',
  },
  {
    id: 'RA-03',
    schemeId: 'RS-20260220',
    schemeName: '凯里碳约束削峰方案',
    region: '凯里节点',
    assessAt: '2026-02-28 10:00',
    assessor: '碳排调度组',
    expectUtil: 70,
    actualUtil: 58,
    expectGreen: 80,
    actualGreen: 76,
    expectCost: 5.0,
    actualCost: 2.1,
    result: '低于预期',
    gapNote: '强制降载导致利用率明显低于目标，业务影响偏大。',
    suggest: '调整阈值阶梯与降载优先级，避免一刀切终止。',
  },
  {
    id: 'RA-04',
    schemeId: 'RS-20260312',
    schemeName: '全网日前统一编排方案',
    region: '全网',
    assessAt: '2026-03-12 16:00',
    assessor: '总调中心',
    expectUtil: 78,
    actualUtil: 74,
    expectGreen: 62,
    actualGreen: 60,
    expectCost: 18.9,
    actualCost: 16.2,
    result: '符合预期',
    gapNote: '午峰段时延约束收紧，部分训练任务后移，利用率略降。',
    suggest: '日内滚动窗口增加 2 次重排，平衡时延与利用率。',
  },
  {
    id: 'RA-05',
    schemeId: 'RS-20260308',
    schemeName: '毕节边缘推理保供方案',
    region: '毕节边缘',
    assessAt: '-',
    assessor: '-',
    expectUtil: 60,
    actualUtil: 0,
    expectGreen: 40,
    actualGreen: 0,
    expectCost: 3.1,
    actualCost: 0,
    result: '待评估',
    gapNote: '方案尚未执行，暂无实测数据。',
    suggest: '执行满 24 小时后自动触发重新评估。',
  },
];

export const schemeEvaluates: SchemeEvaluate[] = [
  {
    id: 'EV-01',
    schemeId: 'RS-20260301',
    schemeName: '贵阳核心区绿电错峰方案',
    region: '贵阳核心区',
    period: '2026-03-01 ~ 03-11',
    score: 92,
    utilScore: 90,
    greenScore: 94,
    costScore: 93,
    latencyScore: 88,
    rank: 1,
    summary: '综合表现最优，绿电消纳与成本节约突出。',
  },
  {
    id: 'EV-02',
    schemeId: 'RS-20260312',
    schemeName: '全网日前统一编排方案',
    region: '全网',
    period: '2026-03-12',
    score: 86,
    utilScore: 84,
    greenScore: 85,
    costScore: 88,
    latencyScore: 87,
    rank: 2,
    summary: '全域均衡较好，午峰段仍有优化空间。',
  },
  {
    id: 'EV-03',
    schemeId: 'RS-20260305',
    schemeName: '遵义—贵阳跨区借用方案',
    region: '遵义/贵阳',
    period: '2026-03-05 ~ 03-07',
    score: 81,
    utilScore: 86,
    greenScore: 76,
    costScore: 84,
    latencyScore: 78,
    rank: 3,
    summary: '跨区协同有效，绿电与时延指标略弱。',
  },
  {
    id: 'EV-04',
    schemeId: 'RS-20260308',
    schemeName: '毕节边缘推理保供方案',
    region: '毕节边缘',
    period: '未执行',
    score: 0,
    utilScore: 0,
    greenScore: 0,
    costScore: 0,
    latencyScore: 0,
    rank: 5,
    summary: '尚未产生评价数据。',
  },
  {
    id: 'EV-05',
    schemeId: 'RS-20260220',
    schemeName: '凯里碳约束削峰方案',
    region: '凯里节点',
    period: '2026-02-20 ~ 02-28',
    score: 64,
    utilScore: 55,
    greenScore: 82,
    costScore: 60,
    latencyScore: 58,
    rank: 4,
    summary: '碳约束达标，但对业务连续性影响偏大。',
  },
];
