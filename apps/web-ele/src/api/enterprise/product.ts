import type {
  SupplyProductListParams,
  SupplyProductListResponseBody,
  SupplyProductListResult,
  SupplyProductMutationResponse,
  SupplyProductResourceStatusResult,
  SupplyProductShelfAction,
  SupplyProductWriteParams,
} from '#/types/enterprise/product';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isProductApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertProductMutationSuccess(
  body?: null | SupplyProductMutationResponse,
) {
  if (!isProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseProductListBody<T>(
  body?: null | SupplyProductListResponseBody<T>,
): SupplyProductListResult<T> {
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
 * 算力产品列表分页查询
 * 开发态走 Apifox Mock：GET /mock/supply/product/list
 * 正式接口：GET /supply/product/list
 * @param params 分页与筛选条件
 * @returns 分页结果（records / total / current / size）
 */
export async function getSupplyProductListApi(params: SupplyProductListParams) {
  const body = await rootRequestClient.get<SupplyProductListResponseBody>(
    '/mock/supply/product/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<SupplyProductListResponseBody>(
  //   '/supply/product/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseProductListBody(body);
}

/**
 * 新增算力产品
 * 开发态：POST /mock/supply/product
 * 正式：POST /supply/product
 * 入参走 JSON body（非 query）
 * @param data 产品信息
 * @returns 含 key（supplyProductId）
 */
export async function createSupplyProductApi(data: SupplyProductWriteParams) {
  const body = await rootRequestClient.post<SupplyProductMutationResponse>(
    '/mock/supply/product',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SupplyProductMutationResponse>(
  //   '/supply/product',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertProductMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as { key?: number };
  }
  return undefined;
}

/**
 * 编辑算力产品
 * 开发态：PUT /mock/supply/product/{id}
 * 正式：PUT /supply/product/{id}
 * 入参走 JSON body（非 query）；id 在 path
 * @param id 供给产品 ID
 * @param data 修改参数
 */
export async function updateSupplyProductApi(
  id: number,
  data: SupplyProductWriteParams,
) {
  const body = await rootRequestClient.put<SupplyProductMutationResponse>(
    `/mock/supply/product/${id}`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<SupplyProductMutationResponse>(
  //   `/supply/product/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertProductMutationSuccess(body);
}

/**
 * 删除算力产品
 * 开发态：DELETE /mock/supply/product/{id}
 * 正式：DELETE /supply/product/{id}
 * @param id 供给产品 ID
 */
export async function deleteSupplyProductApi(id: number) {
  const body = await rootRequestClient.delete<SupplyProductMutationResponse>(
    `/mock/supply/product/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<SupplyProductMutationResponse>(
  //   `/supply/product/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertProductMutationSuccess(body);
}

/**
 * 产品上下架
 * 开发态：PUT /mock/supply/product/{id}/shelf
 * 正式：PUT /supply/product/{id}/shelf
 * action 走 query：shelf 上架 / unshelf 下架
 * @param id 供给产品 ID
 * @param action 操作类型
 */
export async function shelfSupplyProductApi(
  id: number,
  action: SupplyProductShelfAction,
) {
  const body = await rootRequestClient.put<SupplyProductMutationResponse>(
    `/mock/supply/product/${id}/shelf`,
    {},
    {
      params: { action },
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<SupplyProductMutationResponse>(
  //   `/supply/product/${id}/shelf`,
  //   {},
  //   { params: { action }, responseReturn: 'body' },
  // );

  assertProductMutationSuccess(body);
}

/**
 * 资源状态监测
 * 开发态：GET /mock/supply/product/{id}/resource-status
 * 正式：GET /supply/product/{id}/resource-status
 * @param id 供给产品 ID
 * @returns 含 resourceStatus
 */
export async function getSupplyProductResourceStatusApi(id: number) {
  const body = await rootRequestClient.get<SupplyProductMutationResponse>(
    `/mock/supply/product/${id}/resource-status`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<SupplyProductMutationResponse>(
  //   `/supply/product/${id}/resource-status`,
  //   { responseReturn: 'body' },
  // );

  assertProductMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as SupplyProductResourceStatusResult;
  }
  return undefined;
}
