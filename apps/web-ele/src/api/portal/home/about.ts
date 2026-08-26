import type { PortalAboutUs } from '#/types/portal/home/about';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户「关于我们」列表
 * 开发态走 Apifox Mock：GET /mock/portal/about-us
 * 正式接口：GET /portal/about-us
 * @returns 关于我们列表（业务 data）
 */
export async function getPortalAboutUsApi() {
  return rootRequestClient.get<PortalAboutUs[]>('/mock/portal/about-us');
  // return rootRequestClient.get<PortalAboutUs[]>('/portal/about-us');
}
