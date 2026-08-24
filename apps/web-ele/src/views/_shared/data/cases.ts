export type CaseBadgeType = 'success' | 'info' | 'gray';

export interface PortalCaseItem {
  icon: string;
  iconClass: 'green' | 'purple' | 'blue' | 'orange';
  title: string;
  /** 首页节点条短名 */
  shortName?: string;
  desc: string;
  region?: string;
  badges: Array<{ text: string; type: CaseBadgeType }>;
}

/** 案例中心 - 列表项 */
export type CaseServiceType = '智算服务' | '通用服务';

export type CaseScenario =
  | 'AI训练'
  | '科学计算'
  | '数据分析'
  | '渲染服务';

export interface CaseListItem {
  id: string;
  title: string;
  type: CaseServiceType;
  scenario: CaseScenario;
  dataCenter: string;
  publishedAt: string;
  carbonReduction: number;
  desc: string;
  cover: string;
  tags: string[];
}

/** 案例中心与首页共用（机房/网络节点） */
export const portalCases: PortalCaseItem[] = [
  {
    icon: '🏭',
    iconClass: 'green',
    title: '贵州南方能源大数据中心',
    shortName: '贵州智算基地',
    region: '贵安新区',
    desc: '位于贵州省贵安新区，依托丰富水电资源，绿电占比达 90% 以上。部署 NVIDIA A100/H100 GPU 集群，总算力 500+ PFLOPS，是南方区域核心智算基地。',
    badges: [
      { text: '运行中', type: 'success' },
      { text: '500+ PFLOPS', type: 'info' },
      { text: '绿电 90%', type: 'gray' },
    ],
  },
  {
    icon: '🏙️',
    iconClass: 'purple',
    title: '广州数据中心集群',
    shortName: '广州集群',
    region: '南沙区',
    desc: '位于广州市南沙区，辐射珠三角算力需求，部署 GPU 推理集群与通用计算实例，总机架 2000+，提供低延迟智算与通算服务。',
    badges: [
      { text: '运行中', type: 'success' },
      { text: '2000+ 机架', type: 'info' },
      { text: '绿电 72%', type: 'gray' },
    ],
  },
  {
    icon: '🌐',
    iconClass: 'blue',
    title: '惠州数据中心',
    shortName: '惠州中心',
    region: '大亚湾区',
    desc: '位于惠州市大亚湾区，服务于粤港澳大湾区算力需求，聚焦企业级算力服务，总机架 1200+，支持混合云部署。',
    badges: [
      { text: '运行中', type: 'success' },
      { text: '1200+ 机架', type: 'info' },
      { text: '绿电 68%', type: 'gray' },
    ],
  },
  {
    icon: '📡',
    iconClass: 'orange',
    title: '边缘算力节点网',
    shortName: '边缘节点网',
    region: '南方五省区',
    desc: '覆盖南方五省区 200+ 边缘节点，提供就近计算与低延迟推理服务，支持物联网、视频分析等实时场景。',
    badges: [
      { text: '运行中', type: 'success' },
      { text: '200+ 节点', type: 'info' },
      { text: '绿电 90%', type: 'gray' },
    ],
  },
  {
    icon: '🔗',
    iconClass: 'green',
    title: '"3+1+X"算力网络',
    shortName: '3+1+X 架构',
    region: '全域架构',
    desc: '三大数据中心 + 统一调度平台 + X个边缘节点，构建绿色节能算力网络，支撑"东数西算"国家战略实施。',
    badges: [
      { text: '3+1+X 架构', type: 'info' },
      { text: '跨域调度', type: 'gray' },
    ],
  },
  {
    icon: '⚡',
    iconClass: 'purple',
    title: '全国一体化算力网对接',
    shortName: '一体化对接',
    region: '国家级',
    desc: '与全域一体化数算网调度平台对接，精准匹配全国算力需求，优化算力资源使用效率。',
    badges: [
      { text: '国家级对接', type: 'info' },
      { text: '跨省调度', type: 'gray' },
    ],
  },
];

export const caseServiceTypes: Array<CaseServiceType | '全部案例'> = [
  '全部案例',
  '通用服务',
  '智算服务',
];

export const caseScenarios: CaseScenario[] = [
  'AI训练',
  '科学计算',
  '数据分析',
  '渲染服务',
];

export const caseDataCenters = [
  '广州超算中心',
  '深圳智算中心',
  '珠海数据中心',
];

/** 算力案例资讯列表 mock（12 条） */
export const caseListItems: CaseListItem[] = [
  {
    id: 'c1',
    title: '某企业 AI 大模型训练案例',
    type: '智算服务',
    scenario: 'AI训练',
    dataCenter: '深圳智算中心',
    publishedAt: '2026-02-15',
    carbonReduction: 32,
    desc: '基于 A100 GPU 集群完成千亿参数大模型分布式训练，结合绿电调度与电碳协同策略，显著降低训练过程碳排放。',
    cover: '🖥️',
    tags: ['大模型', '分布式训练', '绿色计算'],
  },
  {
    id: 'c2',
    title: '某高校科学计算平台案例',
    type: '通用服务',
    scenario: '科学计算',
    dataCenter: '广州超算中心',
    publishedAt: '2026-02-10',
    carbonReduction: 28,
    desc: '为高校科研团队搭建高性能科学计算平台，支撑气象模拟、分子动力学等大规模并行计算任务。',
    cover: '🔬',
    tags: ['HPC', '科研计算', '并行计算'],
  },
  {
    id: 'c3',
    title: '某金融机构数据分析案例',
    type: '通用服务',
    scenario: '数据分析',
    dataCenter: '珠海数据中心',
    publishedAt: '2026-02-05',
    carbonReduction: 25,
    desc: '利用通算资源构建实时风控与数据分析平台，实现海量交易数据的低时延处理与智能决策支持。',
    cover: '📊',
    tags: ['风控', '实时分析', '金融科技'],
  },
  {
    id: 'c4',
    title: '某影视公司渲染服务案例',
    type: '智算服务',
    scenario: '渲染服务',
    dataCenter: '深圳智算中心',
    publishedAt: '2026-01-28',
    carbonReduction: 30,
    desc: '部署 RTX 4090 渲染集群，为影视动画制作提供云端渲染服务，结合错峰用电策略降低整体能耗。',
    cover: '🎬',
    tags: ['云渲染', '动画制作', '错峰调度'],
  },
  {
    id: 'c5',
    title: '某自动驾驶模型训练案例',
    type: '智算服务',
    scenario: 'AI训练',
    dataCenter: '广州超算中心',
    publishedAt: '2026-01-20',
    carbonReduction: 35,
    desc: '面向自动驾驶感知模型训练，采用多卡互联与混合精度加速，结合绿电配额实现低碳智算。',
    cover: '🚗',
    tags: ['自动驾驶', '感知模型', '混合精度'],
  },
  {
    id: 'c6',
    title: '某基因测序数据分析案例',
    type: '通用服务',
    scenario: '数据分析',
    dataCenter: '深圳智算中心',
    publishedAt: '2026-01-15',
    carbonReduction: 22,
    desc: '为生物信息学研究提供高通量测序数据分析能力，支持基因组比对、变异检测等批处理任务。',
    cover: '🧬',
    tags: ['生物信息', '基因测序', '批处理'],
  },
  {
    id: 'c7',
    title: '某气象数值预报计算案例',
    type: '通用服务',
    scenario: '科学计算',
    dataCenter: '珠海数据中心',
    publishedAt: '2026-01-08',
    carbonReduction: 27,
    desc: '支撑区域精细化气象数值预报，利用 CPU 集群完成高分辨率网格计算与多模式集合预报。',
    cover: '🌦️',
    tags: ['气象预报', '数值模拟', '集合预报'],
  },
  {
    id: 'c8',
    title: '某游戏引擎实时渲染案例',
    type: '智算服务',
    scenario: '渲染服务',
    dataCenter: '广州超算中心',
    publishedAt: '2025-12-28',
    carbonReduction: 29,
    desc: '为游戏开发团队提供云端实时渲染与光照烘焙服务，缩短开发周期并降低本地硬件投入。',
    cover: '🎮',
    tags: ['游戏开发', '实时渲染', '光照烘焙'],
  },
  {
    id: 'c9',
    title: '某电商推荐模型训练案例',
    type: '智算服务',
    scenario: 'AI训练',
    dataCenter: '深圳智算中心',
    publishedAt: '2025-12-20',
    carbonReduction: 31,
    desc: '基于 GPU 集群训练大规模推荐模型，结合特征工程流水线实现日级模型迭代与 A/B 测试。',
    cover: '🛒',
    tags: ['推荐系统', '特征工程', '模型迭代'],
  },
  {
    id: 'c10',
    title: '某制造行业仿真计算案例',
    type: '通用服务',
    scenario: '科学计算',
    dataCenter: '广州超算中心',
    publishedAt: '2025-12-12',
    carbonReduction: 24,
    desc: '为制造业客户提供 CFD 流体仿真与结构力学分析服务，加速产品研发与工艺优化。',
    cover: '🏭',
    tags: ['CFD', '结构仿真', '工艺优化'],
  },
  {
    id: 'c11',
    title: '某智慧城市视频分析案例',
    type: '智算服务',
    scenario: 'AI训练',
    dataCenter: '珠海数据中心',
    publishedAt: '2025-12-05',
    carbonReduction: 26,
    desc: '训练多目标检测与行为识别模型，支撑智慧城市视频分析场景，实现边缘-云端协同推理。',
    cover: '🏙️',
    tags: ['视频分析', '目标检测', '边缘协同'],
  },
  {
    id: 'c12',
    title: '某能源企业负荷预测案例',
    type: '通用服务',
    scenario: '数据分析',
    dataCenter: '深圳智算中心',
    publishedAt: '2025-11-28',
    carbonReduction: 23,
    desc: '构建电力负荷预测与碳排放核算模型，为能源调度提供数据支撑，实现算力与电力的协同优化。',
    cover: '⚡',
    tags: ['负荷预测', '碳核算', '能源调度'],
  },
];
