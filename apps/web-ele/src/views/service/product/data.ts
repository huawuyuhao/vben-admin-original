import type {
  ProductInfo,
  ProductListResult,
  ProductSortField,
} from '#/types/service/product';

import { formatDate, isEmpty } from '@vben/utils';

/** 产品列表默认每页条数（3 列 × 2 行） */
export const PRODUCT_PAGE_SIZE = 6;

/** 可选每页条数（供 el-pagination，从 6 起） */
export const PRODUCT_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 上架 / 审核通过 */
export const PRODUCT_STATUS_ENABLED = 1;

/**
 * 排序字段选项（对应 OpenAPI sortField enum）
 */
export interface ProductSortFieldOption {
  /** 字段值 */
  value: ProductSortField;
  /** i18n 键后缀，对应 page.service.product.sortField.* */
  labelKey: string;
}

/**
 * 排序方向选项（对应 OpenAPI sortOrder）
 */
export interface ProductSortOrderOption {
  /** 方向值 */
  value: 'asc' | 'desc';
  /** i18n 键后缀，对应 page.service.product.sortOrder.* */
  labelKey: string;
}

/** 排序字段下拉 */
export const PRODUCT_SORT_FIELD_OPTIONS: ProductSortFieldOption[] = [
  { value: 'price', labelKey: 'price' },
  { value: 'greenPowerRatio', labelKey: 'greenPowerRatio' },
];

/** 排序方向下拉 */
export const PRODUCT_SORT_ORDER_OPTIONS: ProductSortOrderOption[] = [
  { value: 'asc', labelKey: 'asc' },
  { value: 'desc', labelKey: 'desc' },
];

/**
 * 组装列表查询的排序参数（字段、方向可独立传递）
 * @param sortField 排序字段
 * @param sortOrder 排序方向
 * @returns 可展开进请求参数的对象
 */
export function buildProductSortParams(
  sortField?: null | ProductSortField | string,
  sortOrder?: 'asc' | 'desc' | null | string,
): {
  sortField?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
} {
  const field = sortField?.trim() as ProductSortField | undefined;
  const order = (sortOrder?.trim() || '') as '' | 'asc' | 'desc';
  const result: {
    sortField?: ProductSortField;
    sortOrder?: 'asc' | 'desc';
  } = {};
  if (field === 'price' || field === 'greenPowerRatio') {
    result.sortField = field;
  }
  if (order === 'asc' || order === 'desc') {
    result.sortOrder = order;
  }
  return result;
}

/**
 * 过滤含名称的产品条目（列表接口已返回上架数据，此处做兜底）
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeProductList(
  list?: null | ProductInfo[],
): ProductInfo[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.productName?.trim()));
}

/**
 * 归一化产品列表分页结果（供页面绑定）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeProductPage(data?: null | ProductListResult): {
  current: number;
  records: ProductInfo[];
  size: number;
  total: number;
} {
  return {
    records: normalizeProductList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || PRODUCT_PAGE_SIZE),
  };
}

/**
 * 拆分产品标签字符串（逗号分隔）
 * @param tags 原始标签
 * @returns 标签数组
 */
export function splitProductTags(tags?: string): string[] {
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
export function formatProductPrice(price?: number): string {
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
export function formatGreenPowerRatio(ratio?: number): string {
  if (ratio === null || ratio === undefined || Number.isNaN(Number(ratio))) {
    return '';
  }
  return `${Number(ratio)}%`;
}

/**
 * 格式化产品发布时间
 * @param publishTime 发布时间
 * @returns 年月日时分；无效返回空串
 */
export function formatProductDateTime(publishTime?: string): string {
  if (isEmpty(publishTime?.trim())) {
    return '';
  }
  return formatDate(publishTime!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 是否有产品图
 * @param imageUrl 图片地址
 * @returns 有图返回 true
 */
export function hasProductImage(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}

/**
 * 解析路由中的产品 ID
 * @param raw 路由 params.id
 * @returns 合法正整数；否则 NaN
 */
export function parseProductRouteId(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isFinite(id) && Number.isInteger(id) && id > 0
    ? id
    : Number.NaN;
}
