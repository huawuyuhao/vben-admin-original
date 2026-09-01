import type {
  ComputeDemandCopyResult,
  ComputeDemandCreateResult,
  ComputeDemandDownloadResult,
  ComputeDemandExportParams,
  ComputeDemandExportResult,
  ComputeDemandItem,
  ComputeDemandListParams,
  ComputeDemandListResponseBody,
  ComputeDemandListResult,
  ComputeDemandMutationResponse,
  ComputeDemandPreviewResult,
  ComputeDemandWriteParams,
} from '#/types/service/mydemand/compute';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isComputeDemandApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertComputeDemandMutationSuccess(
  body?: ComputeDemandMutationResponse | null,
) {
  if (!isComputeDemandApiSuccess(body?.code)) {
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
function parseComputeDemandListBody<T>(
  body?: ComputeDemandListResponseBody<T> | null,
): ComputeDemandListResult<T> {
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
 * 需求台账列表分页查询
 * 开发态：GET /mock/demand/list
 * 正式：GET /demand/list
 * @param params 分页与筛选条件
 * @returns 分页结果
 */
export async function getComputeDemandListApi(params: ComputeDemandListParams) {
  const body = await rootRequestClient.get<
    ComputeDemandListResponseBody<ComputeDemandItem>
  >('/mock/demand/list', {
    params,
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   ComputeDemandListResponseBody<ComputeDemandItem>
  // >('/demand/list', {
  //   params,
  //   responseReturn: 'body',
  // });

  if (!isComputeDemandApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseComputeDemandListBody(body);
}

/**
 * 提交算力需求
 * 开发态：POST /mock/demand
 * 正式：POST /demand
 * @param data 需求信息
 * @returns 新建的 demandId / demandNo
 */
export async function createComputeDemandApi(data: ComputeDemandWriteParams) {
  const body = await rootRequestClient.post<
    ComputeDemandMutationResponse<ComputeDemandCreateResult>
  >('/mock/demand', data, { responseReturn: 'body' });
  // const body = await rootRequestClient.post<
  //   ComputeDemandMutationResponse<ComputeDemandCreateResult>
  // >('/demand', data, { responseReturn: 'body' });

  assertComputeDemandMutationSuccess(body);
  return body?.data;
}

/**
 * 需求详情
 * 开发态：GET /mock/demand/{id}
 * 正式：GET /demand/{id}
 * @param id 需求 ID
 * @returns 需求详情
 */
export async function getComputeDemandDetailApi(id: number) {
  const body = await rootRequestClient.get<
    ComputeDemandMutationResponse<ComputeDemandItem>
  >(`/mock/demand/${id}`, { responseReturn: 'body' });
  // const body = await rootRequestClient.get<
  //   ComputeDemandMutationResponse<ComputeDemandItem>
  // >(`/demand/${id}`, { responseReturn: 'body' });

  assertComputeDemandMutationSuccess(body);
  return body?.data;
}

/**
 * 编辑算力需求
 * 开发态：PUT /mock/demand/{id}
 * 正式：PUT /demand/{id}
 * @param id 需求 ID
 * @param data 修改参数
 */
export async function updateComputeDemandApi(
  id: number,
  data: ComputeDemandWriteParams,
) {
  const body = await rootRequestClient.put<ComputeDemandMutationResponse>(
    `/mock/demand/${id}`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<ComputeDemandMutationResponse>(
  //   `/demand/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertComputeDemandMutationSuccess(body);
}

/**
 * 删除算力需求
 * 开发态：DELETE /mock/demand/{id}
 * 正式：DELETE /demand/{id}
 * @param id 需求 ID
 */
export async function deleteComputeDemandApi(id: number) {
  const body = await rootRequestClient.delete<ComputeDemandMutationResponse>(
    `/mock/demand/${id}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.delete<ComputeDemandMutationResponse>(
  //   `/demand/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertComputeDemandMutationSuccess(body);
}

/**
 * 复制历史需求
 * 开发态：POST /mock/demand/{id}/copy
 * 正式：POST /demand/{id}/copy
 * @param id 源需求 ID
 * @returns 新需求 ID / 编号
 */
export async function copyComputeDemandApi(id: number) {
  const body = await rootRequestClient.post<
    ComputeDemandMutationResponse<ComputeDemandCopyResult>
  >(`/mock/demand/${id}/copy`, {}, { responseReturn: 'body' });
  // const body = await rootRequestClient.post<
  //   ComputeDemandMutationResponse<ComputeDemandCopyResult>
  // >(`/demand/${id}/copy`, {}, { responseReturn: 'body' });

  assertComputeDemandMutationSuccess(body);
  return body?.data;
}

/**
 * 需求结果预览
 * 开发态：GET /mock/demand/{id}/result/preview
 * 正式：GET /demand/{id}/result/preview
 * @param id 需求 ID
 * @returns 预览内容
 */
export async function previewComputeDemandResultApi(id: number) {
  const body = await rootRequestClient.get<
    ComputeDemandMutationResponse<ComputeDemandPreviewResult>
  >(`/mock/demand/${id}/result/preview`, { responseReturn: 'body' });
  // const body = await rootRequestClient.get<
  //   ComputeDemandMutationResponse<ComputeDemandPreviewResult>
  // >(`/demand/${id}/result/preview`, { responseReturn: 'body' });

  assertComputeDemandMutationSuccess(body);
  return body?.data;
}

/**
 * 需求结果下载
 * 开发态：GET /mock/demand/{id}/result/download
 * 正式：GET /demand/{id}/result/download
 * @param id 需求 ID
 * @returns 下载链接
 */
export async function downloadComputeDemandResultApi(id: number) {
  const body = await rootRequestClient.get<
    ComputeDemandMutationResponse<ComputeDemandDownloadResult>
  >(`/mock/demand/${id}/result/download`, { responseReturn: 'body' });
  // const body = await rootRequestClient.get<
  //   ComputeDemandMutationResponse<ComputeDemandDownloadResult>
  // >(`/demand/${id}/result/download`, { responseReturn: 'body' });

  assertComputeDemandMutationSuccess(body);
  return body?.data;
}

/**
 * 导出需求列表
 * 开发态：POST /mock/demand/export
 * 正式：POST /demand/export
 * 入参走 query；返参 data.fileUrl / data.fileName
 * @param params 与列表一致的筛选条件（不含分页）
 * @returns 下载地址与文件名
 */
export async function exportComputeDemandApi(
  params?: ComputeDemandExportParams,
) {
  const body = await rootRequestClient.post<
    ComputeDemandMutationResponse<ComputeDemandExportResult>
  >('/mock/demand/export', {}, {
    params: params ?? {},
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.post<
  //   ComputeDemandMutationResponse<ComputeDemandExportResult>
  // >('/demand/export', {}, {
  //   params: params ?? {},
  //   responseReturn: 'body',
  // });

  assertComputeDemandMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result;
  }
  return undefined;
}
