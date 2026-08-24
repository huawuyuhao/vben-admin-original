/** 算力需求管理 mock 数据 */

export type DemandAuditTab = '全部需求' | '待审核' | '已审批';

export type DemandStatus =
  | '待确认'
  | '审核中'
  | '已通过'
  | '已驳回';

export type TaskRunStatus = '未完成' | '已完成' | '已取消';

export type SupplyStatus = '已审核' | '待查看' | '未受理';

export interface DemandAuditItem {
  id: string;
  dataType: string;
  fileCount: number;
  client: string;
  taskTime: string;
  status: DemandStatus;
  progressDone: number;
  progressTotal: number;
  appType: '推理类' | '训练类';
  modelType: string;
  modelName: string;
}

export interface DemandConvertItem {
  id: string;
  demandId: string;
  workOrderId: string;
  client: string;
  dataType: string;
  appType: string;
  gpuNeed: string;
  memNeed: string;
  extractAt: string;
  queueStatus: '待入队' | '已入队' | '排队中' | '已下发';
  auto: boolean;
}

export interface ComputeTaskItem {
  id: string;
  pod: string;
  container: string;
  node: string;
  computePct: number;
  memoryGi: number;
  devices: number;
  status: TaskRunStatus;
  progressDone: number;
  progressTotal: number;
}

export interface SupplyListItem {
  id: string;
  name: string;
  deviceType: string;
  spec: string;
  quantity: string;
  tflops: string;
  status: SupplyStatus;
}

export const demandAudits: DemandAuditItem[] = [
  {
    id: 'NW20260312001',
    dataType: '目标检测',
    fileCount: 1000,
    client: 'Anna',
    taskTime: '2024-10-12 18:22:34',
    status: '待确认',
    progressDone: 0,
    progressTotal: 1000,
    appType: '推理类',
    modelType: '视觉模型',
    modelName: 'YOLO-v8',
  },
  {
    id: 'NW20260312002',
    dataType: '图片分类',
    fileCount: 1000,
    client: 'AlerSha',
    taskTime: '2024-10-12 17:10:08',
    status: '待确认',
    progressDone: 0,
    progressTotal: 1000,
    appType: '训练类',
    modelType: '视觉模型',
    modelName: 'ResNet50',
  },
  {
    id: 'NW20260312003',
    dataType: '目标检测',
    fileCount: 1000,
    client: 'LPia',
    taskTime: '2024-10-11 09:45:21',
    status: '审核中',
    progressDone: 120,
    progressTotal: 1000,
    appType: '推理类',
    modelType: '多模态',
    modelName: 'CLIP-Base',
  },
  {
    id: 'NW20260312004',
    dataType: '文档解析',
    fileCount: 500,
    client: 'ChenWei',
    taskTime: '2024-10-10 14:02:11',
    status: '已通过',
    progressDone: 500,
    progressTotal: 500,
    appType: '推理类',
    modelType: 'NLP',
    modelName: 'DocParser-Lite',
  },
  {
    id: 'NW20260312005',
    dataType: '图像识别',
    fileCount: 800,
    client: 'WangLi',
    taskTime: '2024-10-09 11:30:00',
    status: '已通过',
    progressDone: 800,
    progressTotal: 800,
    appType: '训练类',
    modelType: '视觉模型',
    modelName: 'EfficientNet',
  },
  {
    id: 'NW20260312006',
    dataType: '目标检测',
    fileCount: 1200,
    client: 'ZhaoJun',
    taskTime: '2024-10-08 16:18:44',
    status: '已驳回',
    progressDone: 0,
    progressTotal: 1200,
    appType: '训练类',
    modelType: '视觉模型',
    modelName: 'YOLO-v5',
  },
  {
    id: 'NW20260312007',
    dataType: '图片分类',
    fileCount: 600,
    client: 'SunQi',
    taskTime: '2024-10-07 08:55:12',
    status: '待确认',
    progressDone: 0,
    progressTotal: 600,
    appType: '推理类',
    modelType: '视觉模型',
    modelName: 'MobileNet',
  },
  {
    id: 'NW20260312008',
    dataType: '文档解析',
    fileCount: 300,
    client: 'LiNa',
    taskTime: '2024-10-06 20:11:09',
    status: '已通过',
    progressDone: 300,
    progressTotal: 300,
    appType: '推理类',
    modelType: 'NLP',
    modelName: 'LayoutLM',
  },
];

export const demandConverts: DemandConvertItem[] = [
  {
    id: 'cv-1',
    demandId: 'NW20260312004',
    workOrderId: 'WO-20261012-001',
    client: 'ChenWei',
    dataType: '文档解析',
    appType: '推理类',
    gpuNeed: 'A100 × 2',
    memNeed: '80 Gi',
    extractAt: '2024-10-10 14:10:22',
    queueStatus: '已下发',
    auto: true,
  },
  {
    id: 'cv-2',
    demandId: 'NW20260312005',
    workOrderId: 'WO-20261012-002',
    client: 'WangLi',
    dataType: '图像识别',
    appType: '训练类',
    gpuNeed: 'A100 × 4',
    memNeed: '160 Gi',
    extractAt: '2024-10-09 11:42:05',
    queueStatus: '排队中',
    auto: true,
  },
  {
    id: 'cv-3',
    demandId: 'NW20260312008',
    workOrderId: 'WO-20261012-003',
    client: 'LiNa',
    dataType: '文档解析',
    appType: '推理类',
    gpuNeed: 'T4 × 1',
    memNeed: '16 Gi',
    extractAt: '2024-10-06 20:20:18',
    queueStatus: '已入队',
    auto: true,
  },
  {
    id: 'cv-4',
    demandId: 'NW20260312009',
    workOrderId: 'WO-20261012-004',
    client: 'ZhouMing',
    dataType: '目标检测',
    appType: '训练类',
    gpuNeed: 'A100 × 8',
    memNeed: '320 Gi',
    extractAt: '2024-10-12 09:05:33',
    queueStatus: '待入队',
    auto: false,
  },
  {
    id: 'cv-5',
    demandId: 'NW20260312010',
    workOrderId: 'WO-20261012-005',
    client: 'XuFang',
    dataType: '图片分类',
    appType: '推理类',
    gpuNeed: 'V100 × 2',
    memNeed: '64 Gi',
    extractAt: '2024-10-12 10:18:01',
    queueStatus: '已下发',
    auto: true,
  },
  {
    id: 'cv-6',
    demandId: 'NW20260312011',
    workOrderId: 'WO-20261012-006',
    client: 'HeTao',
    dataType: '图像识别',
    appType: '训练类',
    gpuNeed: 'RTX 4090 × 4',
    memNeed: '96 Gi',
    extractAt: '2024-10-12 11:00:40',
    queueStatus: '排队中',
    auto: true,
  },
];

export const computeTasks: ComputeTaskItem[] = [
  {
    id: 'tk-1',
    pod: 'pytorch-job-master-0',
    container: '长延迟智能1的容器',
    node: 'node1',
    computePct: 30,
    memoryGi: 10,
    devices: 1,
    status: '未完成',
    progressDone: 10,
    progressTotal: 1000,
  },
  {
    id: 'tk-2',
    pod: 'pytorch-job-master-1',
    container: '电力语音客服的容器',
    node: 'node2',
    computePct: 45,
    memoryGi: 16,
    devices: 2,
    status: '已完成',
    progressDone: 1000,
    progressTotal: 1000,
  },
  {
    id: 'tk-3',
    pod: 'pytorch-job-worker-0',
    container: '目标识别训练容器',
    node: 'node1',
    computePct: 60,
    memoryGi: 24,
    devices: 2,
    status: '未完成',
    progressDone: 100,
    progressTotal: 1000,
  },
  {
    id: 'tk-4',
    pod: 'tf-job-chief-0',
    container: '文档解析推理容器',
    node: 'node3',
    computePct: 20,
    memoryGi: 8,
    devices: 1,
    status: '已取消',
    progressDone: 0,
    progressTotal: 500,
  },
  {
    id: 'tk-5',
    pod: 'pytorch-job-worker-1',
    container: '长延迟智算产品2容器',
    node: 'node2',
    computePct: 55,
    memoryGi: 20,
    devices: 2,
    status: '已完成',
    progressDone: 1000,
    progressTotal: 1000,
  },
  {
    id: 'tk-6',
    pod: 'infer-svc-pod-08',
    container: '图像分类在线推理',
    node: 'node4',
    computePct: 25,
    memoryGi: 12,
    devices: 1,
    status: '未完成',
    progressDone: 320,
    progressTotal: 1000,
  },
];

export const supplyLists: SupplyListItem[] = [
  {
    id: 'sp-1',
    name: 'GPU服务器A组',
    deviceType: 'GPU服务器',
    spec: 'NVIDIA A100 80GB × 8',
    quantity: '10台',
    tflops: '1,920',
    status: '已审核',
  },
  {
    id: 'sp-2',
    name: 'CPU服务器B组',
    deviceType: 'CPU服务器',
    spec: 'Intel Xeon Platinum 8380 × 2',
    quantity: '20台',
    tflops: '480',
    status: '待查看',
  },
  {
    id: 'sp-3',
    name: 'GPU工作站C组',
    deviceType: 'GPU工作站',
    spec: 'NVIDIA RTX 4090 × 4',
    quantity: '8台',
    tflops: '900',
    status: '未受理',
  },
  {
    id: 'sp-4',
    name: '存储服务器D组',
    deviceType: '存储服务器',
    spec: '100TB NVMe SSD',
    quantity: '6台',
    tflops: '—',
    status: '已审核',
  },
  {
    id: 'sp-5',
    name: 'GPU服务器E组',
    deviceType: 'GPU服务器',
    spec: 'NVIDIA H100 80GB × 8',
    quantity: '4台',
    tflops: '2,400',
    status: '待查看',
  },
  {
    id: 'sp-6',
    name: '边缘推理节点F组',
    deviceType: 'GPU工作站',
    spec: 'NVIDIA T4 × 2',
    quantity: '15台',
    tflops: '130',
    status: '未受理',
  },
];
