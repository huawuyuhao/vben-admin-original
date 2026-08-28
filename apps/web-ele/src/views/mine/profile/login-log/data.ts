import type {
  LoginLogItem,
  LoginLogListParams,
  LoginLogListResult,
  LoginLogStatus,
} from '#/types/mine/profile/login-log';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

/** 登录日志默认每页条数 */
export const LOGIN_LOG_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const LOGIN_LOG_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 登录成功 */
export const LOGIN_LOG_STATUS_SUCCESS = '0' as LoginLogStatus;

/** 登录失败 */
export const LOGIN_LOG_STATUS_FAIL = '1' as LoginLogStatus;

/** 登录状态筛选：空串表示全部 */
export type LoginLogStatusFilter =
  | ''
  | typeof LOGIN_LOG_STATUS_FAIL
  | typeof LOGIN_LOG_STATUS_SUCCESS;

/** 访问时间范围（起止，含时分秒） */
export type LoginLogTimeRange = [string, string] | null;

/**
 * 解析登录状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态；全部时返回 undefined
 */
export function parseLoginLogStatusFilter(
  status?: LoginLogStatusFilter | null,
): LoginLogStatus | undefined {
  if (status === LOGIN_LOG_STATUS_SUCCESS || status === LOGIN_LOG_STATUS_FAIL) {
    return status;
  }
  return undefined;
}

/**
 * 将时间范围转为列表 / 导出查询中的 beginTime / endTime
 * @param range 日期时间范围
 * @returns 若依 params[beginTime] / params[endTime]；无范围时为空对象
 */
export function buildLoginLogTimeParams(
  range?: LoginLogTimeRange,
): Pick<LoginLogListParams, 'params[beginTime]' | 'params[endTime]'> {
  if (!range?.[0] || !range[1]) {
    return {};
  }
  return {
    'params[beginTime]': range[0],
    'params[endTime]': range[1],
  };
}

/**
 * 归一化登录日志分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeLoginLogPage(data?: null | LoginLogListResult): {
  current: number;
  records: LoginLogItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || LOGIN_LOG_PAGE_SIZE),
  };
}

/**
 * 格式化访问时间
 * @param time 时间字符串
 * @returns 年月日时分秒；无效返回空串
 */
export function formatLoginLogDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 获取登录状态对应的 i18n 键后缀
 * @param status 登录状态
 * @returns success / fail / unknown
 */
export function getLoginLogStatusI18nKey(
  status?: null | string,
): 'fail' | 'success' | 'unknown' {
  const value = String(status ?? '').trim();
  if (value === LOGIN_LOG_STATUS_SUCCESS) {
    return 'success';
  }
  if (value === LOGIN_LOG_STATUS_FAIL) {
    return 'fail';
  }
  return 'unknown';
}

/**
 * 获取登录状态对应的 Element Plus 标签类型
 * @param status 登录状态
 * @returns tag type
 */
export function getLoginLogStatusTagType(
  status?: null | string,
): 'danger' | 'info' | 'success' {
  const value = String(status ?? '').trim();
  if (value === LOGIN_LOG_STATUS_SUCCESS) {
    return 'success';
  }
  if (value === LOGIN_LOG_STATUS_FAIL) {
    return 'danger';
  }
  return 'info';
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位文案
 * @returns 展示文本
 */
export function displayLoginLogValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 将导出接口返参解析为可下载 URL
 * @param value 接口 data.fileUrl
 * @returns 可下载地址；无法识别时 undefined
 */
export function resolveLoginLogExportDownloadUrl(
  value?: null | string,
): string | undefined {
  const text = value?.trim();
  if (!text) {
    return undefined;
  }
  if (isHttpUrl(text)) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return undefined;
}
