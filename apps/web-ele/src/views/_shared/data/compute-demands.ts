/** 我的算力需求 mock */

export type DemandStatus = '进行中' | '已完成' | '待确认' | '已取消' | '审核中';
export type DataTypeTag = '目标检测' | '图片分类' | '文本分类' | '语音识别';

export interface ComputeDemand {
  id: string;
  demandId: string;
  modelName: string;
  datasetName: string;
  dataType: DataTypeTag;
  fileCount: number;
  consigner: string;
  taskTime: string;
  status: DemandStatus;
  progressDone: number;
  progressTotal: number;
}

export interface WizardApp {
  id: string;
  name: string;
  category: string;
  domain: string;
  desc: string;
  favorited: boolean;
  version: string;
  owner: string;
}

export interface WizardMaterial {
  id: string;
  name: string;
  type: string;
  fileName: string;
  uploadedAt: string;
  imageCount?: number;
}

export interface PreferOption {
  key: 'time' | 'price' | 'carbon';
  title: string;
  icon: string;
  cost: number;
  minutes: number;
  carbonKg: number;
}

export const modelTypeOptions = [
  '全部',
  '目标检测',
  '图片分类',
  '文本分类',
  '语音识别',
] as const;

export const statusOptions: Array<DemandStatus | '全部'> = [
  '全部',
  '进行中',
  '已完成',
  '待确认',
  '已取消',
  '审核中',
];

export const computeDemandList: ComputeDemand[] = [
  {
    id: '1',
    demandId: 'XQID-20260315001',
    modelName: '长延时智算产品1',
    datasetName: '安全帽佩戴识别 V1',
    dataType: '目标检测',
    fileCount: 1000,
    consigner: 'Anna',
    taskTime: '2026-03-15 10:20:00',
    status: '进行中',
    progressDone: 10,
    progressTotal: 1000,
  },
  {
    id: '2',
    demandId: 'XQID-20260314012',
    modelName: '电力语音客服',
    datasetName: '客服话术语料 V2',
    dataType: '语音识别',
    fileCount: 500,
    consigner: 'AierSha',
    taskTime: '2026-03-14 16:45:00',
    status: '已完成',
    progressDone: 500,
    progressTotal: 500,
  },
  {
    id: '3',
    demandId: 'XQID-20260313008',
    modelName: '目标识别训练',
    datasetName: '巡检缺陷样本集',
    dataType: '目标检测',
    fileCount: 2000,
    consigner: 'LINa',
    taskTime: '2026-03-13 09:10:00',
    status: '待确认',
    progressDone: 2000,
    progressTotal: 2000,
  },
  {
    id: '4',
    demandId: 'XQID-20260312005',
    modelName: '文档智能摘要',
    datasetName: '合同文本集 V1',
    dataType: '文本分类',
    fileCount: 300,
    consigner: 'Anna',
    taskTime: '2026-03-12 14:22:00',
    status: '已取消',
    progressDone: 0,
    progressTotal: 300,
  },
  {
    id: '5',
    demandId: 'XQID-20260311018',
    modelName: '工业质检视觉',
    datasetName: '产线缺陷图片 V3',
    dataType: '图片分类',
    fileCount: 1500,
    consigner: 'ZhangWei',
    taskTime: '2026-03-11 11:05:00',
    status: '进行中',
    progressDone: 860,
    progressTotal: 1500,
  },
  {
    id: '6',
    demandId: 'XQID-20260310003',
    modelName: '多模态内容审核',
    datasetName: '审核样本库 V1',
    dataType: '图片分类',
    fileCount: 800,
    consigner: 'LINa',
    taskTime: '2026-03-10 08:40:00',
    status: '审核中',
    progressDone: 0,
    progressTotal: 800,
  },
  {
    id: '7',
    demandId: 'XQID-20260309021',
    modelName: '长延时智算产品2',
    datasetName: '大模型微调数据集',
    dataType: '文本分类',
    fileCount: 5000,
    consigner: 'AierSha',
    taskTime: '2026-03-09 19:30:00',
    status: '已完成',
    progressDone: 5000,
    progressTotal: 5000,
  },
  {
    id: '8',
    demandId: 'XQID-20260308007',
    modelName: '气象数值仿真',
    datasetName: '区域气象网格数据',
    dataType: '图片分类',
    fileCount: 1200,
    consigner: 'Anna',
    taskTime: '2026-03-08 13:15:00',
    status: '待确认',
    progressDone: 1200,
    progressTotal: 1200,
  },
];

export const wizardApps: WizardApp[] = [
  {
    id: 'app-1',
    name: '长延迟智算产品1',
    category: '训练类',
    domain: '图像处理',
    desc: '面向长周期训练任务的智算应用，支持多卡分布式训练与绿电调度策略。',
    favorited: true,
    version: 'V2.0',
    owner: 'admin',
  },
  {
    id: 'app-2',
    name: '电力语音客服',
    category: '推理类',
    domain: '语音回复',
    desc: '基于语音识别与大模型问答的电力客服应用，支持工单受理与业务咨询。',
    favorited: false,
    version: 'V1.0',
    owner: 'admin',
  },
  {
    id: 'app-3',
    name: '目标识别产品',
    category: '训练类',
    domain: '目标识别',
    desc: 'YOLO 系列目标检测训练应用，支持自定义数据集导入与超参配置。',
    favorited: true,
    version: 'V1.2',
    owner: 'admin',
  },
  {
    id: 'app-4',
    name: '长延迟智算产品2',
    category: '训练类',
    domain: '图像处理',
    desc: '适用于大模型预训练与微调场景的智算模板，支持弹性扩缩。',
    favorited: false,
    version: 'V1.1',
    owner: 'user123',
  },
  {
    id: 'app-5',
    name: '长延迟智算产品3',
    category: '推理类',
    domain: '文本生成',
    desc: '面向文档摘要与内容生成的推理应用，支持批量处理与多语言。',
    favorited: false,
    version: 'V1.3',
    owner: 'admin',
  },
  {
    id: 'app-6',
    name: '长延迟智算产品4',
    category: '分析类',
    domain: '数据分析',
    desc: '结合负荷与气象数据的分析应用，输出调度建议与碳排放估算。',
    favorited: true,
    version: 'V1.0',
    owner: 'user456',
  },
];

export const wizardMaterials: WizardMaterial[] = [
  {
    id: 'YY-1',
    name: '机巡缺陷识别样本集',
    type: 'AI训练',
    fileName: 'jixun_2026.zip',
    uploadedAt: '2026-01-27 10:37:04',
    imageCount: 3000,
  },
  {
    id: 'YY-2',
    name: '客服话术训练语料',
    type: '文本训练',
    fileName: 'corpus_v2.xlsx',
    uploadedAt: '2026-01-26 16:12:33',
    imageCount: 0,
  },
  {
    id: 'YY-3',
    name: '安全帽佩戴图片集',
    type: 'AI训练',
    fileName: 'helmet_v1.zip',
    uploadedAt: '2026-01-25 09:20:11',
    imageCount: 1200,
  },
  {
    id: 'YY-4',
    name: '产线质检样本包',
    type: 'AI训练',
    fileName: 'qc_samples.zip',
    uploadedAt: '2026-01-24 14:08:55',
    imageCount: 800,
  },
];

export const preferOptions: PreferOption[] = [
  {
    key: 'time',
    title: '时间优先',
    icon: '⏱',
    cost: 2000,
    minutes: 1800,
    carbonKg: 2,
  },
  {
    key: 'price',
    title: '电价优先',
    icon: '⚡',
    cost: 1200,
    minutes: 3000,
    carbonKg: 1.2,
  },
  {
    key: 'carbon',
    title: '低碳优先',
    icon: '🌿',
    cost: 1300,
    minutes: 2800,
    carbonKg: 1.1,
  },
];
