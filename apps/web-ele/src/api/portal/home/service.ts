import type { PortalServiceIntro } from '#/types/portal/home/service';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户业务服务介绍列表
 * 开发态走 Apifox Mock：GET /mock/portal/services
 * 正式接口：GET /portal/services
 * @returns 业务服务介绍列表（业务 data）
 */
export async function getPortalServicesApi() {
  return rootRequestClient.get<PortalServiceIntro[]>('/mock/portal/services');
  // return rootRequestClient.get<PortalServiceIntro[]>('/portal/services');
}
