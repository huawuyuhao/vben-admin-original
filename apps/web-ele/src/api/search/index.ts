import type {
  PortalSearchParams,
  PortalSearchResultItem,
} from '#/types/search';

import { rootRequestClient } from '#/api/request';

/**
 * 门户全局搜索
 * 开发态走 Apifox Mock：GET /mock/portal/search
 * 正式接口：GET /portal/search
 * @param params keyword / type
 * @returns 搜索结果列表（业务 data）
 */
export async function getPortalSearchApi(params: PortalSearchParams) {
  const data = await rootRequestClient.get<PortalSearchResultItem[]>(
    '/mock/portal/search',
    { params },
  );
  // const data = await rootRequestClient.get<PortalSearchResultItem[]>(
  //   '/portal/search',
  //   { params },
  // );

  return Array.isArray(data) ? data : [];
}
