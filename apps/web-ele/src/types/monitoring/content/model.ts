import type { ApiId } from '#/utils/api-id';

/** 模型服务主键（兼容数字与雪花字符串） */
export type AdminModelServiceId = ApiId;

/** 模型评价主键（兼容数字与雪花字符串） */
export type AdminModelEvalId = ApiId;

/** 模型启停状态：0 停用 / 1 启用 */
export type AdminModelServiceStatus = 0 | 1;

/** 评价审核状态：0 待审核 / 1 已通过 / 2 已驳回 */
export type AdminModelEvalAuditStatus = 0 | 1 | 2;

/**
 * 模型服务列表查询参数
 * GET /admin/model-service/list
 */
export interface AdminModelServiceListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 关键词（可选，按模型名称模糊匹配） */
  keyword?: string;
  /** 模型类别（可选，训练类/推理类） */
  modelCategory?: string;
  /** 状态过滤（可选，0-停用 1-启用） */
  status?: AdminModelServiceStatus | number;
}

/**
 * 模型服务条目
 */
export interface AdminModelServiceItem {
  createDept?: number | string;
  createBy?: number | string;
  createTime?: string;
  updateBy?: number | string;
  updateTime?: string;
  tenantId?: string;
  /** 模型 ID */
  modelId?: AdminModelServiceId;
  /** 模型名称 */
  modelName?: string;
  /** 模型图标 */
  iconUrl?: string;
  /** 模型简介 */
  description?: string;
  /** 评分 */
  score?: number;
  /** 调用量 */
  callCount?: number;
  /** 收藏数 */
  collectCount?: number;
  /** 模型类别（训练类/推理类） */
  modelCategory?: string;
  /** 场景标签 */
  sceneTag?: string;
  /** 模型参数（JSON 字符串） */
  paramsJson?: string;
  /** 状态（0-停用 1-启用） */
  status?: AdminModelServiceStatus | number;
}

/**
 * 模型服务分页结果
 */
export interface AdminModelServiceListResult {
  records: AdminModelServiceItem[];
  total: number;
  current: number;
  size: number;
}

/**
 * 模型服务列表响应体（扁平分页 + code/msg；兼容 data 包裹）
 */
export interface AdminModelServiceListResponseBody
  extends Partial<AdminModelServiceListResult> {
  code?: number;
  msg?: string;
  data?: AdminModelServiceItem[] | AdminModelServiceListResult;
}

/**
 * 模型服务写请求体
 * POST /admin/model-service · PUT /admin/model-service/{id}
 */
export interface AdminModelServiceWriteParams {
  modelName?: string;
  iconUrl?: string;
  description?: string;
  score?: number;
  callCount?: number;
  collectCount?: number;
  modelCategory?: string;
  sceneTag?: string;
  paramsJson?: string;
  status?: AdminModelServiceStatus | number;
}

/**
 * 模型服务写操作响应
 */
export interface AdminModelServiceMutationResponse {
  code?: number;
  msg?: string;
  data?:
    | string
    | {
        modelId?: AdminModelServiceId;
        key?: AdminModelServiceId;
        [k: string]: unknown;
      };
}

/**
 * 模型详情响应
 */
export interface AdminModelServiceDetailResponse {
  code?: number;
  msg?: string;
  data?: AdminModelServiceItem;
}

/**
 * 评价列表查询参数
 * GET /admin/model-service/evaluation/list
 */
export interface AdminModelEvalListParams {
  page: number;
  pageSize: number;
  /** 模型 ID（可选，兼容字符串） */
  modelId?: AdminModelServiceId;
  /** 审核状态（可选） */
  auditStatus?: AdminModelEvalAuditStatus | number;
}

/**
 * 模型评价条目
 */
export interface AdminModelEvalItem {
  evalId?: AdminModelEvalId;
  modelId?: AdminModelServiceId;
  userName?: string;
  score?: number;
  content?: string;
  auditStatus?: AdminModelEvalAuditStatus | number;
  createTime?: string;
}

/**
 * 评价分页结果
 */
export interface AdminModelEvalListResult {
  records: AdminModelEvalItem[];
  total: number;
  current: number;
  size: number;
}

/**
 * 评价列表响应体
 */
export interface AdminModelEvalListResponseBody
  extends Partial<AdminModelEvalListResult> {
  code?: number;
  msg?: string;
  data?: AdminModelEvalItem[] | AdminModelEvalListResult;
}

/**
 * 评价审核请求体
 */
export interface AdminModelEvalAuditParams {
  /** 审核状态（0-待审核 1-已通过 2-已驳回） */
  auditStatus: AdminModelEvalAuditStatus | number;
}

/**
 * 评价写操作响应
 */
export interface AdminModelEvalMutationResponse {
  code?: number;
  msg?: string;
  data?: string;
}
