/** 我的需求 / 我的应用 mock */

export type AppCategory = '训练类' | '推理类' | '分析类' | '渲染类';
export type AppDomain =
  | '图像处理'
  | '语音回复'
  | '文本生成'
  | '目标识别'
  | '数据分析'
  | '科学计算';

export interface MyAppItem {
  id: string;
  name: string;
  creator: string;
  verified: boolean;
  favorites: number;
  updatedAt: string;
  desc: string;
  category: AppCategory;
  domain: AppDomain;
  owned: boolean;
  favorited: boolean;
  version: string;
  enabled: boolean;
}

export interface AppMaterial {
  id: string;
  name: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export const myApps: MyAppItem[] = [
  {
    id: 'app-1',
    name: '长延迟智算产品',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 11_003,
    updatedAt: '2026-01-19',
    desc: '面向长周期训练任务的智算应用模板，支持多卡分布式训练与绿电调度策略，适用于大模型预训练与微调场景。',
    category: '训练类',
    domain: '图像处理',
    owned: false,
    favorited: true,
    version: 'V1.2',
    enabled: true,
  },
  {
    id: 'app-2',
    name: '电力语音客服',
    creator: '用户123',
    verified: true,
    favorites: 8560,
    updatedAt: '2026-01-18',
    desc: '基于语音识别与大模型问答的电力客服应用，支持工单受理、业务咨询与情绪识别，可对接企业知识库。',
    category: '推理类',
    domain: '语音回复',
    owned: true,
    favorited: false,
    version: 'V1.0',
    enabled: true,
  },
  {
    id: 'app-3',
    name: '目标识别训练',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 12_420,
    updatedAt: '2026-01-17',
    desc: 'YOLO 系列目标检测模型训练应用，支持自定义数据集导入、超参配置与训练过程可视化监控。',
    category: '训练类',
    domain: '目标识别',
    owned: false,
    favorited: true,
    version: 'V2.1',
    enabled: true,
  },
  {
    id: 'app-4',
    name: '电力负荷预测助手',
    creator: '用户456',
    verified: false,
    favorites: 3201,
    updatedAt: '2026-01-15',
    desc: '结合历史负荷与气象数据的短期负荷预测应用，输出调度建议与碳排放估算，服务能源运营决策。',
    category: '分析类',
    domain: '数据分析',
    owned: true,
    favorited: true,
    version: 'V1.1',
    enabled: false,
  },
  {
    id: 'app-5',
    name: '文档智能摘要',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 9800,
    updatedAt: '2026-01-12',
    desc: '面向长文档的智能摘要与关键词抽取应用，支持批量上传与多语言处理，适用于合同与报告场景。',
    category: '推理类',
    domain: '文本生成',
    owned: false,
    favorited: false,
    version: 'V1.3',
    enabled: true,
  },
  {
    id: 'app-6',
    name: '气象数值仿真',
    creator: '用户789',
    verified: true,
    favorites: 2156,
    updatedAt: '2026-01-10',
    desc: '区域精细化气象数值预报仿真应用，支持高分辨率网格计算与多模式集合预报任务提交。',
    category: '分析类',
    domain: '科学计算',
    owned: true,
    favorited: false,
    version: 'V1.0',
    enabled: true,
  },
  {
    id: 'app-7',
    name: '工业质检视觉',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 6740,
    updatedAt: '2026-01-08',
    desc: '面向产线的缺陷检测推理应用，支持低速/高速产线素材配置，输出质检报告与告警推送。',
    category: '推理类',
    domain: '图像处理',
    owned: false,
    favorited: true,
    version: 'V1.4',
    enabled: true,
  },
  {
    id: 'app-8',
    name: '云端影视渲染',
    creator: '用户123',
    verified: true,
    favorites: 4520,
    updatedAt: '2026-01-05',
    desc: '云端渲染应用模板，支持动画与特效渲染任务排队，结合错峰用电策略降低渲染成本。',
    category: '渲染类',
    domain: '图像处理',
    owned: true,
    favorited: false,
    version: 'V1.0',
    enabled: true,
  },
  {
    id: 'app-9',
    name: '多模态内容审核',
    creator: '电碳算协同运营系统',
    verified: true,
    favorites: 7330,
    updatedAt: '2026-01-03',
    desc: '图文音视频多模态内容审核应用，支持自定义规则库与人工复核工作流，服务内容安全场景。',
    category: '推理类',
    domain: '图像处理',
    owned: false,
    favorited: false,
    version: 'V2.0',
    enabled: true,
  },
];

export const appTypeOptions = [
  '训练类',
  '推理类',
  '分析类',
  '渲染类',
] as const;

export const defaultMaterials: AppMaterial[] = [
  {
    id: 'YY-1',
    name: '低速缺陷识别样本集',
    type: 'AI训练',
    fileName: 'jixun_2026.zip',
    uploadedAt: '2026-01-27 10:37:04',
  },
  {
    id: 'YY-2',
    name: '客服话术训练语料',
    type: '文本训练',
    fileName: 'corpus_v2.xlsx',
    uploadedAt: '2026-01-26 16:12:33',
  },
];
