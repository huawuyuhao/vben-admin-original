/**
 * 门户全局搜索结果类型
 * GET /portal/search → data[].type
 */
export type PortalSearchResultType = 'case' | 'model' | 'news' | 'product';

/**
 * 搜索类型筛选（含全部）
 */
export type PortalSearchTypeFilter = 'all' | PortalSearchResultType;

/**
 * 门户全局搜索查询参数
 * GET /portal/search
 */
export interface PortalSearchParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 搜索类型（默认 all） */
  type: PortalSearchTypeFilter;
}

/**
 * 门户全局搜索单条结果
 */
export interface PortalSearchResultItem {
  /** 结果类型 */
  type: PortalSearchResultType;
  /** 名称 / 标题 */
  name: string;
  /** 简介 / 摘要 */
  description?: string;
  /** 业务主键，用于跳转详情 */
  id: number;
}
