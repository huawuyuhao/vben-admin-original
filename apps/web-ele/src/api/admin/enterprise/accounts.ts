import type {
  SubAccountCreateParams,
  SubAccountExportParams,
  SubAccountExportResult,
  SubAccountItem,
  SubAccountListParams,
  SubAccountListResponseBody,
  SubAccountListResult,
  SubAccountMutationResponse,
  SubAccountPermissionParams,
  SubAccountResetPasswordParams,
  SubAccountUpdateParams,
} from '#/types/admin/enterprise/accounts';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isSubAccountApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertSubAccountMutationSuccess(
  body?: null | SubAccountMutationResponse,
) {
  if (!isSubAccountApiSuccess(body?.code)) {
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
function parseSubAccountListBody<T>(
  body?: null | SubAccountListResponseBody<T>,
): SubAccountListResult<T> {
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
 * 子账号分页列表
 * 开发态：GET /mock/enterprise/sub-account/list
 * 正式：GET /enterprise/sub-account/list
 * @param params 分页与筛选条件
 * @returns 分页结果
 */
export async function getSubAccountListApi(params: SubAccountListParams) {
  const body = await rootRequestClient.get<SubAccountListResponseBody>(
    '/mock/enterprise/sub-account/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<SubAccountListResponseBody>(
  //   '/enterprise/sub-account/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isSubAccountApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseSubAccountListBody(body);
}

/**
 * 新增子账号
 * 开发态：POST /mock/enterprise/sub-account
 * 正式：POST /enterprise/sub-account
 * 入参走 query
 * @param params 新增参数
 * @returns 含 key / subAccountId
 */
export async function createSubAccountApi(params: SubAccountCreateParams) {
  const body = await rootRequestClient.post<SubAccountMutationResponse>(
    '/mock/enterprise/sub-account',
    undefined,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SubAccountMutationResponse>(
  //   '/enterprise/sub-account',
  //   undefined,
  //   { params, responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as { key?: number; subAccountId?: number };
  }
  return undefined;
}

/**
 * 修改子账号
 * 开发态：PUT /mock/enterprise/sub-account/{id}
 * 正式：PUT /enterprise/sub-account/{id}
 * 入参走 query
 * @param id 子账号 ID
 * @param params 修改参数
 */
export async function updateSubAccountApi(
  id: number,
  params: SubAccountUpdateParams,
) {
  const body = await rootRequestClient.put<SubAccountMutationResponse>(
    `/mock/enterprise/sub-account/${id}`,
    undefined,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<SubAccountMutationResponse>(
  //   `/enterprise/sub-account/${id}`,
  //   undefined,
  //   { params, responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
}

/**
 * 删除子账号
 * 开发态：DELETE /mock/enterprise/sub-account/{id}
 * 正式：DELETE /enterprise/sub-account/{id}
 * @param id 子账号 ID
 */
export async function deleteSubAccountApi(id: number) {
  const body = await rootRequestClient.delete<SubAccountMutationResponse>(
    `/mock/enterprise/sub-account/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<SubAccountMutationResponse>(
  //   `/enterprise/sub-account/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
}

/**
 * 分配子账号菜单权限
 * 开发态：PUT /mock/enterprise/sub-account/{id}/permission
 * 正式：PUT /enterprise/sub-account/{id}/permission
 * 入参 menuIds 为逗号分隔字符串
 * @param id 子账号 ID
 * @param params 权限参数
 */
export async function assignSubAccountPermissionApi(
  id: number,
  params: SubAccountPermissionParams,
) {
  const body = await rootRequestClient.put<SubAccountMutationResponse>(
    `/mock/enterprise/sub-account/${id}/permission`,
    undefined,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<SubAccountMutationResponse>(
  //   `/enterprise/sub-account/${id}/permission`,
  //   undefined,
  //   { params, responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
}

/**
 * 重置子账号密码
 * 开发态：POST /mock/enterprise/sub-account/{id}/reset-password
 * 正式：POST /enterprise/sub-account/{id}/reset-password
 * 入参走 query
 * @param id 子账号 ID
 * @param params 新密码
 */
export async function resetSubAccountPasswordApi(
  id: number,
  params: SubAccountResetPasswordParams,
) {
  const body = await rootRequestClient.post<SubAccountMutationResponse>(
    `/mock/enterprise/sub-account/${id}/reset-password`,
    undefined,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SubAccountMutationResponse>(
  //   `/enterprise/sub-account/${id}/reset-password`,
  //   undefined,
  //   { params, responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
}

/**
 * 导出子账号列表
 * 开发态：POST /mock/enterprise/sub-account/export
 * 正式：POST /enterprise/sub-account/export
 * 入参走 query；返参 data.fileUrl / data.fileName
 * @param params 筛选条件
 * @returns 下载地址与文件名
 */
export async function exportSubAccountApi(params?: SubAccountExportParams) {
  const body = await rootRequestClient.post<SubAccountMutationResponse>(
    '/mock/enterprise/sub-account/export',
    undefined,
    {
      params: params ?? {},
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SubAccountMutationResponse>(
  //   '/enterprise/sub-account/export',
  //   undefined,
  //   { params: params ?? {}, responseReturn: 'body' },
  // );

  assertSubAccountMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as SubAccountExportResult;
  }
  return undefined;
}

export type { SubAccountItem };
