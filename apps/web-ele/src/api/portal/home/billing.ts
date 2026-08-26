import type { PortalBillingInfo } from '#/types/portal/home/billing';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户计费说明列表
 * 开发态走 Apifox Mock：GET /mock/portal/billing
 * 正式接口：GET /portal/billing
 * @returns 计费说明列表（业务 data）
 */
export async function getPortalBillingApi() {
  return rootRequestClient.get<PortalBillingInfo[]>('/mock/portal/billing');
  // return rootRequestClient.get<PortalBillingInfo[]>('/portal/billing');
}
