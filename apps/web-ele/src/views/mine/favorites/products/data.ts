import type {
  FavoriteItem,
  FavoritesListResult,
} from '#/types/mine/favorites/products';

import { isEmpty } from '@vben/utils';

/** 我的产品（收藏）默认每页条数（3 列 × 2 行） */
export const FAVORITES_PAGE_SIZE = 6;

/** 可选每页条数（供 el-pagination） */
export const FAVORITES_PAGE_SIZE_OPTIONS = [6, 12, 18];

/**
 * 过滤含名称的收藏条目
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeFavoriteList(
  list?: null | FavoriteItem[],
): FavoriteItem[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.productName?.trim()));
}

/**
 * 归一化收藏列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeFavoritesPage(data?: null | FavoritesListResult): {
  current: number;
  records: FavoriteItem[];
  size: number;
  total: number;
} {
  return {
    records: normalizeFavoriteList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || FAVORITES_PAGE_SIZE),
  };
}

/**
 * 拆分产品标签字符串（逗号分隔）
 * @param tags 原始标签
 * @returns 标签数组
 */
export function splitFavoriteTags(tags?: string): string[] {
  if (isEmpty(tags?.trim())) {
    return [];
  }
  return tags!
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * 格式化产品价格展示
 * @param price 价格
 * @returns 如 ¥12,800；无效返回空串
 */
export function formatFavoritePrice(price?: number): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return '';
  }
  const num = Number(price);
  return `¥${num.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
  })}`;
}

/**
 * 格式化绿电占比
 * @param ratio 占比数值
 * @returns 如 35.2%；无效返回空串
 */
export function formatFavoriteGreenPowerRatio(ratio?: number): string {
  if (ratio === null || ratio === undefined || Number.isNaN(Number(ratio))) {
    return '';
  }
  return `${Number(ratio)}%`;
}

/**
 * 是否有产品图
 * @param imageUrl 图片地址
 * @returns 有图返回 true
 */
export function hasFavoriteImage(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}
