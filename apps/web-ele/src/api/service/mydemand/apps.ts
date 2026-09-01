import type {
  AppTypeOptionItem,
  AppTypeOptionsParams,
  MyAppCollectAction,
  MyAppItem,
  MyAppListParams,
  MyAppListResponseBody,
  MyAppListResult,
  MyAppMaterialItem,
  MyAppMaterialListParams,
  MyAppMaterialWriteParams,
  MyAppMutationResponse,
  MyAppScheduleTaskParams,
  MyAppToggleAction,
  MyAppVersionItem,
  MyAppVersionWriteParams,
  MyAppWriteParams,
} from '#/types/service/mydemand/apps';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isMyAppApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertMyAppMutationSuccess(
  body?: MyAppMutationResponse | null,
) {
  if (!isMyAppApiSuccess(body?.code)) {
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
function parseMyAppListBody<T>(
  body?: MyAppListResponseBody<T> | null,
): MyAppListResult<T> {
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
 * 应用类型下拉列表（用户端，可搜索）
 * 开发态：GET /mock/app/type/options
 * 正式：GET /app/type/options
 * @param params 可选 keyword（默认传空串，便于 Mock 期望命中）
 * @returns 类型选项列表
 */
export async function getAppTypeOptionsApi(params?: AppTypeOptionsParams) {
  const body = await rootRequestClient.get<
    MyAppMutationResponse<AppTypeOptionItem[]>
  >('/mock/app/type/options', {
    params: {
      keyword: params?.keyword ?? '',
    },
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   MyAppMutationResponse<AppTypeOptionItem[]>
  // >('/app/type/options', {
  //   params: { keyword: params?.keyword ?? '' },
  //   responseReturn: 'body',
  // });

  assertMyAppMutationSuccess(body);
  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * 我的应用列表分页查询
 * 开发态：GET /mock/my-application/list
 * 正式：GET /my-application/list
 * @param params 分页与筛选条件
 * @returns 分页结果
 */
export async function getMyAppListApi(params: MyAppListParams) {
  const body = await rootRequestClient.get<MyAppListResponseBody<MyAppItem>>(
    '/mock/my-application/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<MyAppListResponseBody<MyAppItem>>(
  //   '/my-application/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isMyAppApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseMyAppListBody(body);
}

/**
 * 新增我的应用
 * 开发态：POST /mock/my-application
 * 正式：POST /my-application
 * @param data 应用信息
 */
export async function createMyAppApi(data: MyAppWriteParams) {
  const body = await rootRequestClient.post<MyAppMutationResponse>(
    '/mock/my-application',
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MyAppMutationResponse>(
  //   '/my-application',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 编辑我的应用
 * 开发态：PUT /mock/my-application/{id}
 * 正式：PUT /my-application/{id}
 * @param id 应用 ID
 * @param data 修改参数
 */
export async function updateMyAppApi(id: number, data: MyAppWriteParams) {
  const body = await rootRequestClient.put<MyAppMutationResponse>(
    `/mock/my-application/${id}`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<MyAppMutationResponse>(
  //   `/my-application/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 删除我的应用
 * 开发态：DELETE /mock/my-application/{id}
 * 正式：DELETE /my-application/{id}
 * @param id 应用 ID
 */
export async function deleteMyAppApi(id: number) {
  const body = await rootRequestClient.delete<MyAppMutationResponse>(
    `/mock/my-application/${id}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.delete<MyAppMutationResponse>(
  //   `/my-application/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 应用启停
 * 开发态：PUT /mock/my-application/{id}/toggle
 * 正式：PUT /my-application/{id}/toggle
 * @param id 应用 ID
 * @param action enable-启用 / disable-停用
 */
export async function toggleMyAppApi(id: number, action: MyAppToggleAction) {
  const body = await rootRequestClient.put<MyAppMutationResponse>(
    `/mock/my-application/${id}/toggle`,
    {},
    {
      params: { action },
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<MyAppMutationResponse>(
  //   `/my-application/${id}/toggle`,
  //   {},
  //   { params: { action }, responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 应用收藏 / 取消收藏
 * 开发态：PUT /mock/my-application/{id}/collect
 * 正式：PUT /my-application/{id}/collect
 * @param id 应用 ID
 * @param action collect-收藏 / uncollect-取消收藏
 */
export async function collectMyAppApi(id: number, action: MyAppCollectAction) {
  const body = await rootRequestClient.put<MyAppMutationResponse>(
    `/mock/my-application/${id}/collect`,
    {},
    {
      params: { action },
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<MyAppMutationResponse>(
  //   `/my-application/${id}/collect`,
  //   {},
  //   { params: { action }, responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 应用版本列表
 * 开发态：GET /mock/my-application/{id}/version
 * 正式：GET /my-application/{id}/version
 * @param id 应用 ID
 * @returns 版本列表
 */
export async function getMyAppVersionListApi(id: number) {
  const body = await rootRequestClient.get<
    MyAppMutationResponse<MyAppVersionItem[]>
  >(`/mock/my-application/${id}/version`, {
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   MyAppMutationResponse<MyAppVersionItem[]>
  // >(`/my-application/${id}/version`, { responseReturn: 'body' });

  assertMyAppMutationSuccess(body);
  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * 新增应用版本
 * 开发态：POST /mock/my-application/{id}/version
 * 正式：POST /my-application/{id}/version
 * @param id 应用 ID
 * @param data 版本信息
 */
export async function createMyAppVersionApi(
  id: number,
  data: MyAppVersionWriteParams,
) {
  const body = await rootRequestClient.post<MyAppMutationResponse>(
    `/mock/my-application/${id}/version`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MyAppMutationResponse>(
  //   `/my-application/${id}/version`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 创建定时任务
 * 开发态：POST /mock/my-application/schedule-task
 * 正式：POST /my-application/schedule-task
 * @param data 定时任务参数
 */
export async function createMyAppScheduleTaskApi(
  data: MyAppScheduleTaskParams,
) {
  const body = await rootRequestClient.post<MyAppMutationResponse>(
    '/mock/my-application/schedule-task',
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MyAppMutationResponse>(
  //   '/my-application/schedule-task',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 应用素材列表分页查询
 * 开发态：GET /mock/my-application/material/list
 * 正式：GET /my-application/material/list
 * @param params 分页与应用 ID
 * @returns 分页结果
 */
export async function getMyAppMaterialListApi(params: MyAppMaterialListParams) {
  const body = await rootRequestClient.get<
    MyAppListResponseBody<MyAppMaterialItem>
  >('/mock/my-application/material/list', {
    params,
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   MyAppListResponseBody<MyAppMaterialItem>
  // >('/my-application/material/list', { params, responseReturn: 'body' });

  if (!isMyAppApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseMyAppListBody(body);
}

/**
 * 新增应用素材
 * 开发态：POST /mock/my-application/material
 * 正式：POST /my-application/material
 * @param data 素材信息
 */
export async function createMyAppMaterialApi(data: MyAppMaterialWriteParams) {
  const body = await rootRequestClient.post<MyAppMutationResponse>(
    '/mock/my-application/material',
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MyAppMutationResponse>(
  //   '/my-application/material',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 编辑应用素材
 * 开发态：PUT /mock/my-application/material/{id}
 * 正式：PUT /my-application/material/{id}
 * @param id 素材 ID
 * @param data 修改参数
 */
export async function updateMyAppMaterialApi(
  id: number,
  data: MyAppMaterialWriteParams,
) {
  const body = await rootRequestClient.put<MyAppMutationResponse>(
    `/mock/my-application/material/${id}`,
    data,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.put<MyAppMutationResponse>(
  //   `/my-application/material/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 删除应用素材
 * 开发态：DELETE /mock/my-application/material/{id}
 * 正式：DELETE /my-application/material/{id}
 * @param id 素材 ID
 */
export async function deleteMyAppMaterialApi(id: number) {
  const body = await rootRequestClient.delete<MyAppMutationResponse>(
    `/mock/my-application/material/${id}`,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.delete<MyAppMutationResponse>(
  //   `/my-application/material/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}

/**
 * 素材启停
 * 开发态：PUT /mock/my-application/material/{id}/toggle
 * 正式：PUT /my-application/material/{id}/toggle
 * @param id 素材 ID
 * @param action enable-启用 / disable-停用
 */
export async function toggleMyAppMaterialApi(
  id: number,
  action: MyAppToggleAction,
) {
  const body = await rootRequestClient.put<MyAppMutationResponse>(
    `/mock/my-application/material/${id}/toggle`,
    {},
    {
      params: { action },
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<MyAppMutationResponse>(
  //   `/my-application/material/${id}/toggle`,
  //   {},
  //   { params: { action }, responseReturn: 'body' },
  // );

  assertMyAppMutationSuccess(body);
}
