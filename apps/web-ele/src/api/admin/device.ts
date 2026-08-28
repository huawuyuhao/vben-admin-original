import type {
  DeviceDetailResponseBody,
  DeviceItem,
  DeviceListParams,
  DeviceListResponseBody,
  DeviceListResult,
  DeviceMutationResponse,
  DeviceOptionItem,
  DeviceOptionsParams,
  DeviceWriteParams,
} from '#/types/admin/device';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isDeviceApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertDeviceMutationSuccess(body?: null | DeviceMutationResponse) {
  if (!isDeviceApiSuccess(body?.code)) {
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
function parseDeviceListBody<T>(
  body?: null | DeviceListResponseBody<T>,
): DeviceListResult<T> {
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
 * 设备类型列表
 * 开发态走 Apifox Mock：GET /mock/device/type/list
 * 正式接口：GET /device/type/list
 * @returns 设备类型字符串数组
 */
export async function getDeviceTypeListApi() {
  return rootRequestClient.get<string[]>('/mock/device/type/list');
  // return rootRequestClient.get<string[]>('/device/type/list');
}

/**
 * 设备下拉选项（按类型联动）
 * 开发态走 Apifox Mock：GET /mock/device/options
 * 正式接口：GET /device/options
 * @param params 可选 deviceType
 * @returns 设备选项列表
 */
export async function getDeviceOptionsApi(params?: DeviceOptionsParams) {
  return rootRequestClient.get<DeviceOptionItem[]>('/mock/device/options', {
    params,
  });
  // return rootRequestClient.get<DeviceOptionItem[]>('/device/options', {
  //   params,
  // });
}

/**
 * 设备列表分页查询
 * 开发态：GET /mock/device/list
 * 正式：GET /device/list
 * @param params 分页与筛选条件
 * @returns 分页结果（records / total / current / size）
 */
export async function getDeviceListApi(params: DeviceListParams) {
  const body = await rootRequestClient.get<DeviceListResponseBody>(
    '/mock/device/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<DeviceListResponseBody>(
  //   '/device/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isDeviceApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseDeviceListBody(body);
}

/**
 * 设备详情
 * 开发态：GET /mock/device/{id}
 * 正式：GET /device/{id}
 * @param id 设备 ID
 * @returns 设备详情
 */
export async function getDeviceDetailApi(id: number) {
  const body = await rootRequestClient.get<DeviceDetailResponseBody>(
    `/mock/device/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<DeviceDetailResponseBody>(
  //   `/device/${id}`,
  //   { responseReturn: 'body' },
  // );

  if (!isDeviceApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return (body?.data ?? undefined) as DeviceItem | undefined;
}

/**
 * 新增设备
 * 开发态：POST /mock/device
 * 正式：POST /device
 * 入参走 JSON body（非 query）
 * @param data 设备信息
 * @returns 含 key / deviceId
 */
export async function createDeviceApi(data: DeviceWriteParams) {
  const body = await rootRequestClient.post<DeviceMutationResponse>(
    '/mock/device',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<DeviceMutationResponse>(
  //   '/device',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertDeviceMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as { deviceId?: number; key?: number };
  }
  return undefined;
}

/**
 * 修改设备
 * 开发态：PUT /mock/device/{id}
 * 正式：PUT /device/{id}
 * 入参走 JSON body（非 query）；id 在 path
 * @param id 设备 ID
 * @param data 修改参数
 */
export async function updateDeviceApi(id: number, data: DeviceWriteParams) {
  const body = await rootRequestClient.put<DeviceMutationResponse>(
    `/mock/device/${id}`,
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.put<DeviceMutationResponse>(
  //   `/device/${id}`,
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertDeviceMutationSuccess(body);
}

/**
 * 删除设备
 * 开发态：DELETE /mock/device/{id}
 * 正式：DELETE /device/{id}
 * @param id 设备 ID
 */
export async function deleteDeviceApi(id: number) {
  const body = await rootRequestClient.delete<DeviceMutationResponse>(
    `/mock/device/${id}`,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.delete<DeviceMutationResponse>(
  //   `/device/${id}`,
  //   { responseReturn: 'body' },
  // );

  assertDeviceMutationSuccess(body);
}
