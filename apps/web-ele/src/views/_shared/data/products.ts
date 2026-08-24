export interface ProductSku {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  vram: string;
  cpu: string;
  memory: string;
  priceHour: string;
  priceSecond: string;
}

export interface ProductModelInfo {
  name: string;
  vendor: string;
  type: string;
  context: string;
  note: string;
}

export interface ProductReview {
  user: string;
  rating: number;
  time: string;
  content: string;
}

export interface ProductItem {
  id: string;
  icon: string;
  name: string;
  desc: string;
  region: string;
  type: string;
  green: string;
  price: string;
  rating: number;
  usage: string;
  favorites: number;
  tags: string[];
  fullDesc: string;
  skus: ProductSku[];
  models: ProductModelInfo[];
  reviews: ProductReview[];
}

const defaultSkus: ProductSku[] = [
  {
    id: '5090-1',
    title: '5090',
    subtitle: '1 卡机',
    badge: '绿色低碳',
    vram: '32G 显存',
    cpu: '16 核',
    memory: '64G 内存',
    priceHour: '¥2.50',
    priceSecond: '约 ¥0.000694 / 秒',
  },
  {
    id: '4090-1',
    title: '4090',
    subtitle: '1 卡机',
    badge: '绿色低碳',
    vram: '24G 显存',
    cpu: '16 核',
    memory: '63G 内存',
    priceHour: '¥1.80',
    priceSecond: '约 ¥0.000500 / 秒',
  },
  {
    id: '4090-2',
    title: '4090',
    subtitle: '2 卡机',
    badge: '绿色低碳',
    vram: '48G 显存',
    cpu: '32 核',
    memory: '128G 内存',
    priceHour: '¥3.40',
    priceSecond: '约 ¥0.000944 / 秒',
  },
];

const defaultModels: ProductModelInfo[] = [
  {
    name: 'Qwen3.7-Plus',
    vendor: '千问',
    type: '问答模型',
    context: '128K',
    note: '适合客服问答与知识库检索',
  },
  {
    name: 'DeepSeek-V4',
    vendor: 'DeepSeek',
    type: '推理模型',
    context: '64K',
    note: '适合复杂推理与代码生成',
  },
];

const defaultReviews: ProductReview[] = [
  {
    user: '张**',
    rating: 5,
    time: '2026-08-10',
    content: '绿电占比高，训练任务稳定，账单按秒计费很透明。',
  },
  {
    user: '李**',
    rating: 4,
    time: '2026-08-02',
    content: '推理延迟可控，规格切换方便，希望后续再增加更多区域节点。',
  },
  {
    user: '王**',
    rating: 4,
    time: '2026-07-21',
    content: '适合中小团队快速上手，文档清晰，客服响应及时。',
  },
];

/** 产品服务列表与详情共用 */
export const portalProducts: ProductItem[] = [
  {
    id: 'gpu-guizhou-a',
    icon: '🖥️',
    name: '绿色低碳智算产品',
    desc: 'NVIDIA A100 × 8卡集群，支持大模型分布式训练，绿电占比 85%。',
    region: '贵州',
    type: 'GPU 智算',
    green: '绿电 85%',
    price: '¥2.8/小时',
    rating: 4.0,
    usage: '1.2w次使用',
    favorites: 3490,
    tags: ['#AI大模型训练', '#负荷调度'],
    fullDesc:
      '面向大模型训练与推理的绿色低碳智算产品，依托贵州高绿电资源与跨域调度能力，提供可计量、可追溯的算力供给。支持多卡并行、弹性扩缩与按秒计费，兼顾性能与碳排约束。',
    skus: defaultSkus,
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'gpu-guangzhou-b',
    icon: '🖥️',
    name: 'GPU 智算服务 - 广州B区',
    desc: 'NVIDIA H100 × 4卡集群，高性能推理，低延迟响应，绿电占比 72%。',
    region: '广州',
    type: 'GPU 智算',
    green: '绿电 72%',
    price: '¥3.5/小时',
    rating: 4.5,
    usage: '8.6k次使用',
    favorites: 2180,
    tags: ['#低延迟推理', '#湾区算力'],
    fullDesc:
      '部署于广州南沙智算集群，面向珠三角低延迟推理场景。H100 规格适合在线推理与混合批处理，支持区域就近调度与绿电优先策略。',
    skus: [
      {
        id: 'h100-1',
        title: 'H100',
        subtitle: '1 卡机',
        badge: '绿色低碳',
        vram: '80G 显存',
        cpu: '24 核',
        memory: '96G 内存',
        priceHour: '¥3.50',
        priceSecond: '约 ¥0.000972 / 秒',
      },
      {
        id: 'h100-2',
        title: 'H100',
        subtitle: '2 卡机',
        badge: '绿色低碳',
        vram: '160G 显存',
        cpu: '48 核',
        memory: '192G 内存',
        priceHour: '¥6.80',
        priceSecond: '约 ¥0.001889 / 秒',
      },
      {
        id: 'l40s-1',
        title: 'L40S',
        subtitle: '1 卡机',
        badge: '绿色低碳',
        vram: '48G 显存',
        cpu: '16 核',
        memory: '64G 内存',
        priceHour: '¥2.20',
        priceSecond: '约 ¥0.000611 / 秒',
      },
    ],
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'cpu-guizhou-c',
    icon: '☁️',
    name: '通用算力服务 - 贵州C区',
    desc: 'AMD EPYC 64核实例，适合通算类任务，大内存高带宽，绿电占比 90%。',
    region: '贵州',
    type: 'CPU 通算',
    green: '绿电 90%',
    price: '¥0.8/小时',
    rating: 4.2,
    usage: '5.1k次使用',
    favorites: 1260,
    tags: ['#通算', '#高内存'],
    fullDesc:
      '通用算力实例面向 ETL、批处理与后台服务。依托贵州绿电优势，在保障性能的同时降低综合用电成本与碳足迹。',
    skus: [
      {
        id: 'epyc-32',
        title: 'EPYC',
        subtitle: '32 核',
        badge: '绿色低碳',
        vram: '-',
        cpu: '32 核',
        memory: '64G 内存',
        priceHour: '¥0.60',
        priceSecond: '约 ¥0.000167 / 秒',
      },
      {
        id: 'epyc-64',
        title: 'EPYC',
        subtitle: '64 核',
        badge: '绿色低碳',
        vram: '-',
        cpu: '64 核',
        memory: '128G 内存',
        priceHour: '¥0.80',
        priceSecond: '约 ¥0.000222 / 秒',
      },
      {
        id: 'epyc-96',
        title: 'EPYC',
        subtitle: '96 核',
        badge: '绿色低碳',
        vram: '-',
        cpu: '96 核',
        memory: '256G 内存',
        priceHour: '¥1.20',
        priceSecond: '约 ¥0.000333 / 秒',
      },
    ],
    models: [],
    reviews: defaultReviews,
  },
  {
    id: 'cpu-huizhou-d',
    icon: '☁️',
    name: '通用算力服务 - 惠州D区',
    desc: 'Intel Xeon 32核实例，企业级稳定性，适合后台批处理任务。',
    region: '惠州',
    type: 'CPU 通算',
    green: '绿电 68%',
    price: '¥0.6/小时',
    rating: 4.1,
    usage: '3.4k次使用',
    favorites: 860,
    tags: ['#企业级', '#批处理'],
    fullDesc:
      '惠州通算节点，强调稳定性与成本可控，适合企业后台任务、定时作业与轻量服务部署。',
    skus: defaultSkus.map((s, i) => ({
      ...s,
      id: `cpu-d-${i}`,
      title: i === 0 ? 'Xeon' : s.title,
      subtitle: i === 0 ? '32 核' : s.subtitle,
      priceHour: i === 0 ? '¥0.60' : s.priceHour,
      priceSecond: i === 0 ? '约 ¥0.000167 / 秒' : s.priceSecond,
    })),
    models: [],
    reviews: defaultReviews,
  },
  {
    id: 'edge-south',
    icon: '🔗',
    name: '边缘算力服务 - 华南节点',
    desc: '200+ 边缘节点覆盖，毫秒级延迟，适合实时推理与物联网场景。',
    region: '边缘节点',
    type: '边缘算力',
    green: '绿电 90%',
    price: '¥1.5/小时',
    rating: 4.3,
    usage: '6.8k次使用',
    favorites: 1520,
    tags: ['#边缘推理', '#低延迟'],
    fullDesc:
      '覆盖南方五省边缘节点网络，就近提供推理算力，降低端到端时延，适合视频分析、物联网与实时决策场景。',
    skus: defaultSkus,
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'storage-dist',
    icon: '💾',
    name: '分布式存储服务',
    desc: '高可用对象存储，支持冷热数据分层，多副本冗余，数据持久性 99.999%。',
    region: '贵州',
    type: '存储服务',
    green: 'SSD 存储',
    price: '¥0.12/GB·月',
    rating: 4.4,
    usage: '9.2k次使用',
    favorites: 1890,
    tags: ['#对象存储', '#冷热分层'],
    fullDesc:
      '面向训练数据集与模型产物的分布式存储，支持冷热分层与多副本，保障高并发读写与数据安全。',
    skus: [
      {
        id: 'ssd-hot',
        title: 'SSD',
        subtitle: '热数据',
        badge: '高可用',
        vram: '-',
        cpu: '-',
        memory: '吞吐优先',
        priceHour: '¥0.35/GB·月',
        priceSecond: '按量计费',
      },
      {
        id: 'hdd-cold',
        title: 'HDD',
        subtitle: '冷数据',
        badge: '低成本',
        vram: '-',
        cpu: '-',
        memory: '容量优先',
        priceHour: '¥0.08/GB·月',
        priceSecond: '按量计费',
      },
      {
        id: 'archive',
        title: '归档',
        subtitle: '长期保存',
        badge: '低成本',
        vram: '-',
        cpu: '-',
        memory: '归档优先',
        priceHour: '¥0.03/GB·月',
        priceSecond: '按量计费',
      },
    ],
    models: [],
    reviews: defaultReviews,
  },
  {
    id: 'gpu-huizhou-e',
    icon: '🖥️',
    name: 'GPU 智算服务 - 惠州E区',
    desc: 'NVIDIA L40S × 8卡推理集群，面向在线推理与批处理混合场景。',
    region: '惠州',
    type: 'GPU 智算',
    green: '绿电 70%',
    price: '¥2.2/小时',
    rating: 4.2,
    usage: '4.7k次使用',
    favorites: 1120,
    tags: ['#推理集群', '#混合负载'],
    fullDesc:
      '惠州推理专区，L40S 规格兼顾性价比与吞吐，适合在线推理与批处理混合调度。',
    skus: defaultSkus,
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'cpu-guangzhou-f',
    icon: '☁️',
    name: '通用算力服务 - 广州F区',
    desc: '高主频 CPU 实例，适合实时交易风控与低延迟业务系统。',
    region: '广州',
    type: 'CPU 通算',
    green: '绿电 75%',
    price: '¥1.1/小时',
    rating: 4.0,
    usage: '2.9k次使用',
    favorites: 760,
    tags: ['#高主频', '#低延迟'],
    fullDesc:
      '高主频通算实例，面向风控、撮合与低延迟业务系统，提供稳定算力与就近接入。',
    skus: defaultSkus,
    models: [],
    reviews: defaultReviews,
  },
  {
    id: 'edge-southwest',
    icon: '🔗',
    name: '边缘算力服务 - 西南节点',
    desc: '覆盖贵州及周边城市边缘节点，支持视频分析与本地推理。',
    region: '边缘节点',
    type: '边缘算力',
    green: '绿电 88%',
    price: '¥1.3/小时',
    rating: 4.1,
    usage: '3.2k次使用',
    favorites: 940,
    tags: ['#视频分析', '#本地推理'],
    fullDesc:
      '西南边缘节点网，贴近业务现场提供本地推理能力，降低回传带宽与时延。',
    skus: defaultSkus,
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'storage-block',
    icon: '💾',
    name: '高性能块存储服务',
    desc: '低延迟块存储，适配训练数据集读写与模型 checkpoint 落盘。',
    region: '广州',
    type: '存储服务',
    green: 'NVMe',
    price: '¥0.35/GB·月',
    rating: 4.3,
    usage: '7.1k次使用',
    favorites: 1430,
    tags: ['#块存储', '#NVMe'],
    fullDesc:
      'NVMe 高性能块存储，面向训练 IO 密集场景，支持高 IOPS 与低延迟落盘。',
    skus: [
      {
        id: 'nvme-500',
        title: 'NVMe',
        subtitle: '500GB',
        badge: '高性能',
        vram: '-',
        cpu: '-',
        memory: '高 IOPS',
        priceHour: '¥0.35/GB·月',
        priceSecond: '按量计费',
      },
      {
        id: 'nvme-1t',
        title: 'NVMe',
        subtitle: '1TB',
        badge: '高性能',
        vram: '-',
        cpu: '-',
        memory: '高吞吐',
        priceHour: '¥0.32/GB·月',
        priceSecond: '按量计费',
      },
      {
        id: 'nvme-2t',
        title: 'NVMe',
        subtitle: '2TB',
        badge: '高性能',
        vram: '-',
        cpu: '-',
        memory: '大容量',
        priceHour: '¥0.30/GB·月',
        priceSecond: '按量计费',
      },
    ],
    models: [],
    reviews: defaultReviews,
  },
  {
    id: 'gpu-guizhou-b',
    icon: '🖥️',
    name: 'GPU 智算服务 - 贵州B区',
    desc: 'A800 × 16卡训练池，支持多租户队列与弹性扩缩。',
    region: '贵州',
    type: 'GPU 智算',
    green: '绿电 92%',
    price: '¥3.0/小时',
    rating: 4.6,
    usage: '1.5w次使用',
    favorites: 4020,
    tags: ['#多租户', '#弹性扩缩'],
    fullDesc:
      '贵州训练池支持多租户排队与弹性扩缩，绿电占比高，适合中大型训练任务与共享集群场景。',
    skus: defaultSkus,
    models: defaultModels,
    reviews: defaultReviews,
  },
  {
    id: 'cpu-huizhou-g',
    icon: '☁️',
    name: '通用算力服务 - 惠州G区',
    desc: '内存优化型实例，适合大数据 ETL 与内存计算任务。',
    region: '惠州',
    type: 'CPU 通算',
    green: '绿电 66%',
    price: '¥0.9/小时',
    rating: 3.9,
    usage: '2.1k次使用',
    favorites: 580,
    tags: ['#内存优化', '#ETL'],
    fullDesc:
      '内存优化型通算实例，面向大数据 ETL 与内存计算，提供更高内存带宽与性价比。',
    skus: defaultSkus,
    models: [],
    reviews: defaultReviews,
  },
];

export function getProductById(id: string) {
  return portalProducts.find((item) => item.id === id);
}
