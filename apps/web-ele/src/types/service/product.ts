/**
 * 算力产品信息（product_info）
 * GET /product/list、GET /product/{id}
 */
export interface ProductInfo {
  /** 产品 ID */
  productId: number;
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
  /**
   * 当前登录用户是否已收藏（不入库，仅接口返参）
   * 列表 / 详情接口返回
   */
  isCollected?: boolean;
  /** 供给企业 ID */
  enterpriseId?: number;
  /** 上下架状态（0-下架 1-上架） */
  shelfStatus?: number;
  /** 发布时间 */
  publishTime?: string;
  /** 审核状态（0-待审核 1-审核通过 2-审核不通过） */
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

/** 产品列表排序字段（与 OpenAPI enum 对齐） */
export type ProductSortField = 'greenPowerRatio' | 'price';

/**
 * 产品列表分页查询参数
 * GET /product/list
 */
export interface ProductListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 搜索关键词（可选） */
  keyword?: string;
  /** 排序字段（可选）：price / greenPowerRatio */
  sortField?: ProductSortField | string;
  /** 排序方式（asc/desc） */
  sortOrder?: 'asc' | 'desc' | string;
}

/**
 * 产品列表分页结果
 * 文档返参为扁平结构：与 code/msg 同级的 records / total / current / size
 */
export interface ProductListResult<T extends ProductInfo = ProductInfo> {
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
 * 产品列表原始响应体（扁平分页 + 可选 code/msg；兼容旧版 data 包裹）
 */
export interface ProductListResponseBody<T extends ProductInfo = ProductInfo>
  extends Partial<ProductListResult<T>> {
  code?: number;
  msg?: string;
  /** 兼容旧版：分页包在 data 内，或 data 直接为数组 */
  data?: T[] | ProductListResult<T>;
}
