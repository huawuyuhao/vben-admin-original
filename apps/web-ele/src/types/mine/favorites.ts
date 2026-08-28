import type { ProductInfo } from '#/types/service/product';

/**
 * 我的收藏列表条目（产品信息 + 收藏表字段）
 * GET /product/collect/list · records[]
 */
export interface FavoriteItem extends ProductInfo {
  /** 收藏 ID */
  collectId?: number;
  /** 用户 ID */
  userId?: number;
  /** 收藏时间 */
  collectTime?: string;
}

/**
 * 我的收藏列表查询参数
 * GET /product/collect/list
 */
export interface FavoritesListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
}

/**
 * 我的收藏分页结果
 */
export interface FavoritesListResult<T = FavoriteItem> {
  /** 当前页列表 */
  records: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 我的收藏列表响应体（扁平分页 + code/msg，兼容 data 包裹）
 */
export interface FavoritesListResponseBody<T = FavoriteItem> {
  code?: number;
  msg?: string;
  total?: number;
  records?: T[];
  current?: number;
  size?: number;
  data?:
    | T[]
    | {
        records?: T[];
        total?: number;
        current?: number;
        size?: number;
      };
}
