import type {
  PortalContentAuditParams,
  PortalContentCreateParams,
  PortalContentDeleteParams,
  PortalContentItem,
  PortalContentListParams,
  PortalContentListResponseBody,
  PortalContentListResult,
  PortalContentMutationResponse,
  PortalContentShelfParams,
  PortalContentUpdateParams,
  PortalContentWriteParams,
} from '#/types/monitoring/content/home/common';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isPortalContentApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertPortalContentMutationSuccess(
  body?: null | PortalContentMutationResponse,
) {
  if (!isPortalContentApiSuccess(body?.code)) {
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
function parsePortalContentListBody(
  body?: null | PortalContentListResponseBody,
): PortalContentListResult {
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
 * 门户内容列表分页查询（首页管理各子页共用，通过 content 枚举区分类型）
 * 开发态走 Apifox Mock：GET /mock/admin/content/portal
 * 正式接口：GET /admin/content/portal
 * @param params content / page / pageSize
 * @returns 分页结果（records / total / current / size）
 */
export async function getPortalContentListApi(params: PortalContentListParams) {
  const body = await rootRequestClient.get<PortalContentListResponseBody>(
    '/mock/admin/content/portal',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<PortalContentListResponseBody>(
  //   '/admin/content/portal',
  //   { params, responseReturn: 'body' },
  // );

  if (!isPortalContentApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parsePortalContentListBody(body);
}

/**
 * 新增门户内容
 * 开发态：POST /mock/admin/content/portal
 * 正式：POST /admin/content/portal
 * @param data 新增参数（JSON body）
 * @returns 含 key（contentId）
 */
export async function createPortalContentApi(data: PortalContentCreateParams) {
  const body = await rootRequestClient.post<PortalContentMutationResponse>(
    '/mock/admin/content/portal',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<PortalContentMutationResponse>(
  //   '/admin/content/portal',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertPortalContentMutationSuccess(body);
  return body?.data as { key: number } | undefined;
}

/**
 * 修改门户内容
 * 开发态：PUT /mock/admin/content/portal/{id}
 * 正式：PUT /admin/content/portal/{id}
 * @param id 内容 ID
 * @param data 修改参数（JSON body）
 */
export async function updatePortalContentApi(
  id: number,
  data: PortalContentUpdateParams,
) {
  const body = await rootRequestClient.put<PortalContentMutationResponse>(
    `/mock/admin/content/portal/${id}`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<PortalContentMutationResponse>(
  //   `/admin/content/portal/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertPortalContentMutationSuccess(body);
}

/**
 * 删除门户内容
 * 开发态：DELETE /mock/admin/content/portal/{id}
 * 正式：DELETE /admin/content/portal/{id}
 * @param id 内容 ID
 * @param params 删除参数（query：content）
 */
export async function deletePortalContentApi(
  id: number,
  params: PortalContentDeleteParams,
) {
  const body = await rootRequestClient.delete<PortalContentMutationResponse>(
    `/mock/admin/content/portal/${id}`,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<PortalContentMutationResponse>(
  //   `/admin/content/portal/${id}`,
  //   { params, responseReturn: 'body' },
  // );

  assertPortalContentMutationSuccess(body);
}

/**
 * 门户内容上下架
 * 开发态：PUT /mock/admin/content/product/{id}/shelf
 * 正式：PUT /admin/content/product/{id}/shelf
 * @param id 内容 ID
 * @param data 上下架参数（JSON body：action = shelf | unshelf）
 */
export async function updatePortalContentShelfApi(
  id: number,
  data: PortalContentShelfParams,
) {
  const body = await rootRequestClient.put<PortalContentMutationResponse>(
    `/mock/admin/content/product/${id}/shelf`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<PortalContentMutationResponse>(
  //   `/admin/content/product/${id}/shelf`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertPortalContentMutationSuccess(body);
}

/**
 * 审核门户内容（含提交审核）
 * 开发态：PUT /mock/admin/content/portal/{id}/audit
 * 正式：PUT /admin/content/portal/{id}/audit
 * @param id 内容 ID
 * @param data 审核参数（JSON body：content / auditStatus）
 */
export async function auditPortalContentApi(
  id: number,
  data: PortalContentAuditParams,
) {
  const body = await rootRequestClient.put<PortalContentMutationResponse>(
    `/mock/admin/content/portal/${id}/audit`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<PortalContentMutationResponse>(
  //   `/admin/content/portal/${id}/audit`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertPortalContentMutationSuccess(body);
}

export type {
  PortalContentAuditParams,
  PortalContentCreateParams,
  PortalContentDeleteParams,
  PortalContentItem,
  PortalContentListParams,
  PortalContentListResult,
  PortalContentShelfParams,
  PortalContentUpdateParams,
  PortalContentWriteParams,
};
