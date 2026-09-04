import type {
  LoginLogExportParams,
  LoginLogExportResult,
  LoginLogListParams,
  LoginLogListResponseBody,
  LoginLogListResult,
  LoginLogMutationResponse,
} from '#/types/mine/profile/login-log';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isLoginLogApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertLoginLogMutationSuccess(
  body?: LoginLogMutationResponse | null,
) {
  if (!isLoginLogApiSuccess(body?.code)) {
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
function parseLoginLogListBody<T>(
  body?: LoginLogListResponseBody<T> | null,
): LoginLogListResult<T> {
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
 * 登录日志分页查询
 * 开发态：GET /mock/monitor/logininfor/list
 * 正式：GET /monitor/logininfor/list
 * @param params 分页与筛选条件
 * @returns 分页结果（records / total / current / size）
 */
export async function getLoginLogListApi(params: LoginLogListParams) {
  const body = await rootRequestClient.get<LoginLogListResponseBody>(
    '/mock/monitor/logininfor/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<LoginLogListResponseBody>(
  //   '/monitor/logininfor/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isLoginLogApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseLoginLogListBody(body);
}

/**
 * 导出登录日志
 * 开发态：POST /mock/monitor/logininfor/export
 * 正式：POST /monitor/logininfor/export
 * 入参走 query；返参 data.fileUrl / data.fileName
 * @param params 与列表一致的筛选条件（不含分页）
 * @returns 下载地址与文件名
 */
export async function exportLoginLogApi(params?: LoginLogExportParams) {
  const body = await rootRequestClient.post<LoginLogMutationResponse>(
    '/mock/monitor/logininfor/export',
    {},
    {
      params: params ?? {},
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<LoginLogMutationResponse>(
  //   '/monitor/logininfor/export',
  //   {},
  //   { params: params ?? {}, responseReturn: 'body' },
  // );

  assertLoginLogMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as LoginLogExportResult;
  }
  return undefined;
}
