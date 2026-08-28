import type {
  SupplyDeviceExportParams,
  SupplyDeviceExportResult,
  SupplyDeviceListParams,
  SupplyDeviceListResponseBody,
  SupplyDeviceListResult,
  SupplyDeviceMutationResponse,
  SupplyDeviceSubmitParams,
} from '#/types/enterprise/supply';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isSupplyApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertSupplyMutationSuccess(body?: null | SupplyDeviceMutationResponse) {
  if (!isSupplyApiSuccess(body?.code)) {
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
function parseSupplyListBody<T>(
  body?: null | SupplyDeviceListResponseBody<T>,
): SupplyDeviceListResult<T> {
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
 * 供给设备清单列表分页查询
 * 开发态走 Apifox Mock：GET /mock/supply/device/list
 * 正式接口：GET /supply/device/list
 * @param params 分页与受理状态筛选
 * @returns 分页结果（records / total / current / size）
 */
export async function getSupplyDeviceListApi(params: SupplyDeviceListParams) {
  const body = await rootRequestClient.get<SupplyDeviceListResponseBody>(
    '/mock/supply/device/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<SupplyDeviceListResponseBody>(
  //   '/supply/device/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isSupplyApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseSupplyListBody(body);
}

/**
 * 提交供给设备清单
 * 开发态：POST /mock/supply/device
 * 正式：POST /supply/device
 * 入参走 JSON body（非 query）
 * @param data 设备信息
 * @returns 含 key（deviceId）
 */
export async function submitSupplyDeviceApi(data: SupplyDeviceSubmitParams) {
  const body = await rootRequestClient.post<SupplyDeviceMutationResponse>(
    '/mock/supply/device',
    data,
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SupplyDeviceMutationResponse>(
  //   '/supply/device',
  //   data,
  //   { responseReturn: 'body' },
  // );

  assertSupplyMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as { key?: number };
  }
  return undefined;
}

/**
 * 导出设备清单
 * 开发态：POST /mock/supply/device/export
 * 正式：POST /supply/device/export
 * 入参走 JSON body（非 query）；返参 data.fileUrl / data.fileName
 * @param data 可选受理状态筛选
 * @returns 下载地址与文件名
 */
export async function exportSupplyDeviceApi(data?: SupplyDeviceExportParams) {
  const body = await rootRequestClient.post<SupplyDeviceMutationResponse>(
    '/mock/supply/device/export',
    data ?? {},
    {
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<SupplyDeviceMutationResponse>(
  //   '/supply/device/export',
  //   data ?? {},
  //   { responseReturn: 'body' },
  // );

  assertSupplyMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as SupplyDeviceExportResult;
  }
  return undefined;
}
