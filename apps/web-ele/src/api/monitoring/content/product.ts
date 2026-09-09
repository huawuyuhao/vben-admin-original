import type {
  AdminProductAuditParams,
  AdminProductEvalId,
  AdminProductEvalListParams,
  AdminProductEvalListResponseBody,
  AdminProductEvalListResult,
  AdminProductEvalMutationResponse,
  AdminProductId,
  AdminProductListParams,
  AdminProductMutationResponse,
  AdminProductShelfParams,
  AdminProductWriteParams,
  ProductInfo,
  ProductListResponseBody,
  ProductListResult,
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
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertAdminProductMutationSuccess(
  body?: AdminProductEvalMutationResponse | AdminProductMutationResponse | null,
) {
  if (!isAdminProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }
}

/**
 * 从产品列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
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
 * 从评价列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseAdminProductEvalListBody(
  body?: AdminProductEvalListResponseBody | null,
): AdminProductEvalListResult {
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
    '/pwq-mock/admin/content/product/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<ProductListResponseBody<ProductInfo>>(
  //   '/mock/admin/content/product/list',
  //   {
  //     params,
  //     responseReturn: 'body',
  //   },
  // );
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

/**
 * 算力产品评价列表分页查询
 * 正式：GET /admin/content/product/eval/list
 * @param params 分页与筛选参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getAdminProductEvalListApi(
  params: AdminProductEvalListParams,
) {
  const body = await rootRequestClient.get<AdminProductEvalListResponseBody>(
    '/pwq-mock/admin/content/product/eval/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<AdminProductEvalListResponseBody>(
  //   '/mock/admin/content/product/eval/list',
  //   {
  //     params,
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.get<AdminProductEvalListResponseBody>(
  //   '/admin/content/product/eval/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isAdminProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseAdminProductEvalListBody(body);
}

/**
 * 屏蔽算力产品评价
 * 正式：PUT /admin/content/product/eval/{id}/block
 * @param id 评价 ID
 */
export async function blockAdminProductEvalApi(id: AdminProductEvalId) {
  const body = await rootRequestClient.put<AdminProductEvalMutationResponse>(
    `/pwq-mock/admin/content/product/eval/${id}/block`,
    {},
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<AdminProductEvalMutationResponse>(
  //   `/mock/admin/content/product/eval/${id}/block`,
  //   {},
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.put<AdminProductEvalMutationResponse>(
  //   `/admin/content/product/eval/${id}/block`,
  //   {},
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}

/**
 * 删除算力产品评价
 * 正式：DELETE /admin/content/product/eval/{id}
 * @param id 评价 ID
 */
export async function deleteAdminProductEvalApi(id: AdminProductEvalId) {
  const body = await rootRequestClient.delete<AdminProductEvalMutationResponse>(
    `/pwq-mock/admin/content/product/eval/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<AdminProductEvalMutationResponse>(
  //   `/mock/admin/content/product/eval/${id}`,
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.delete<AdminProductEvalMutationResponse>(
  //   `/admin/content/product/eval/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}

/**
 * 新增算力产品
 * 正式：POST /admin/content/product
 * @param data 产品信息请求体
 * @returns 含 key（productId）
 */
export async function createAdminProductApi(data: AdminProductWriteParams) {
  const body = await rootRequestClient.post<AdminProductMutationResponse>(
    '/pwq-mock/admin/content/product',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<AdminProductMutationResponse>(
  //   '/mock/admin/content/product',
  //   data,
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.post<AdminProductMutationResponse>(
  //   '/admin/content/product',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
  return body?.data as undefined | { key: AdminProductId };
}

/**
 * 修改算力产品
 * 正式：PUT /admin/content/product/{id}
 * @param id 产品 ID
 * @param data 产品信息请求体
 */
export async function updateAdminProductApi(
  id: AdminProductId,
  data: AdminProductWriteParams,
) {
  const body = await rootRequestClient.put<AdminProductMutationResponse>(
    `/pwq-mock/admin/content/product/${id}`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/mock/admin/content/product/${id}`,
  //   data,
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/admin/content/product/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}

/**
 * 删除算力产品
 * 正式：DELETE /admin/content/product/{id}
 * @param id 产品 ID
 */
export async function deleteAdminProductApi(id: AdminProductId) {
  const body = await rootRequestClient.delete<AdminProductMutationResponse>(
    `/pwq-mock/admin/content/product/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<AdminProductMutationResponse>(
  //   `/mock/admin/content/product/${id}`,
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.delete<AdminProductMutationResponse>(
  //   `/admin/content/product/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}

/**
 * 算力产品上下架
 * 正式：PUT /admin/content/product/{id}/shelf
 * @param id 产品 ID
 * @param data 上下架参数（JSON body：action = shelf | unshelf）
 */
export async function updateAdminProductShelfApi(
  id: AdminProductId,
  data: AdminProductShelfParams,
) {
  const body = await rootRequestClient.put<AdminProductMutationResponse>(
    `/pwq-mock/admin/content/product/${id}/shelf`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/mock/admin/content/product/${id}/shelf`,
  //   data,
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/admin/content/product/${id}/shelf`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}

/**
 * 审核算力产品（含提交审核）
 * 正式：PUT /admin/content/product/{id}/audit
 * @param id 产品 ID
 * @param data 审核参数（auditStatus 默认 1；auditRemark 为审核意见）
 */
export async function auditAdminProductApi(
  id: AdminProductId,
  { auditStatus = 1, auditRemark }: AdminProductAuditParams = {},
) {
  const body = await rootRequestClient.put<AdminProductMutationResponse>(
    `/pwq-mock/admin/content/product/${id}/audit`,
    {
      auditStatus,
      auditRemark,
    },
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/mock/admin/content/product/${id}/audit`,
  //   {
  //     auditStatus,
  //     auditRemark,
  //   },
  //   {
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.put<AdminProductMutationResponse>(
  //   `/admin/content/product/${id}/audit`,
  //   {
  //     auditStatus,
  //     auditRemark,
  //   },
  //   { responseReturn: 'body' },
  // );

  assertAdminProductMutationSuccess(body);
}
