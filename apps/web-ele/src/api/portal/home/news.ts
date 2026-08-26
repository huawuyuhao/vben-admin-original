import type {
  PortalNews,
  PortalNewsPageParams,
} from '#/types/portal/home/news';

import { rootRequestClient } from '#/api/request';

/**
 * 获取门户行业资讯分页列表
 * 开发态走 Apifox Mock：GET /mock/portal/news
 * 正式接口：GET /portal/news
 * @param params 分页参数
 * @returns 资讯列表（业务 data）
 */
export async function getPortalNewsPageApi(params: PortalNewsPageParams) {
  return rootRequestClient.get<PortalNews[]>('/mock/portal/news', { params });
  // return rootRequestClient.get<PortalNews[]>('/portal/news', { params });
}

/**
 * 获取门户行业资讯详情
 * 开发态走 Apifox Mock：GET /mock/portal/news/{id}
 * 正式接口：GET /portal/news/{id}
 * @param id 资讯 ID
 * @returns 资讯详情（业务 data）
 */
export async function getPortalNewsDetailApi(id: number) {
  return rootRequestClient.get<PortalNews>(`/mock/portal/news/${id}`);
  // return rootRequestClient.get<PortalNews>(`/portal/news/${id}`);
}
