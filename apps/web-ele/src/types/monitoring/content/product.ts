import type {
  ProductInfo,
  ProductListResponseBody,
  ProductListResult,
} from '#/types/service/product';

export type { ProductInfo, ProductListResponseBody, ProductListResult };

/** 上下架状态：0 下架 / 1 上架 */
export type AdminProductShelfStatus = 0 | 1;

/** 审核状态：0 待审核 / 1 通过 / 2 不通过 */
export type AdminProductAuditStatus = 0 | 1 | 2;

/**
 * 算力产品管理列表查询参数
 * GET /admin/content/product/list
 */
export interface AdminProductListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 产品名称（可选，模糊搜索） */
  productName?: string;
  /** 上下架状态（可选）：0 下架 / 1 上架 */
  shelfStatus?: AdminProductShelfStatus | number;
}

/** 评价主键（兼容数字与雪花字符串） */
export type AdminProductEvalId = number | string;

/** 评价状态：0 待审核 / 1 已通过 / 2 已屏蔽 */
export type AdminProductEvalStatus = 0 | 1 | 2;

/**
 * 算力产品评价条目
 * GET /admin/content/product/eval/list
 */
export interface AdminProductEvalItem {
  /** 评价 ID */
  evalId: AdminProductEvalId;
  /** 产品 ID */
  productId?: AdminProductEvalId;
  /** 用户 ID */
  userId?: AdminProductEvalId;
  /** 评分（1-5） */
  score?: number;
  /** 评价内容 */
  content?: string;
  /** 状态（0-待审核 1-已通过 2-已屏蔽） */
  status?: AdminProductEvalStatus | number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建者 */
  createBy?: number | string;
  /** 更新者 */
  updateBy?: number | string;
  /** 创建部门 */
  createDept?: number | string;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 算力产品评价列表查询参数
 * GET /admin/content/product/eval/list
 */
export interface AdminProductEvalListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 产品 ID（可选） */
  productId?: AdminProductEvalId;
  /** 状态过滤（可选）：0 待审核 / 1 已通过 / 2 已屏蔽 */
  status?: AdminProductEvalStatus | number;
}

/**
 * 算力产品评价分页结果
 */
export interface AdminProductEvalListResult {
  /** 当前页列表 */
  records: AdminProductEvalItem[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 算力产品评价列表响应体（扁平分页 + code/msg；兼容 data 包裹）
 */
export interface AdminProductEvalListResponseBody
  extends Partial<AdminProductEvalListResult> {
  code?: number;
  msg?: string;
  data?: AdminProductEvalItem[] | AdminProductEvalListResult;
}

/**
 * 评价写操作通用响应体
 */
export interface AdminProductEvalMutationResponse {
  code?: number;
  msg?: string;
  data?: string;
}

/** 产品主键（兼容数字与雪花字符串） */
export type AdminProductId = number | string;

/**
 * 新增 / 修改算力产品请求体
 * POST /admin/content/product · PUT /admin/content/product/{id}
 */
export interface AdminProductWriteParams {
  /** 产品名称 */
  productName: string;
  /** 产品简介 */
  description?: string;
  /** 产品图片 */
  imageUrl?: string;
  /** 绿电占比(%) */
  greenPowerRatio?: number;
  /** 价格 */
  price?: number;
  /** 推荐度 */
  recommendLevel?: number;
  /** 标签（多个用逗号分隔） */
  tags?: string;
  /** 供给企业 ID */
  enterpriseId?: AdminProductId;
}

/**
 * 新增算力产品响应 data
 */
export interface AdminProductCreateResult {
  /** 新建产品 ID（接口字段 key） */
  key: AdminProductId;
}

/**
 * 产品写操作通用响应体
 */
export interface AdminProductMutationResponse {
  code?: number;
  msg?: string;
  data?: AdminProductCreateResult | string;
}

/** 算力产品上下架操作类型：shelf 上架 / unshelf 下架 */
export type AdminProductShelfAction = 'shelf' | 'unshelf';

/**
 * 算力产品上下架请求体
 * PUT /admin/content/product/{id}/shelf
 */
export interface AdminProductShelfParams {
  /** 操作类型：shelf 上架 / unshelf 下架 */
  action: AdminProductShelfAction;
}
