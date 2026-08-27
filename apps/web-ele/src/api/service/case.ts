import type {
  CaseInfo,
  CaseListItem,
  CaseListParams,
  CaseListResponseBody,
  CaseListResult,
  CaseMutationResponse,
  CaseRelatedParams,
  CaseRelatedResponseBody,
  CaseWriteParams,
} from '#/types/service/case';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isCaseApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertCaseMutationSuccess(body?: null | CaseMutationResponse) {
  if (!isCaseApiSuccess(body?.code)) {
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
function parseCaseListBody<T = CaseListItem>(
  body?: null | CaseListResponseBody<T>,
): CaseListResult<T> {
  if (!body) {
    return { records: [], total: 0, current: 1, size: 10 };
  }

  // 文档：records / total / current / size 与 code 同级
  if (Array.isArray(body.records)) {
    return {
      records: body.records,
      total: Number(body.total) || 0,
      current: Number(body.current) || 1,
      size: Number(body.size) || 10,
    };
  }

  // 兼容：data 为分页对象
  const nested = body.data;
  if (nested && !Array.isArray(nested) && Array.isArray(nested.records)) {
    return {
      records: nested.records,
      total: Number(nested.total) || 0,
      current: Number(nested.current) || 1,
      size: Number(nested.size) || 10,
    };
  }

  // 兼容：data 为数组
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
 * 案例资讯列表分页查询
 * 开发态走 Apifox Mock：GET /mock/case/list
 * 正式接口：GET /case/list
 * 列表 VO：含 tags，不含 content；扁平分页（code/msg/total/records/current/size）
 * @param params 分页与标签筛选参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getCaseListApi(params: CaseListParams) {
  const body = await rootRequestClient.get<CaseListResponseBody>(
    '/mock/case/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<CaseListResponseBody>('/case/list', {
  //   params,
  //   responseReturn: 'body',
  // });

  if (!isCaseApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseCaseListBody(body);
}

/**
 * 案例详情查询
 * 开发态走 Apifox Mock：GET /mock/case/{id}
 * 正式接口：GET /case/{id}
 * 文档返参为 { code, msg, data }，默认 responseReturn: 'data'
 * @param id 案例 ID
 * @returns 案例详情（含 tags）
 */
export async function getCaseDetailApi(id: number) {
  return rootRequestClient.get<CaseInfo>(`/mock/case/${id}`);
  // return rootRequestClient.get<CaseInfo>(`/case/${id}`);
}

/**
 * 关联案例推荐
 * 开发态走 Apifox Mock：GET /mock/case/related
 * 正式接口：GET /case/related
 * @param params caseId / 可选 tagName
 * @returns 关联案例列表
 */
export async function getCaseRelatedApi(params: CaseRelatedParams) {
  const body = await rootRequestClient.get<CaseRelatedResponseBody>(
    '/mock/case/related',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<CaseRelatedResponseBody>(
  //   '/case/related',
  //   { params, responseReturn: 'body' },
  // );

  if (!isCaseApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * 新增案例
 * 开发态：POST /mock/admin/case
 * 正式：POST /admin/case
 * 入参走 JSON body（非 query）
 * @param data 新增参数
 * @returns 含 key（caseId）
 */
export async function createCaseApi(data: CaseWriteParams) {
  const body = await rootRequestClient.post<CaseMutationResponse>(
    '/mock/admin/case',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<CaseMutationResponse>(
  //   '/admin/case',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertCaseMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as { key?: number };
  }
  return undefined;
}

/**
 * 修改案例
 * 开发态：PUT /mock/admin/case/{id}
 * 正式：PUT /admin/case/{id}
 * 入参走 JSON body（非 query）；id 在 path
 * @param id 案例 ID
 * @param data 修改参数
 */
export async function updateCaseApi(id: number, data: CaseWriteParams) {
  const body = await rootRequestClient.put<CaseMutationResponse>(
    `/mock/admin/case/${id}`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<CaseMutationResponse>(
  //   `/admin/case/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertCaseMutationSuccess(body);
}

/**
 * 删除案例
 * 开发态：DELETE /mock/admin/case/{id}
 * 正式：DELETE /admin/case/{id}
 * @param id 案例 ID
 */
export async function deleteCaseApi(id: number) {
  const body = await rootRequestClient.delete<CaseMutationResponse>(
    `/mock/admin/case/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<CaseMutationResponse>(
  //   `/admin/case/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertCaseMutationSuccess(body);
}
