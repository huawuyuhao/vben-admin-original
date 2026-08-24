/** 策略校核 mock 数据 */

export type Feasibility = '高' | '中' | '低';
export type MatchLevel = '优' | '良' | '一般' | '差';
export type ProcessStatus =
  | '已登记'
  | '排队中'
  | '分析中'
  | '已完成'
  | '失败';
export type ConfirmStatus = '待确认' | '已通过' | '已驳回';

export interface StrategyAnalysisItem {
  id: string;
  taskName: string;
  schemeName: string;
  region: string;
  feasibility: Feasibility;
  matchLevel: MatchLevel;
  riskCount: number;
  score: number;
  analyzedAt: string;
  risks: string[];
  suggestions: string[];
  summary: string;
}

export interface StrategyProcessItem {
  id: string;
  taskName: string;
  schemeName: string;
  status: ProcessStatus;
  queue: string;
  priority: '高' | '中' | '低';
  createdAt: string;
  updatedAt: string;
  context: string;
  progress: number;
}

export interface ConfirmLog {
  time: string;
  operator: string;
  action: string;
  remark: string;
}

export interface StrategyConfirmItem {
  id: string;
  conclusionId: string;
  schemeName: string;
  analysisId: string;
  conclusion: string;
  status: ConfirmStatus;
  submitter: string;
  submittedAt: string;
  reviewer: string;
  reviewedAt: string;
  logs: ConfirmLog[];
}

export const strategyAnalyses: StrategyAnalysisItem[] = [
  {
    id: 'SA-20260312-01',
    taskName: '贵阳错峰训练批次-A',
    schemeName: '贵阳核心区绿电错峰方案',
    region: '贵阳核心区',
    feasibility: '高',
    matchLevel: '优',
    riskCount: 1,
    score: 91,
    analyzedAt: '2026-03-12 09:18',
    risks: ['午峰段绿电波动可能影响 8% 任务窗口'],
    suggestions: ['将可中断任务再延后 1 小时', '预留 10% GPU 弹性池'],
    summary: '大模型解析任务画像后，策略模型判定资源匹配充分，整体可行。',
  },
  {
    id: 'SA-20260312-02',
    taskName: '跨区推理高峰保供',
    schemeName: '遵义—贵阳跨区借用方案',
    region: '遵义/贵阳',
    feasibility: '中',
    matchLevel: '良',
    riskCount: 3,
    score: 76,
    analyzedAt: '2026-03-12 10:05',
    risks: [
      '跨区链路时延偶发超阈',
      '遵义侧可用卡数低于申请量',
      '碳配额临近上限',
    ],
    suggestions: [
      '降低非关键推理并发',
      '启用边缘节点分流',
      '优先绿电窗口调度',
    ],
    summary: '资源基本可匹配，但跨区与碳约束存在风险，建议优化后执行。',
  },
  {
    id: 'SA-20260311-03',
    taskName: '边缘巡检推理集群',
    schemeName: '毕节边缘推理保供方案',
    region: '毕节边缘',
    feasibility: '高',
    matchLevel: '良',
    riskCount: 1,
    score: 85,
    analyzedAt: '2026-03-11 16:40',
    risks: ['边缘节点存储水位偏高'],
    suggestions: ['提前清理冷数据', '高峰请求回源比例设为 15%'],
    summary: '时延优先策略匹配良好，任务可行性评估通过。',
  },
  {
    id: 'SA-20260310-04',
    taskName: '夜间大模型预训练',
    schemeName: '安顺夜间训练批处理方案',
    region: '安顺节点',
    feasibility: '低',
    matchLevel: '差',
    riskCount: 4,
    score: 52,
    analyzedAt: '2026-03-10 20:12',
    risks: [
      'GPU 缺口约 32 卡',
      '谷电窗口与任务时长不匹配',
      '检查点存储不足',
      '跨机房带宽瓶颈',
    ],
    suggestions: [
      '拆分为两晚执行',
      '临时扩容存储卷',
      '改用混合精度缩短时长',
    ],
    summary: '当前资源难以支撑完整训练，建议调整策略或延期。',
  },
  {
    id: 'SA-20260309-05',
    taskName: '碳约束削峰演练',
    schemeName: '凯里碳约束削峰方案',
    region: '凯里节点',
    feasibility: '中',
    matchLevel: '一般',
    riskCount: 2,
    score: 68,
    analyzedAt: '2026-03-09 14:22',
    risks: ['降载可能影响在线业务 SLA', '替代绿电路径容量不足'],
    suggestions: ['按业务优先级阶梯降载', '提前锁定绿电合约'],
    summary: '碳目标可达成，但业务连续性风险需人工复核确认。',
  },
];

export const strategyProcesses: StrategyProcessItem[] = [
  {
    id: 'CHK-20260312001',
    taskName: '贵阳错峰训练批次-A',
    schemeName: '贵阳核心区绿电错峰方案',
    status: '已完成',
    queue: '高优分析队列',
    priority: '高',
    createdAt: '2026-03-12 09:00',
    updatedAt: '2026-03-12 09:18',
    context: '任务类型=训练；申请 GPU=64；绿电约束=开启；时延上限=无',
    progress: 100,
  },
  {
    id: 'CHK-20260312002',
    taskName: '跨区推理高峰保供',
    schemeName: '遵义—贵阳跨区借用方案',
    status: '分析中',
    queue: '标准分析队列',
    priority: '高',
    createdAt: '2026-03-12 09:50',
    updatedAt: '2026-03-12 10:02',
    context: '任务类型=推理；申请 GPU=24；跨区=是；碳配额校验=开启',
    progress: 62,
  },
  {
    id: 'CHK-20260312003',
    taskName: '文档解析批量推理',
    schemeName: '全网日前统一编排方案',
    status: '排队中',
    queue: '标准分析队列',
    priority: '中',
    createdAt: '2026-03-12 10:10',
    updatedAt: '2026-03-12 10:10',
    context: '任务类型=推理；申请 GPU=8；数据量=500GB',
    progress: 10,
  },
  {
    id: 'CHK-20260311008',
    taskName: '边缘巡检推理集群',
    schemeName: '毕节边缘推理保供方案',
    status: '已完成',
    queue: '边缘专用队列',
    priority: '中',
    createdAt: '2026-03-11 16:20',
    updatedAt: '2026-03-11 16:40',
    context: '任务类型=推理；边缘节点=毕节；SLA=50ms',
    progress: 100,
  },
  {
    id: 'CHK-20260310004',
    taskName: '夜间大模型预训练',
    schemeName: '安顺夜间训练批处理方案',
    status: '失败',
    queue: '高优分析队列',
    priority: '高',
    createdAt: '2026-03-10 19:40',
    updatedAt: '2026-03-10 20:15',
    context: '任务类型=训练；申请 GPU=128；预计时长=14h',
    progress: 40,
  },
  {
    id: 'CHK-20260312006',
    taskName: '营销语音客服扩容',
    schemeName: '全网日前统一编排方案',
    status: '已登记',
    queue: '标准分析队列',
    priority: '低',
    createdAt: '2026-03-12 11:05',
    updatedAt: '2026-03-12 11:05',
    context: '任务类型=推理；申请 GPU=4；时段=全天',
    progress: 0,
  },
];

export const strategyConfirms: StrategyConfirmItem[] = [
  {
    id: 'CF-01',
    conclusionId: 'CN-20260312-01',
    schemeName: '贵阳核心区绿电错峰方案',
    analysisId: 'SA-20260312-01',
    conclusion: '可行：建议按当前策略执行，并采纳弹性池预留建议。',
    status: '待确认',
    submitter: '校核引擎',
    submittedAt: '2026-03-12 09:20',
    reviewer: '-',
    reviewedAt: '-',
    logs: [
      {
        time: '2026-03-12 09:18',
        operator: '校核引擎',
        action: '生成结论',
        remark: '自动分析完成',
      },
      {
        time: '2026-03-12 09:20',
        operator: '系统',
        action: '提交确认',
        remark: '进入人工确认队列',
      },
    ],
  },
  {
    id: 'CF-02',
    conclusionId: 'CN-20260312-02',
    schemeName: '遵义—贵阳跨区借用方案',
    analysisId: 'SA-20260312-02',
    conclusion: '有条件可行：需先完成风险缓解项后再执行。',
    status: '待确认',
    submitter: '校核引擎',
    submittedAt: '2026-03-12 10:08',
    reviewer: '-',
    reviewedAt: '-',
    logs: [
      {
        time: '2026-03-12 10:05',
        operator: '校核引擎',
        action: '生成结论',
        remark: '识别 3 项风险',
      },
      {
        time: '2026-03-12 10:08',
        operator: '系统',
        action: '提交确认',
        remark: '等待调度员确认',
      },
    ],
  },
  {
    id: 'CF-03',
    conclusionId: 'CN-20260311-03',
    schemeName: '毕节边缘推理保供方案',
    analysisId: 'SA-20260311-03',
    conclusion: '可行：边缘保供策略合理，允许执行。',
    status: '已通过',
    submitter: '校核引擎',
    submittedAt: '2026-03-11 16:45',
    reviewer: '张调度',
    reviewedAt: '2026-03-11 17:10',
    logs: [
      {
        time: '2026-03-11 16:40',
        operator: '校核引擎',
        action: '生成结论',
        remark: '可行性高',
      },
      {
        time: '2026-03-11 16:45',
        operator: '系统',
        action: '提交确认',
        remark: '-',
      },
      {
        time: '2026-03-11 17:10',
        operator: '张调度',
        action: '确认通过',
        remark: '同意执行并跟踪存储水位',
      },
    ],
  },
  {
    id: 'CF-04',
    conclusionId: 'CN-20260310-04',
    schemeName: '安顺夜间训练批处理方案',
    analysisId: 'SA-20260310-04',
    conclusion: '不可行：资源缺口显著，驳回本轮执行申请。',
    status: '已驳回',
    submitter: '校核引擎',
    submittedAt: '2026-03-10 20:20',
    reviewer: '李主管',
    reviewedAt: '2026-03-10 21:05',
    logs: [
      {
        time: '2026-03-10 20:12',
        operator: '校核引擎',
        action: '生成结论',
        remark: '可行性低',
      },
      {
        time: '2026-03-10 20:20',
        operator: '系统',
        action: '提交确认',
        remark: '-',
      },
      {
        time: '2026-03-10 21:05',
        operator: '李主管',
        action: '驳回',
        remark: '请拆分任务后重新校核',
      },
    ],
  },
  {
    id: 'CF-05',
    conclusionId: 'CN-20260309-05',
    schemeName: '凯里碳约束削峰方案',
    analysisId: 'SA-20260309-05',
    conclusion: '有条件可行：通过阶梯降载策略后可执行。',
    status: '已通过',
    submitter: '校核引擎',
    submittedAt: '2026-03-09 14:30',
    reviewer: '王评估',
    reviewedAt: '2026-03-09 15:40',
    logs: [
      {
        time: '2026-03-09 14:22',
        operator: '校核引擎',
        action: '生成结论',
        remark: '-',
      },
      {
        time: '2026-03-09 15:40',
        operator: '王评估',
        action: '确认通过',
        remark: '要求启用阶梯降载',
      },
    ],
  },
];
