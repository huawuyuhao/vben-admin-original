/**
 * 下单页 · 规格筛选项
 * GET /product/spec/filter-options
 */
export interface SpecFilterOptions {
  /** 架构可选值 */
  architectureOptions?: string[];
  /** 类型可选值 */
  specTypeOptions?: string[];
  /** 实例族可选值 */
  instanceFamilyOptions?: string[];
  /** GPU 型号可选值 */
  gpuModelOptions?: string[];
}

/**
 * 规格列表查询参数
 * GET /product/spec/list
 */
export interface SpecListParams {
  page: number;
  pageSize: number;
  architecture?: string;
  specType?: string;
  instanceFamily?: string;
  gpuModel?: string;
  keyword?: string;
}

/**
 * 算力产品规格（product_spec）
 */
export interface ProductSpecItem {
  specId: number;
  productId?: number;
  specCode?: string;
  architecture?: string;
  specType?: string;
  instanceFamily?: string;
  vcpu?: number;
  memoryGb?: number;
  gpuCount?: number;
  gpuModel?: string;
  cpuFreq?: string;
  cpuModel?: string;
  intranetBandwidth?: string;
  networkPps?: string;
  region?: string;
  zone?: string;
  pricePerHour?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 规格分页结果（扁平分页）
 */
export interface SpecListResult {
  records: ProductSpecItem[];
  total: number;
  current: number;
  size: number;
}

/** 规格列表原始响应体 */
export interface SpecListResponseBody extends Partial<SpecListResult> {
  code?: number;
  msg?: string;
  data?: ProductSpecItem[] | SpecListResult;
}

/**
 * 镜像信息（product_image）
 * GET /product/image/list
 */
export interface ProductImageItem {
  imageId: number;
  imageName?: string;
  /** 1-公共镜像 2-私有镜像 3-云镜像 */
  imageType?: number;
  osType?: string;
  version?: string;
  sourceMarket?: number;
  imageSize?: number;
  description?: string;
  status?: number;
}

/**
 * 模型市场列表参数
 * GET /model/market/list
 */
export interface ModelMarketListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  modelCategory?: string;
  sceneTag?: string;
}

/**
 * 模型市场条目（model_info）
 */
export interface ModelMarketItem {
  modelId: number;
  modelName?: string;
  iconUrl?: string;
  description?: string;
  score?: number;
  callCount?: number;
  collectCount?: number;
  modelCategory?: string;
  sceneTag?: string;
  paramsJson?: string;
  status?: number;
}

/**
 * 模型市场分页结果
 */
export interface ModelMarketListResult {
  records: ModelMarketItem[];
  total: number;
  current: number;
  size: number;
}

/** 模型市场列表原始响应体 */
export interface ModelMarketListResponseBody
  extends Partial<ModelMarketListResult> {
  code?: number;
  msg?: string;
  data?: ModelMarketItem[] | ModelMarketListResult;
}

/**
 * 磁盘配置请求体
 */
export interface DemandDiskPayload {
  /** 1-系统盘 2-数据盘 */
  diskUsage: number;
  diskType: string;
  capacityGb: number;
  quantity: number;
}

/**
 * 关联应用请求体
 */
export interface DemandApplicationPayload {
  applicationId: number;
  /** 1-我的应用 2-模型市场 */
  appSource?: number;
}

/**
 * 费用试算入参
 * POST /demand/config/fee
 */
export interface DemandFeeParams {
  specId: number;
  quantity?: number;
  networkBandwidth?: number;
  disks?: DemandDiskPayload[];
}

/**
 * 费用试算结果
 */
export interface DemandFeeResult {
  specCode?: string;
  quantity?: number;
  configFee?: number;
  networkFee?: number;
  totalFee?: number;
}

/**
 * 需求配置保存 / 提交入参
 * POST /demand/config/draft | /demand/config/submit
 */
export interface DemandConfigPayload {
  demandId?: number;
  demandName?: string;
  productId?: number;
  specId: number;
  quantity?: number;
  imageId?: number;
  instanceName?: string;
  loginPassword?: string;
  networkBandwidth?: number;
  region?: string;
  disks?: DemandDiskPayload[];
  applications?: DemandApplicationPayload[];
}

/**
 * 保存 / 提交返回
 */
export interface DemandConfigSaveResult {
  demandId?: number;
}

/**
 * 需求主记录（回显）
 */
export interface DemandRecordBrief {
  demandId?: number;
  demandNo?: string;
  demandName?: string;
  productId?: number;
  specId?: number;
  status?: number;
}

/**
 * 需求主配置（回显）
 */
export interface DemandConfigBrief {
  configId?: number;
  demandId?: number;
  specId?: number;
  quantity?: number;
  imageId?: number;
  instanceName?: string;
  loginPassword?: string;
  networkBandwidth?: number;
  configFee?: number;
  networkFee?: number;
  totalFee?: number;
  region?: string;
  configStatus?: number;
}

/**
 * 磁盘回显项
 */
export interface DemandDiskItem extends DemandDiskPayload {
  diskId?: number;
  demandId?: number;
  iops?: number;
  bandwidthMib?: number;
  performanceDesc?: string;
  sortNo?: number;
}

/**
 * 关联应用回显项
 */
export interface DemandApplicationItem {
  id?: number;
  demandId?: number;
  applicationId: number;
  appSource?: number;
}

/**
 * 需求配置回显
 * GET /demand/config/{demandId}
 */
export interface DemandConfigDetail {
  demand?: DemandRecordBrief;
  config?: DemandConfigBrief;
  disks?: DemandDiskItem[];
  applications?: DemandApplicationItem[];
}
