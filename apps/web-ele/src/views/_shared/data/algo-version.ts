/** 算法台账管理 mock */

export type AlgoLedgerTab =
  | 'list'
  | 'category'
  | 'params'
  | 'op-log'
  | 'call-log';

export interface AlgoLedgerItem {
  id: string;
  name: string;
  type: string;
  version: string;
  status: '启用' | '停用';
  updated: string;
  created: string;
}

export interface AlgoCategory {
  id: string;
  name: string;
  count: number;
  desc: string;
}

export interface AlgoParamRow {
  id: string;
  algo: string;
  key: string;
  value: string;
  scope: string;
  updated: string;
}

export interface AlgoOpLog {
  id: string;
  time: string;
  operator: string;
  action: string;
  target: string;
  result: string;
}

export interface AlgoCallLog {
  id: string;
  time: string;
  algo: string;
  caller: string;
  duration: string;
  status: '成功' | '失败';
}

export const algoLedgerItems: AlgoLedgerItem[] = [
  {
    id: 'ALG-001',
    name: '电价优先实时本地调度算法',
    type: '调度优化',
    version: 'v2.3.1',
    status: '启用',
    updated: '2026-07-20',
    created: '2025-11-08',
  },
  {
    id: 'ALG-002',
    name: '实时功耗控制算法',
    type: '功耗管理',
    version: 'v1.8.5',
    status: '启用',
    updated: '2026-07-15',
    created: '2025-10-22',
  },
  {
    id: 'ALG-003',
    name: '日前功耗预测算法',
    type: '功耗预测',
    version: 'v1.5.2',
    status: '停用',
    updated: '2026-07-10',
    created: '2025-09-14',
  },
  {
    id: 'ALG-004',
    name: '碳排强度预测算法',
    type: '预测模型',
    version: 'v2.0.0',
    status: '启用',
    updated: '2026-07-08',
    created: '2025-12-01',
  },
  {
    id: 'ALG-005',
    name: '算力需求融合算法',
    type: '预测模型',
    version: 'v1.2.4',
    status: '启用',
    updated: '2026-07-05',
    created: '2026-01-18',
  },
  {
    id: 'ALG-006',
    name: '策略校核归因算法',
    type: '策略校核',
    version: 'v2.4.1',
    status: '启用',
    updated: '2026-07-01',
    created: '2026-02-10',
  },
];

export const algoCategories: AlgoCategory[] = [
  { id: 'CAT-01', name: '调度优化', count: 8, desc: '电价、碳排、算力等多目标调度策略' },
  { id: 'CAT-02', name: '功耗管理', count: 5, desc: '实时功耗控制与约束校核' },
  { id: 'CAT-03', name: '功耗预测', count: 4, desc: '日前/实时电力与负载预测' },
  { id: 'CAT-04', name: '预测模型', count: 12, desc: '算力、碳排、成本等预测模型' },
  { id: 'CAT-05', name: '策略校核', count: 6, desc: '事前预警、事后归因与融合算法' },
];

export const algoParams: AlgoParamRow[] = [
  {
    id: 'P-001',
    algo: '电价优先实时本地调度算法',
    key: 'price_weight',
    value: '0.65',
    scope: '全局',
    updated: '2026-07-20',
  },
  {
    id: 'P-002',
    algo: '实时功耗控制算法',
    key: 'max_power_kw',
    value: '8500',
    scope: '贵阳核心',
    updated: '2026-07-15',
  },
  {
    id: 'P-003',
    algo: '碳排强度预测算法',
    key: 'carbon_factor',
    value: '0.52',
    scope: '区域',
    updated: '2026-07-08',
  },
];

export const algoOpLogs: AlgoOpLog[] = [
  {
    id: 'OP-1201',
    time: '2026-07-20 10:22',
    operator: '张工',
    action: '版本升级',
    target: '电价优先实时本地调度算法',
    result: '成功',
  },
  {
    id: 'OP-1198',
    time: '2026-07-18 16:40',
    operator: '李工',
    action: '参数调整',
    target: '实时功耗控制算法',
    result: '成功',
  },
  {
    id: 'OP-1192',
    time: '2026-07-10 09:15',
    operator: '王工',
    action: '停用算法',
    target: '日前功耗预测算法',
    result: '成功',
  },
];

export const algoCallLogs: AlgoCallLog[] = [
  {
    id: 'CL-8801',
    time: '2026-07-20 14:05',
    algo: '电价优先实时本地调度算法',
    caller: '区域调度服务',
    duration: '128 ms',
    status: '成功',
  },
  {
    id: 'CL-8796',
    time: '2026-07-20 13:58',
    algo: '算力需求融合算法',
    caller: '策略校核服务',
    duration: '96 ms',
    status: '成功',
  },
  {
    id: 'CL-8790',
    time: '2026-07-20 13:42',
    algo: '日前功耗预测算法',
    caller: '电碳算模型服务',
    duration: '-',
    status: '失败',
  },
];

export const algoTypeOptions = [
  '调度优化',
  '功耗管理',
  '功耗预测',
  '预测模型',
  '策略校核',
];
