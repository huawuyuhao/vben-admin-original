/** 企业服务 — 算力供给 / 算力产品 mock */

export type SupplyStatus = '已确认' | '审核中' | '待审核' | '已取消';

export interface SupplyBatch {
  id: string;
  name: string;
  code: string;
  dataCenter: string;
  deviceType: string;
  quantity: number;
  totalCompute: string;
  planDate: string;
  status: SupplyStatus;
}

export type ProductShelfStatus = '已上架' | '已下架' | '审核中';

export interface EnterpriseProduct {
  id: string;
  name: string;
  cover: string;
  status: ProductShelfStatus;
  tags: string[];
  desc: string;
  price: string;
  type: string;
}

export const supplyBatches: SupplyBatch[] = [
  {
    id: '1',
    name: '2023Q3 GPU服务器采购清单',
    code: 'BATCH-20230701-GPU-001',
    dataCenter: '华东-上海数据中心',
    deviceType: 'GPU服务器',
    quantity: 15,
    totalCompute: '1,800',
    planDate: '2023-09-15',
    status: '已确认',
  },
  {
    id: '2',
    name: '通算节点扩容清单',
    code: 'BATCH-20230812-CPU-002',
    dataCenter: '华南-广州数据中心',
    deviceType: 'CPU服务器',
    quantity: 30,
    totalCompute: '2,400',
    planDate: '2023-10-01',
    status: '审核中',
  },
  {
    id: '3',
    name: '边缘推理设备接入清单',
    code: 'BATCH-20230905-EDGE-003',
    dataCenter: '西南-贵阳数据中心',
    deviceType: '边缘节点',
    quantity: 10,
    totalCompute: '640',
    planDate: '2023-10-20',
    status: '待审核',
  },
  {
    id: '4',
    name: '存储集群补充清单',
    code: 'BATCH-20230918-STO-004',
    dataCenter: '华东-上海数据中心',
    deviceType: '存储设备',
    quantity: 20,
    totalCompute: '—',
    planDate: '2023-11-05',
    status: '已取消',
  },
  {
    id: '5',
    name: '2024Q1 H100 集群清单',
    code: 'BATCH-20240108-GPU-005',
    dataCenter: '华南-广州数据中心',
    deviceType: 'GPU服务器',
    quantity: 8,
    totalCompute: '3,200',
    planDate: '2024-02-15',
    status: '已确认',
  },
  {
    id: '6',
    name: '渲染工作站进场清单',
    code: 'BATCH-20240220-GPU-006',
    dataCenter: '华北-北京数据中心',
    deviceType: 'GPU服务器',
    quantity: 12,
    totalCompute: '960',
    planDate: '2024-03-10',
    status: '审核中',
  },
];

export const enterpriseProducts: EnterpriseProduct[] = [
  {
    id: 'ep-1',
    name: '绿色低碳智算产品',
    cover: '🟢',
    status: '已上架',
    tags: ['智算服务', 'AI训练', '绿色计算'],
    desc: '基于A100 GPU的高性能智算产品，专为AI大模型训练设计，结合电碳协同管理，实现绿色低碳计算。',
    price: '¥2.50/小时/卡',
    type: '智算服务',
  },
  {
    id: 'ep-2',
    name: '高性能通算产品',
    cover: '🔵',
    status: '已上架',
    tags: ['通算服务', '科学计算', '数据分析'],
    desc: '基于Intel Xeon Platinum处理器的高性能计算产品，适用于大规模科学计算和数据分析任务。',
    price: '¥1.20/小时/节点',
    type: '通算服务',
  },
  {
    id: 'ep-3',
    name: '图形渲染工作站',
    cover: '🟣',
    status: '已下架',
    tags: ['智算服务', '渲染服务', '图形处理'],
    desc: '基于RTX 4090的高性能图形工作站，专为影视动画渲染和复杂图形处理任务设计。',
    price: '¥3.80/小时/台',
    type: '智算服务',
  },
  {
    id: 'ep-4',
    name: '分布式存储服务',
    cover: '🟠',
    status: '审核中',
    tags: ['通算服务', '数据存储', '分布式系统'],
    desc: '高性能分布式存储服务，提供高可用、高吞吐的数据存储解决方案，适用于大规模数据管理。',
    price: '¥0.80/小时/TB',
    type: '通算服务',
  },
  {
    id: 'ep-5',
    name: '边缘推理加速包',
    cover: '⚡',
    status: '已上架',
    tags: ['边缘算力', '推理服务'],
    desc: '面向边缘场景的轻量推理产品，支持低时延模型部署与弹性扩缩。',
    price: '¥0.95/小时/卡',
    type: '智算服务',
  },
  {
    id: 'ep-6',
    name: '绿色通算共享池',
    cover: '🌿',
    status: '审核中',
    tags: ['通算服务', '绿色计算'],
    desc: '以绿电配额调度的通算资源池，适合批处理与数据分析类负载。',
    price: '¥0.88/小时/节点',
    type: '通算服务',
  },
  {
    id: 'ep-7',
    name: '多卡训练专区',
    cover: '🧠',
    status: '已下架',
    tags: ['智算服务', 'AI训练'],
    desc: '多卡互联训练专区，预置主流框架镜像与监控组件。',
    price: '¥4.20/小时/卡',
    type: '智算服务',
  },
  {
    id: 'ep-8',
    name: '冷热分层存储',
    cover: '💾',
    status: '已上架',
    tags: ['数据存储', '分布式系统'],
    desc: '冷热分层存储产品，按访问频率自动迁移，降低长期持有成本。',
    price: '¥0.45/小时/TB',
    type: '通算服务',
  },
];
