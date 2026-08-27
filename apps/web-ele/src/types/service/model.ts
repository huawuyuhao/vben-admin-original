/**
 * 模型信息（model_info）
 * GET /model/list、GET /model/{id}、POST /model/compare
 */
export interface ModelInfo {
  /** 模型 ID */
  modelId: number;
  /** 模型名称 */
  modelName: string;
  /** 模型图标 */
  iconUrl?: string;
  /** 模型简介 */
  description?: string;
  /** 评分 */
  score?: number;
  /** 调用量 */
  callCount?: number;
  /** 模型参数（JSON 字符串） */
  paramsJson?: string;
  /** 状态（0-停用 1-启用） */
  status?: number;
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: number;
  /** 更新时间 */
  updateTime?: string;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 模型评价视图对象
 * GET /model/evaluation/list
 */
export interface ModelEvaluation {
  /** 评价 ID */
  evalId?: number;
  /** 用户昵称 */
  userName?: string;
  /** 评分 */
  score?: number;
  /** 评价内容 */
  content?: string;
  /** 创建时间 */
  createTime?: string;
}

/**
 * 模型列表分页查询参数
 * GET /model/list
 */
export interface ModelListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 搜索关键词（可选，按模型名称模糊匹配） */
  keyword?: string;
}

/**
 * 模型评价列表分页查询参数
 * GET /model/evaluation/list
 */
export interface ModelEvaluationListParams {
  /** 模型 ID */
  modelId: number;
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
}

/**
 * 提交模型评价参数
 * POST /model/evaluation
 */
export interface ModelEvaluationSubmitParams {
  /** 模型 ID */
  modelId: number;
  /** 评分（1-5） */
  score: number;
  /** 评价内容 */
  content: string;
}

/**
 * 模型列表 / 评价列表分页结果
 * 文档返参为扁平结构：与 code/msg 同级的 records / total / current / size
 */
export interface ModelListResult<T = ModelInfo> {
  /** 当前页列表 */
  records: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 模型列表原始响应体（扁平分页 + 可选 code/msg；兼容旧版 data 包裹）
 */
export interface ModelListResponseBody<T = ModelInfo>
  extends Partial<ModelListResult<T>> {
  code?: number;
  msg?: string;
  /** 兼容旧版：分页包在 data 内，或 data 直接为数组 */
  data?: T[] | ModelListResult<T>;
}

/**
 * 模型对比接口响应体
 * POST /model/compare
 */
export interface ModelCompareResponseBody {
  code?: number;
  msg?: string;
  data?: ModelInfo[];
}
