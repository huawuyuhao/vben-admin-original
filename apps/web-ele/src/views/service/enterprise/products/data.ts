import type {
  SupplyProductItem,
  SupplyProductListResult,
  SupplyProductResourceStatus,
  SupplyProductShelfStatus,
} from '#/types/service/enterprise/products';

import { formatDate, isEmpty } from '@vben/utils';

/** 算力产品列表默认每页条数 */
export const PRODUCT_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const PRODUCT_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 下架 */
export const PRODUCT_SHELF_OFF = 0 as SupplyProductShelfStatus;

/** 上架 */
export const PRODUCT_SHELF_ON = 1 as SupplyProductShelfStatus;

/** 资源离线 / 不可用 */
export const PRODUCT_RESOURCE_OFFLINE = 0 as SupplyProductResourceStatus;

/** 资源在线 / 正常 */
export const PRODUCT_RESOURCE_ONLINE = 1 as SupplyProductResourceStatus;

/** 资源异常 / 告警 */
export const PRODUCT_RESOURCE_ABNORMAL = 2 as SupplyProductResourceStatus;

/** 上下架筛选：空串表示全部 */
export type ProductShelfFilter =
  | ''
  | `${typeof PRODUCT_SHELF_OFF}`
  | `${typeof PRODUCT_SHELF_ON}`;

/**
 * 解析上下架筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态数字；全部时返回 undefined
 */
export function parseProductShelfFilter(
  status?: null | ProductShelfFilter,
): SupplyProductShelfStatus | undefined {
  if (status === String(PRODUCT_SHELF_OFF)) {
    return PRODUCT_SHELF_OFF;
  }
  if (status === String(PRODUCT_SHELF_ON)) {
    return PRODUCT_SHELF_ON;
  }
  return undefined;
}

/**
 * 归一化算力产品列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeProductPage(data?: null | SupplyProductListResult): {
  current: number;
  records: SupplyProductItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || PRODUCT_PAGE_SIZE),
  };
}

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatProductDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 展示字段值；空值用占位符
 * @param value 原始值
 * @param emptyText 占位文案
 * @returns 展示字符串
 */
export function displayProductValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value == null) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 获取上下架状态对应的 i18n 键后缀
 * @param status 上下架状态
 * @returns on / off / unknown
 */
export function getProductShelfI18nKey(
  status?: null | number,
): 'off' | 'on' | 'unknown' {
  const value = Number(status);
  if (value === PRODUCT_SHELF_ON) {
    return 'on';
  }
  if (value === PRODUCT_SHELF_OFF) {
    return 'off';
  }
  return 'unknown';
}

/**
 * 获取上下架状态对应的 Element Plus 标签类型
 * @param status 上下架状态
 * @returns tag type
 */
export function getProductShelfTagType(
  status?: null | number,
): 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === PRODUCT_SHELF_ON) {
    return 'success';
  }
  if (value === PRODUCT_SHELF_OFF) {
    return 'info';
  }
  return 'warning';
}

/**
 * 判断产品是否已上架
 * @param status 上下架状态
 * @returns 已上架返回 true
 */
export function isProductOnShelf(status?: null | number): boolean {
  return Number(status) === PRODUCT_SHELF_ON;
}

/**
 * 从列表行解析产品 ID
 * @param item 列表行
 * @returns 合法 ID；无效返回 undefined
 */
export function resolveSupplyProductId(
  item?: null | Pick<SupplyProductItem, 'supplyProductId'>,
): number | undefined {
  const id = Number(item?.supplyProductId);
  if (!Number.isFinite(id) || id <= 0) {
    return undefined;
  }
  return id;
}

/**
 * 获取资源状态对应的 i18n 键后缀
 * @param status 资源状态
 * @returns offline / online / abnormal / unknown
 */
export function getProductResourceI18nKey(
  status?: null | number,
): 'abnormal' | 'offline' | 'online' | 'unknown' {
  const value = Number(status);
  if (value === PRODUCT_RESOURCE_OFFLINE) {
    return 'offline';
  }
  if (value === PRODUCT_RESOURCE_ONLINE) {
    return 'online';
  }
  if (value === PRODUCT_RESOURCE_ABNORMAL) {
    return 'abnormal';
  }
  return 'unknown';
}

/**
 * 获取资源状态对应的 Element Plus 标签类型
 * @param status 资源状态
 * @returns tag type
 */
export function getProductResourceTagType(
  status?: null | number,
): 'danger' | 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === PRODUCT_RESOURCE_ONLINE) {
    return 'success';
  }
  if (value === PRODUCT_RESOURCE_ABNORMAL) {
    return 'danger';
  }
  if (value === PRODUCT_RESOURCE_OFFLINE) {
    return 'info';
  }
  return 'warning';
}
