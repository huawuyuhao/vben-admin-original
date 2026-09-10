import type {
  AdminModelEvalAuditParams,
  AdminModelEvalId,
  AdminModelEvalListParams,
  AdminModelEvalListResponseBody,
  AdminModelEvalListResult,
  AdminModelEvalMutationResponse,
  AdminModelServiceDetailResponse,
  AdminModelServiceId,
  AdminModelServiceItem,
  AdminModelServiceListParams,
  AdminModelServiceListResponseBody,
  AdminModelServiceListResult,
  AdminModelServiceMutationResponse,
  AdminModelServiceWriteParams,
} from '#/types/monitoring/content/model';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';
import { hasApiId, toApiPathId } from '#/utils/api-id';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isAdminModelApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertAdminModelMutationSuccess(
  body?:
    | AdminModelEvalMutationResponse
    | AdminModelServiceMutationResponse
    | null,
) {
  if (!isAdminModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }
}

/**
 * 解析分页列表响应（兼容扁平与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页
 */
function parseAdminModelListBody(
  body?: AdminModelServiceListResponseBody | null,
): AdminModelServiceListResult {
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
 * 解析评价分页响应
 * @param body 响应体
 * @returns 标准化分页
 */
function parseAdminModelEvalListBody(
  body?: AdminModelEvalListResponseBody | null,
): AdminModelEvalListResult {
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
 * 模型服务管理列表
 * GET /admin/model-service/list
 * @param params 分页与筛选
 */
export async function getAdminModelServiceListApi(
  params: AdminModelServiceListParams,
) {
  const body = await rootRequestClient.get<AdminModelServiceListResponseBody>(
    '/pwq-mock/admin/model-service/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<AdminModelServiceListResponseBody>(
  //   '/admin/model-service/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isAdminModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseAdminModelListBody(body);
}

/**
 * 模型服务详情
 * GET /admin/model-service/{id}
 * @param id 模型 ID（兼容数字 / 字符串）
 */
export async function getAdminModelServiceDetailApi(id: AdminModelServiceId) {
  if (!hasApiId(id)) {
    throw new Error('Invalid model id');
  }
  const body = await rootRequestClient.get<AdminModelServiceDetailResponse>(
    `/pwq-mock/admin/model-service/${toApiPathId(id)}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.get<AdminModelServiceDetailResponse>(
  //   `/admin/model-service/${toApiPathId(id)}`,
  //   { responseReturn: 'body' },
  // );

  if (!isAdminModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return (body?.data ?? null) as AdminModelServiceItem | null;
}

/**
 * 新增模型服务
 * POST /admin/model-service
 * @param data 写请求体
 */
export async function createAdminModelServiceApi(
  data: AdminModelServiceWriteParams,
) {
  const body = await rootRequestClient.post<AdminModelServiceMutationResponse>(
    '/pwq-mock/admin/model-service',
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<AdminModelServiceMutationResponse>(
  //   '/admin/model-service',
  //   data,
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}

/**
 * 编辑模型服务
 * PUT /admin/model-service/{id}
 * @param id 模型 ID
 * @param data 写请求体
 */
export async function updateAdminModelServiceApi(
  id: AdminModelServiceId,
  data: AdminModelServiceWriteParams,
) {
  if (!hasApiId(id)) {
    throw new Error('Invalid model id');
  }
  const body = await rootRequestClient.put<AdminModelServiceMutationResponse>(
    `/pwq-mock/admin/model-service/${toApiPathId(id)}`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<AdminModelServiceMutationResponse>(
  //   `/admin/model-service/${toApiPathId(id)}`,
  //   data,
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}

/**
 * 删除模型服务
 * DELETE /admin/model-service/{id}
 * @param id 模型 ID
 */
export async function deleteAdminModelServiceApi(id: AdminModelServiceId) {
  if (!hasApiId(id)) {
    throw new Error('Invalid model id');
  }
  const body = await rootRequestClient.delete<AdminModelServiceMutationResponse>(
    `/pwq-mock/admin/model-service/${toApiPathId(id)}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.delete<AdminModelServiceMutationResponse>(
  //   `/admin/model-service/${toApiPathId(id)}`,
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}

/**
 * 模型评价列表
 * GET /admin/model-service/evaluation/list
 * @param params 分页与筛选
 */
export async function getAdminModelEvalListApi(
  params: AdminModelEvalListParams,
) {
  const body = await rootRequestClient.get<AdminModelEvalListResponseBody>(
    '/pwq-mock/admin/model-service/evaluation/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<AdminModelEvalListResponseBody>(
  //   '/admin/model-service/evaluation/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isAdminModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseAdminModelEvalListBody(body);
}

/**
 * 审核模型评价
 * PUT /admin/model-service/evaluation/{id}/audit
 * @param id 评价 ID
 * @param data 审核请求体
 */
export async function auditAdminModelEvalApi(
  id: AdminModelEvalId,
  data: AdminModelEvalAuditParams,
) {
  if (!hasApiId(id)) {
    throw new Error('Invalid eval id');
  }
  const body = await rootRequestClient.put<AdminModelEvalMutationResponse>(
    `/pwq-mock/admin/model-service/evaluation/${toApiPathId(id)}/audit`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<AdminModelEvalMutationResponse>(
  //   `/admin/model-service/evaluation/${toApiPathId(id)}/audit`,
  //   data,
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}

/**
 * 屏蔽模型评价
 * PUT /admin/model-service/evaluation/{id}/block
 * @param id 评价 ID
 */
export async function blockAdminModelEvalApi(id: AdminModelEvalId) {
  if (!hasApiId(id)) {
    throw new Error('Invalid eval id');
  }
  const body = await rootRequestClient.put<AdminModelEvalMutationResponse>(
    `/pwq-mock/admin/model-service/evaluation/${toApiPathId(id)}/block`,
    {},
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<AdminModelEvalMutationResponse>(
  //   `/admin/model-service/evaluation/${toApiPathId(id)}/block`,
  //   {},
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}

/**
 * 删除模型评价
 * DELETE /admin/model-service/evaluation/{id}
 * @param id 评价 ID
 */
export async function deleteAdminModelEvalApi(id: AdminModelEvalId) {
  if (!hasApiId(id)) {
    throw new Error('Invalid eval id');
  }
  const body = await rootRequestClient.delete<AdminModelEvalMutationResponse>(
    `/pwq-mock/admin/model-service/evaluation/${toApiPathId(id)}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.delete<AdminModelEvalMutationResponse>(
  //   `/admin/model-service/evaluation/${toApiPathId(id)}`,
  //   { responseReturn: 'body' },
  // );
  assertAdminModelMutationSuccess(body);
  return body;
}
