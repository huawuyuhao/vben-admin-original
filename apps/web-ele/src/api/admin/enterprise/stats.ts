import type {
  EnterpriseAlertStatItem,
  EnterpriseDeviceCountStatItem,
  EnterpriseOnlineTimeStatItem,
  EnterprisePowerUsageStatItem,
  EnterpriseStatAlertParams,
  EnterpriseStatExportParams,
  EnterpriseStatExportResult,
  EnterpriseStatMutationResponse,
  EnterpriseStatOverview,
  EnterpriseStatPeriodParams,
} from '#/types/admin/enterprise/stats';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功
 * @param code 业务码
 * @returns 成功返回 true
 */
function isStatApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertStatMutationSuccess(
  body?: null | EnterpriseStatMutationResponse,
) {
  if (!isStatApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }
}

/**
 * 服务数据统计概览
 * 开发态：GET /mock/enterprise/stat/overview
 * 正式：GET /enterprise/stat/overview
 * @param params year / month
 * @returns 汇总指标
 */
export async function getEnterpriseStatOverviewApi(
  params?: EnterpriseStatPeriodParams,
) {
  return rootRequestClient.get<EnterpriseStatOverview>(
    '/mock/enterprise/stat/overview',
    { params },
  );
  // return rootRequestClient.get<EnterpriseStatOverview>(
  //   '/enterprise/stat/overview',
  //   { params },
  // );
}

/**
 * 供给设备数量统计
 * 开发态：GET /mock/enterprise/stat/device-count
 * 正式：GET /enterprise/stat/device-count
 * @param params year / month
 * @returns 按日序列
 */
export async function getEnterpriseDeviceCountStatApi(
  params?: EnterpriseStatPeriodParams,
) {
  return rootRequestClient.get<EnterpriseDeviceCountStatItem[]>(
    '/mock/enterprise/stat/device-count',
    { params },
  );
  // return rootRequestClient.get<EnterpriseDeviceCountStatItem[]>(
  //   '/enterprise/stat/device-count',
  //   { params },
  // );
}

/**
 * 设备在线时间统计
 * 开发态：GET /mock/enterprise/stat/online-time
 * 正式：GET /enterprise/stat/online-time
 * @param params year / month
 * @returns 按日序列
 */
export async function getEnterpriseOnlineTimeStatApi(
  params?: EnterpriseStatPeriodParams,
) {
  return rootRequestClient.get<EnterpriseOnlineTimeStatItem[]>(
    '/mock/enterprise/stat/online-time',
    { params },
  );
  // return rootRequestClient.get<EnterpriseOnlineTimeStatItem[]>(
  //   '/enterprise/stat/online-time',
  //   { params },
  // );
}

/**
 * 设备用电量统计
 * 开发态：GET /mock/enterprise/stat/power-usage
 * 正式：GET /enterprise/stat/power-usage
 * @param params year / month
 * @returns 按日序列
 */
export async function getEnterprisePowerUsageStatApi(
  params?: EnterpriseStatPeriodParams,
) {
  return rootRequestClient.get<EnterprisePowerUsageStatItem[]>(
    '/mock/enterprise/stat/power-usage',
    { params },
  );
  // return rootRequestClient.get<EnterprisePowerUsageStatItem[]>(
  //   '/enterprise/stat/power-usage',
  //   { params },
  // );
}

/**
 * 设备告警统计
 * 开发态：GET /mock/enterprise/stat/alert
 * 正式：GET /enterprise/stat/alert
 * @param params year / month / day
 * @returns 按日序列
 */
export async function getEnterpriseAlertStatApi(
  params?: EnterpriseStatAlertParams,
) {
  return rootRequestClient.get<EnterpriseAlertStatItem[]>(
    '/mock/enterprise/stat/alert',
    { params },
  );
  // return rootRequestClient.get<EnterpriseAlertStatItem[]>(
  //   '/enterprise/stat/alert',
  //   { params },
  // );
}

/**
 * 导出统计数据
 * 开发态：POST /mock/enterprise/stat/export
 * 正式：POST /enterprise/stat/export
 * 入参走 query；返参 data.fileUrl / data.fileName
 * @param params year / month / statType
 * @returns 下载地址与文件名
 */
export async function exportEnterpriseStatApi(
  params: EnterpriseStatExportParams,
) {
  const body = await rootRequestClient.post<EnterpriseStatMutationResponse>(
    '/mock/enterprise/stat/export',
    undefined,
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<EnterpriseStatMutationResponse>(
  //   '/enterprise/stat/export',
  //   undefined,
  //   { params, responseReturn: 'body' },
  // );

  assertStatMutationSuccess(body);
  const result = body?.data;
  if (result && typeof result === 'object') {
    return result as EnterpriseStatExportResult;
  }
  return undefined;
}
