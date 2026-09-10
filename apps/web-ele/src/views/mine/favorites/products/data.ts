import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  FavoriteItem,
  FavoritesListResult,
} from '#/types/mine/favorites/products';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

/** 收藏产品列表默认每页条数（卡片网格） */
export const FAVORITES_PAGE_SIZE = 6;

/** 可选每页条数（供分页器） */
export const FAVORITES_PAGE_SIZE_OPTIONS = [6, 12, 18];

/**
 * 收藏产品列表列配置
 */
export function useFavoritesColumns(): VxeTableGridOptions<FavoriteItem>['columns'] {
  const emptyText = $t('page.mine.favorites.products.valueEmpty');
  return [
    {
      align: 'center',
      cellRender: { name: 'CellImage' },
      field: 'imageUrl',
      minWidth: 80,
      title: $t('page.mine.favorites.products.fields.cover'),
    },
    {
      field: 'productName',
      minWidth: 160,
      showOverflow: true,
      title: $t('page.mine.favorites.products.fields.productName'),
      formatter: ({ cellValue }) => displayFavoriteValue(cellValue, emptyText),
    },
    {
      field: 'tags',
      minWidth: 160,
      slots: { default: 'tags' },
      title: $t('page.mine.favorites.products.fields.tags'),
    },
    {
      field: 'price',
      minWidth: 110,
      title: $t('page.mine.favorites.products.fields.price'),
      formatter: ({ cellValue }) =>
        formatFavoritePrice(cellValue) ||
        $t('page.service.product.pricePending'),
    },
    {
      field: 'greenPowerRatio',
      minWidth: 110,
      title: $t('page.mine.favorites.products.fields.greenPowerRatio'),
      formatter: ({ cellValue }) =>
        formatFavoriteGreenPowerRatio(cellValue) || emptyText,
    },
    {
      field: 'description',
      minWidth: 200,
      showOverflow: true,
      title: $t('page.mine.favorites.products.fields.description'),
      formatter: ({ cellValue }) => displayFavoriteValue(cellValue, emptyText),
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      minWidth: 220,
      slots: { default: 'action' },
      title: $t('page.mine.favorites.products.fields.actions'),
    },
  ];
}

/**
 * 过滤含名称的收藏条目
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeFavoriteList(
  list?: FavoriteItem[] | null,
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
export function normalizeFavoritesPage(data?: FavoritesListResult | null): {
  current: number;
  records: FavoriteItem[];
  size: number;
  total: number;
} {
  return {
    records: normalizeFavoriteList(data?.records).map((item) => ({
      ...item,
      isCollected: item.isCollected ?? true,
    })),
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

/**
 * 展示字段值；空值用占位符
 * @param value 原始值
 * @param emptyText 占位文案
 * @returns 展示字符串
 */
export function displayFavoriteValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value == null) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}
