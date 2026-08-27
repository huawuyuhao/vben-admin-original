import type {
  ProductInfo,
  ProductListResponseBody,
  ProductListResult,
} from '#/types/service/product';

export type { ProductInfo, ProductListResult, ProductListResponseBody };

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
