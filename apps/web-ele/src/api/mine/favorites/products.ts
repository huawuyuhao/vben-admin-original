import type {
  FavoriteItem,
  FavoritesListParams,
  FavoritesListResponseBody,
  FavoritesListResult,
} from '#/types/mine/favorites/products';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isFavoritesApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseFavoritesListBody<T = FavoriteItem>(
  body?: null | FavoritesListResponseBody<T>,
): FavoritesListResult<T> {
  if (!body) {
    return { records: [], total: 0, current: 1, size: 10 };
  }

  if (Array.isArray(body.records)) {
    return {
      records: body.records,
      total: Number(body.total) || 0,
      current: Number(body.current) || 1,
      size: Number(body.size) || 10,
    };
  }

  const nested = body.data;
  if (nested && !Array.isArray(nested) && Array.isArray(nested.records)) {
    return {
      records: nested.records,
      total: Number(nested.total) || 0,
      current: Number(nested.current) || 1,
      size: Number(nested.size) || 10,
    };
  }

  if (Array.isArray(nested)) {
    return {
      records: nested,
      total: nested.length,
      current: 1,
      size: nested.length || 10,
    };
  }

  return { records: [], total: 0, current: 1, size: 10 };
}

/**
 * 我的产品（收藏）列表分页查询
 * 开发态：GET /mock/product/collect/list
 * 正式：GET /product/collect/list
 * @param params page / pageSize
 * @returns 分页结果（records 含 collectId / collectTime 等）
 */
export async function getFavoritesListApi(params: FavoritesListParams) {
  const body = await rootRequestClient.get<FavoritesListResponseBody>(
    '/mock/product/collect/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<FavoritesListResponseBody>(
  //   '/product/collect/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isFavoritesApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseFavoritesListBody(body);
}
