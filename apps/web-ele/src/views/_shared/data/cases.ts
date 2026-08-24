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

/** 案例中心与首页共用 */
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
