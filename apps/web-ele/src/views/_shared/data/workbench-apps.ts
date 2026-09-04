/** 算力应用管理 mock 数据 */

export type AppShelfStatus =
  | '全部应用'
  | '审核中'
  | '已上架'
  | '未上架'
  | '素材合集';

export type AppBelongType =
  | '全部'
  | '官方创建'
  | '用户上传'
  | '终端通用'
  | '预置垂直';

export interface WorkbenchAppItem {
  id: string;
  name: string;
  creator: string;
  verified: boolean;
  favorites: number;
  visits: number;
  updatedAt: string;
  createdAt: string;
  desc: string;
  shelf: Exclude<AppShelfStatus, '全部应用' | '素材合集'>;
  belong: Exclude<AppBelongType, '全部'>;
  tags: string[];
  category: string;
  selected?: boolean;
}

export interface AppMaterialRow {
  id: string;
  name: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export interface AppTagItem {
  id: string;
  name: string;
  group: '应用标签' | '素材标签';
  color: 'blue' | 'green';
}

export interface CategoryNode {
  id: string;
  label: string;
  children?: CategoryNode[];
}

export const workbenchApps: WorkbenchAppItem[] = [
  {
    id: 'wa-1',
    name: '长延迟智算产品',
    creator: '电网公司山东分公司',
    verified: true,
    favorites: 11_000,
    visits: 11_928,
    updatedAt: '2026-01-18',
    createdAt: '2025-12-01',
    desc: 'YOLO (You Only Look Once) 面向长周期训练任务的智算应用，支持分布式训练与绿电调度策略。',
    shelf: '已上架',
    belong: '终端通用',
    tags: ['训练类'],
    category: '电力',
  },
  {
    id: 'wa-2',
    name: '电力语音客服',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 8560,
    visits: 9201,
    updatedAt: '2026-01-18',
    createdAt: '2025-11-20',
    desc: '基于语音识别与大模型问答的电力客服应用，支持工单受理与业务咨询。',
    shelf: '已上架',
    belong: '官方创建',
    tags: ['推理类'],
    category: '电力',
  },
  {
    id: 'wa-3',
    name: '目标识别训练',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 12_420,
    visits: 15_002,
    updatedAt: '2026-01-17',
    createdAt: '2025-10-08',
    desc: 'YOLO 系列目标检测模型训练应用，支持自定义数据集导入与训练过程监控。',
    shelf: '已上架',
    belong: '预置垂直',
    tags: ['训练类'],
    category: 'IT',
  },
  {
    id: 'wa-4',
    name: '长延迟智算产品2',
    creator: '电网公司山东分公司',
    verified: true,
    favorites: 6200,
    visits: 7100,
    updatedAt: '2026-01-16',
    createdAt: '2026-01-02',
    desc: '长延迟智算产品迭代版本，增强多机房协同与错峰调度能力。',
    shelf: '已上架',
    belong: '终端通用',
    tags: ['训练类'],
    category: '电力',
  },
  {
    id: 'wa-5',
    name: '长延迟智算产品3',
    creator: '用户上传工作室',
    verified: false,
    favorites: 2100,
    visits: 3400,
    updatedAt: '2026-01-15',
    createdAt: '2026-01-10',
    desc: '社区上传版本，适用于边缘侧小规模训练与推理联调。',
    shelf: '审核中',
    belong: '用户上传',
    tags: ['推理类'],
    category: '通讯',
  },
  {
    id: 'wa-6',
    name: '碳足迹核算助手',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 4300,
    visits: 5600,
    updatedAt: '2026-01-12',
    createdAt: '2025-09-18',
    desc: '面向电碳算场景的碳排放核算与报告生成应用。',
    shelf: '未上架',
    belong: '官方创建',
    tags: ['分析类'],
    category: '金融',
  },
  {
    id: 'wa-7',
    name: '配电负荷仿真',
    creator: '电网公司山东分公司',
    verified: true,
    favorites: 3900,
    visits: 4800,
    updatedAt: '2026-01-11',
    createdAt: '2025-08-22',
    desc: '配电网络负荷仿真与策略评估，支持多场景批量计算。',
    shelf: '已上架',
    belong: '预置垂直',
    tags: ['分析类'],
    category: '电力',
  },
  {
    id: 'wa-8',
    name: '医学影像辅助',
    creator: '科教联合实验室',
    verified: true,
    favorites: 1800,
    visits: 2200,
    updatedAt: '2026-01-09',
    createdAt: '2025-12-28',
    desc: '医学影像分割与辅助诊断训练模板（演示数据）。',
    shelf: '未上架',
    belong: '用户上传',
    tags: ['训练类'],
    category: '医疗',
  },
];

export const appMaterials: AppMaterialRow[] = [
  {
    id: 'YV-1',
    name: '纸质缺陷识别样本包',
    type: 'AI训练',
    fileName: 'defect-samples.zip',
    uploadedAt: '2026-01-18 10:22:11',
  },
  {
    id: 'YV-2',
    name: '客服话术语料',
    type: '文本训练',
    fileName: 'cs-corpus.zip',
    uploadedAt: '2026-01-17 16:08:45',
  },
  {
    id: 'YV-3',
    name: '目标检测标注集',
    type: 'AI训练',
    fileName: 'yolo-labels.zip',
    uploadedAt: '2026-01-16 09:41:02',
  },
];

export const appTags: AppTagItem[] = [
  { id: 't1', name: '推理类', group: '应用标签', color: 'blue' },
  { id: 't2', name: '训练类', group: '应用标签', color: 'blue' },
  { id: 't3', name: '图片分类', group: '素材标签', color: 'green' },
  { id: 't4', name: '目标识别', group: '素材标签', color: 'green' },
  { id: 't5', name: '表格分析', group: '素材标签', color: 'green' },
];

export const categoryTree: CategoryNode[] = [
  {
    id: 'c-power',
    label: '电力',
    children: [
      { id: 'c-power-dist', label: '配电自动化' },
      { id: 'c-power-voice', label: '语音客服' },
    ],
  },
  { id: 'c-finance', label: '金融' },
  { id: 'c-medical', label: '医疗' },
  {
    id: 'c-edu',
    label: '科教',
    children: [{ id: 'c-edu-lab', label: '联合实验室' }],
  },
  { id: 'c-comm', label: '通讯' },
  { id: 'c-it', label: 'IT' },
];

export const appTypeOptions = [
  '训练类',
  '推理类',
  '分析类',
  '渲染类',
];
