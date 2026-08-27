import type {
  AdminProductAuditStatus,
  AdminProductShelfStatus,
} from '#/types/monitoring/content/product';
import type { ProductInfo, ProductListResult } from '#/types/service/product';

import { isEmpty } from '@vben/utils';

export {
  formatGreenPowerRatio,
  formatProductDateTime,
  formatProductPrice,
  hasProductImage,
  splitProductTags,
} from '#/views/service/product/data';

/** 产品列表默认每页条数（3 列 × 2 行） */
export const ADMIN_PRODUCT_PAGE_SIZE = 6;

/** 可选每页条数 */
export const ADMIN_PRODUCT_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 上架 */
export const ADMIN_PRODUCT_SHELF_ON = 1;

/** 下架 */
export const ADMIN_PRODUCT_SHELF_OFF = 0;

/** 待审核 */
export const ADMIN_PRODUCT_AUDIT_PENDING = 0;

/** 审核通过 */
export const ADMIN_PRODUCT_AUDIT_PASSED = 1;

/** 审核不通过 */
export const ADMIN_PRODUCT_AUDIT_REJECTED = 2;

/**
 * 上下架筛选项
 */
export interface AdminProductShelfFilterOption {
  /** 选项值（空串表示全部） */
  value: '' | AdminProductShelfStatus;
  /** i18n 键后缀 */
  labelKey: string;
}

/** 上下架筛选下拉 */
export const ADMIN_PRODUCT_SHELF_FILTER_OPTIONS: AdminProductShelfFilterOption[] =
  [
    { value: '', labelKey: 'all' },
    { value: ADMIN_PRODUCT_SHELF_ON, labelKey: 'on' },
    { value: ADMIN_PRODUCT_SHELF_OFF, labelKey: 'off' },
  ];

/**
 * 过滤含名称的产品条目
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeAdminProductList(
  list?: null | ProductInfo[],
): ProductInfo[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.productName?.trim()));
}

/**
 * 归一化产品列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeAdminProductPage(data?: null | ProductListResult): {
  current: number;
  records: ProductInfo[];
  size: number;
  total: number;
} {
  return {
    records: normalizeAdminProductList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || ADMIN_PRODUCT_PAGE_SIZE),
  };
}

/**
 * 解析上下架状态文案 i18n 键后缀
 * @param shelfStatus 上下架状态
 * @returns labelKey
 */
export function resolveAdminProductShelfLabelKey(
  shelfStatus?: number,
): string {
  if (shelfStatus === ADMIN_PRODUCT_SHELF_ON) {
    return 'on';
  }
  if (shelfStatus === ADMIN_PRODUCT_SHELF_OFF) {
    return 'off';
  }
  return 'unknown';
}

/**
 * 解析上下架状态 Tag 类型
 * @param shelfStatus 上下架状态
 * @returns Element Plus tag type
 */
export function resolveAdminProductShelfTagType(
  shelfStatus?: number,
): 'info' | 'success' | 'warning' {
  if (shelfStatus === ADMIN_PRODUCT_SHELF_ON) {
    return 'success';
  }
  if (shelfStatus === ADMIN_PRODUCT_SHELF_OFF) {
    return 'info';
  }
  return 'warning';
}

/**
 * 解析审核状态文案 i18n 键后缀
 * @param status 审核状态
 * @returns labelKey
 */
export function resolveAdminProductAuditLabelKey(
  status?: AdminProductAuditStatus | number,
): string {
  if (status === ADMIN_PRODUCT_AUDIT_PENDING) {
    return 'pending';
  }
  if (status === ADMIN_PRODUCT_AUDIT_PASSED) {
    return 'passed';
  }
  if (status === ADMIN_PRODUCT_AUDIT_REJECTED) {
    return 'rejected';
  }
  return 'unknown';
}

/**
 * 解析审核状态 Tag 类型
 * @param status 审核状态
 * @returns Element Plus tag type
 */
export function resolveAdminProductAuditTagType(
  status?: AdminProductAuditStatus | number,
): 'danger' | 'info' | 'success' | 'warning' {
  if (status === ADMIN_PRODUCT_AUDIT_PASSED) {
    return 'success';
  }
  if (status === ADMIN_PRODUCT_AUDIT_PENDING) {
    return 'warning';
  }
  if (status === ADMIN_PRODUCT_AUDIT_REJECTED) {
    return 'danger';
  }
  return 'info';
}
