import type {
  PortalSearchResultItem,
  PortalSearchResultType,
  PortalSearchTypeFilter,
} from '#/types/search';

/** 搜索类型筛选项（含全部） */
export const SEARCH_TYPE_FILTERS: PortalSearchTypeFilter[] = [
  'all',
  'product',
  'model',
  'case',
  'news',
];

/** 各结果类型对应的 Element Plus Tag 色 */
export const SEARCH_TYPE_TAG_TYPE: Record<
  PortalSearchResultType,
  'danger' | 'info' | 'primary' | 'success' | 'warning'
> = {
  product: 'success',
  model: 'primary',
  case: 'warning',
  news: 'info',
};

/**
 * 根据搜索结果类型解析详情页路由
 * @param item 搜索结果项
 * @returns 可跳转的 path；类型未知时返回空串
 */
export function resolveSearchDetailPath(
  item: Pick<PortalSearchResultItem, 'id' | 'type'>,
): string {
  const id = Number(item.id);
  if (!Number.isFinite(id) || id <= 0) {
    return '';
  }

  switch (item.type) {
    case 'case': {
      return `/service/case/${id}`;
    }
    case 'model': {
      return `/service/model/${id}`;
    }
    case 'news': {
      return `/portal/news/${id}`;
    }
    case 'product': {
      return `/service/product/${id}`;
    }
    default: {
      return '';
    }
  }
}

/**
 * 结果类型 i18n 键（page.search.type.*）
 * @param type 结果类型
 * @returns 语言包键后缀
 */
export function searchTypeI18nKey(
  type: PortalSearchResultType | string,
): string {
  if (type === 'product' || type === 'model' || type === 'case' || type === 'news') {
    return type;
  }
  return 'unknown';
}
