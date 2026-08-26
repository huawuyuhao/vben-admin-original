import type { PortalProductRecommend } from '#/types/portal/home/product';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户推荐产品列表
 * 开发态走 Apifox Mock：GET /mock/portal/products/recommend
 * 正式接口：GET /portal/products/recommend
 * @returns 推荐产品列表（业务 data）
 */
export async function getPortalProductsRecommendApi() {
  return rootRequestClient.get<PortalProductRecommend[]>(
    '/mock/portal/products/recommend',
  );
  // return rootRequestClient.get<PortalProductRecommend[]>(
  //   '/portal/products/recommend',
  // );
}
