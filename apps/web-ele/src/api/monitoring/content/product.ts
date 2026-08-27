import type {
  AdminProductListParams,
  ProductListResponseBody,
  ProductListResult,
  ProductInfo,
} from '#/types/monitoring/content/product';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isAdminProductApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseAdminProductListBody(
  body?: null | ProductListResponseBody,
): ProductListResult {
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
 * 算力产品管理列表分页查询
 * 开发态走 Apifox Mock：GET /mock/admin/content/product/list
 * 正式接口：GET /admin/content/product/list
 * @param params 分页与筛选参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getAdminProductListApi(params: AdminProductListParams) {
  const body = await rootRequestClient.get<ProductListResponseBody<ProductInfo>>(
    '/mock/admin/content/product/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<ProductListResponseBody<ProductInfo>>(
  //   '/admin/content/product/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isAdminProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseAdminProductListBody(body);
}
