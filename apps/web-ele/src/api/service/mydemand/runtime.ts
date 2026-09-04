import type {
  RunningTaskCarbonPoint,
  RunningTaskDetail,
  RunningTaskHistoryParams,
  RunningTaskHistoryPoint,
  RunningTaskItem,
  RunningTaskListParams,
  RunningTaskListResponseBody,
  RunningTaskListResult,
  RunningTaskMutationResponse,
  RunningTaskPowerPoint,
  RunningTaskResourcePoint,
  RunningTaskSeriesParams,
} from '#/types/service/mydemand/runtime';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isRunningTaskApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作 / 详情响应并抛出错误
 * @param body 响应体
 */
function assertRunningTaskSuccess(body?: null | RunningTaskMutationResponse) {
  if (!isRunningTaskApiSuccess(body?.code)) {
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
function parseRunningTaskListBody<T>(
  body?: null | RunningTaskListResponseBody<T>,
): RunningTaskListResult<T> {
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
 * 解析数组型 data 响应
 * @param body 响应体
 * @returns 数组；失败抛错
 */
function parseRunningTaskArrayBody<T>(
  body?: null | RunningTaskMutationResponse<T[]>,
): T[] {
  assertRunningTaskSuccess(body);
  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * 在运应用列表
 * 开发态：GET /mock/task/running/list
 * 正式：GET /task/running/list
 * @param params 分页参数
 * @returns 分页结果
 */
export async function getRunningTaskListApi(params: RunningTaskListParams) {
  const body = await rootRequestClient.get<
    RunningTaskListResponseBody<RunningTaskItem>
  >('/mock/task/running/list', {
    params,
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   RunningTaskListResponseBody<RunningTaskItem>
  // >('/task/running/list', {
  //   params,
  //   responseReturn: 'body',
  // });

  if (!isRunningTaskApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseRunningTaskListBody(body);
}

/**
 * 任务运行详情
 * 开发态：GET /mock/task/running/{id}
 * 正式：GET /task/running/{id}
 * @param id 任务 ID（数字或业务编号字符串）
 * @returns 详情
 */
export async function getRunningTaskDetailApi(id: number | string) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.get<
    RunningTaskMutationResponse<RunningTaskDetail>
  >(`/mock/task/running/${pathId}`, { responseReturn: 'body' });
  // const body = await rootRequestClient.get<
  //   RunningTaskMutationResponse<RunningTaskDetail>
  // >(`/task/running/${pathId}`, { responseReturn: 'body' });

  assertRunningTaskSuccess(body);
  return body?.data;
}

/**
 * 电力实时数据
 * 开发态：GET /mock/task/running/{id}/power-data
 * 正式：GET /task/running/{id}/power-data
 * @param id 任务 ID
 * @param params 时间范围
 * @returns 电力序列
 */
export async function getRunningTaskPowerDataApi(
  id: number | string,
  params?: RunningTaskSeriesParams,
) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.get<
    RunningTaskMutationResponse<RunningTaskPowerPoint[]>
  >(`/mock/task/running/${pathId}/power-data`, {
    params: params ?? {},
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   RunningTaskMutationResponse<RunningTaskPowerPoint[]>
  // >(`/task/running/${pathId}/power-data`, {
  //   params: params ?? {},
  //   responseReturn: 'body',
  // });

  return parseRunningTaskArrayBody(body);
}

/**
 * 碳排放实时数据
 * 开发态：GET /mock/task/running/{id}/carbon-data
 * 正式：GET /task/running/{id}/carbon-data
 * @param id 任务 ID
 * @param params 时间范围
 * @returns 碳排序列
 */
export async function getRunningTaskCarbonDataApi(
  id: number | string,
  params?: RunningTaskSeriesParams,
) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.get<
    RunningTaskMutationResponse<RunningTaskCarbonPoint[]>
  >(`/mock/task/running/${pathId}/carbon-data`, {
    params: params ?? {},
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   RunningTaskMutationResponse<RunningTaskCarbonPoint[]>
  // >(`/task/running/${pathId}/carbon-data`, {
  //   params: params ?? {},
  //   responseReturn: 'body',
  // });

  return parseRunningTaskArrayBody(body);
}

/**
 * 资源监控数据
 * 开发态：GET /mock/task/running/{id}/resource-data
 * 正式：GET /task/running/{id}/resource-data
 * @param id 任务 ID
 * @param params 时间范围
 * @returns 资源序列
 */
export async function getRunningTaskResourceDataApi(
  id: number | string,
  params?: RunningTaskSeriesParams,
) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.get<
    RunningTaskMutationResponse<RunningTaskResourcePoint[]>
  >(`/mock/task/running/${pathId}/resource-data`, {
    params: params ?? {},
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   RunningTaskMutationResponse<RunningTaskResourcePoint[]>
  // >(`/task/running/${pathId}/resource-data`, {
  //   params: params ?? {},
  //   responseReturn: 'body',
  // });

  return parseRunningTaskArrayBody(body);
}

/**
 * 历史趋势图
 * 开发态：GET /mock/task/running/{id}/history-trend
 * 正式：GET /task/running/{id}/history-trend
 * @param id 任务 ID
 * @param params 维度与时间范围
 * @returns 趋势序列
 */
export async function getRunningTaskHistoryTrendApi(
  id: number | string,
  params?: RunningTaskHistoryParams,
) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.get<
    RunningTaskMutationResponse<RunningTaskHistoryPoint[]>
  >(`/mock/task/running/${pathId}/history-trend`, {
    params: params ?? {},
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   RunningTaskMutationResponse<RunningTaskHistoryPoint[]>
  // >(`/task/running/${pathId}/history-trend`, {
  //   params: params ?? {},
  //   responseReturn: 'body',
  // });

  return parseRunningTaskArrayBody(body);
}

/**
 * 关闭任务
 * 开发态：POST /mock/task/running/{id}/close
 * 正式：POST /task/running/{id}/close
 * @param id 任务 ID
 * @returns 接口 data（可选提示文案）
 */
export async function closeRunningTaskApi(id: number | string) {
  const pathId = encodeURIComponent(String(id));
  const body = await rootRequestClient.post<
    RunningTaskMutationResponse<string>
  >(`/mock/task/running/${pathId}/close`, {}, { responseReturn: 'body' });
  // const body = await rootRequestClient.post<
  //   RunningTaskMutationResponse<string>
  // >(`/task/running/${pathId}/close`, {}, { responseReturn: 'body' });

  assertRunningTaskSuccess(body);
  return body?.data;
}
