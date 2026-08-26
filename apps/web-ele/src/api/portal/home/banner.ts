import type { PortalBanner } from '#/types/portal/home/banner';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户首页轮播图列表
 * 开发态走 Apifox Mock：GET /mock/portal/banners
 * 正式接口：GET /portal/banners
 * @returns 轮播图列表（业务 data）
 */
export async function getPortalBannersApi() {
  return rootRequestClient.get<PortalBanner[]>('/mock/portal/banners');
  // return rootRequestClient.get<PortalBanner[]>('/portal/banners');
}
