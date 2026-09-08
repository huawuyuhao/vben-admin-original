import type {
  AdminProductAuditStatus,
  AdminProductEvalStatus,
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

/** 产品图片上传 accept */
export const ADMIN_PRODUCT_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

/** 产品图片允许 MIME */
const ADMIN_PRODUCT_IMAGE_MIME = new Set(['image/jpeg', 'image/png']);

/**
 * 判断是否为允许的产品图片文件（jpg / jpeg / png）
 * @param file 文件对象
 */
export function isAllowedAdminProductImageFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (ADMIN_PRODUCT_IMAGE_MIME.has(type)) {
    return true;
  }
  return /\.(jpe?g|png)$/i.test(file.name);
}

/**
 * 将标签数组拼成接口所需逗号分隔字符串
 * @param tags 标签数组
 * @returns 逗号分隔字符串；空则 undefined
 */
export function joinAdminProductTags(
  tags?: null | string[],
): string | undefined {
  if (!tags?.length) {
    return undefined;
  }
  const text = tags
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(',');
  return text || undefined;
}

/** 产品列表默认每页条数（3 列 × 2 行） */
export const ADMIN_PRODUCT_PAGE_SIZE = 6;

/** 可选每页条数 */
export const ADMIN_PRODUCT_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 评价列表默认每页条数 */
export const ADMIN_PRODUCT_EVAL_PAGE_SIZE = 10;

/** 评价列表可选每页条数 */
export const ADMIN_PRODUCT_EVAL_PAGE_SIZE_OPTIONS = [10, 20, 50];

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

/** 评价待审核 */
export const ADMIN_PRODUCT_EVAL_PENDING = 0;

/** 评价已通过 */
export const ADMIN_PRODUCT_EVAL_PASSED = 1;

/** 评价已屏蔽 */
export const ADMIN_PRODUCT_EVAL_BLOCKED = 2;

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
 * 评价状态筛选项
 */
export interface AdminProductEvalStatusFilterOption {
  /** 选项值（空串表示全部） */
  value: '' | AdminProductEvalStatus;
  /** i18n 键后缀 */
  labelKey: string;
}

/** 评价状态筛选下拉 */
export const ADMIN_PRODUCT_EVAL_STATUS_FILTER_OPTIONS: AdminProductEvalStatusFilterOption[] =
  [
    { value: '', labelKey: 'all' },
    { value: ADMIN_PRODUCT_EVAL_PENDING, labelKey: 'pending' },
    { value: ADMIN_PRODUCT_EVAL_PASSED, labelKey: 'passed' },
    { value: ADMIN_PRODUCT_EVAL_BLOCKED, labelKey: 'blocked' },
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
 * 是否可提交产品审核（已通过不可再提交）
 * @param status 审核状态
 * @returns 可提交返回 true
 */
export function canSubmitAdminProductAudit(
  status?: AdminProductAuditStatus | null | number,
): boolean {
  return status !== ADMIN_PRODUCT_AUDIT_PASSED;
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

/**
 * 解析评价状态文案 i18n 键后缀
 * @param status 评价状态
 * @returns labelKey
 */
export function resolveAdminProductEvalStatusLabelKey(
  status?: AdminProductEvalStatus | null | number,
): string {
  if (status === ADMIN_PRODUCT_EVAL_PENDING) {
    return 'pending';
  }
  if (status === ADMIN_PRODUCT_EVAL_PASSED) {
    return 'passed';
  }
  if (status === ADMIN_PRODUCT_EVAL_BLOCKED) {
    return 'blocked';
  }
  return 'unknown';
}

/**
 * 解析评价状态 Tag 类型
 * @param status 评价状态
 * @returns Element Plus tag type
 */
export function resolveAdminProductEvalStatusTagType(
  status?: AdminProductEvalStatus | null | number,
): 'danger' | 'info' | 'success' | 'warning' {
  if (status === ADMIN_PRODUCT_EVAL_PASSED) {
    return 'success';
  }
  if (status === ADMIN_PRODUCT_EVAL_PENDING) {
    return 'warning';
  }
  if (status === ADMIN_PRODUCT_EVAL_BLOCKED) {
    return 'info';
  }
  return 'info';
}

/**
 * 是否可屏蔽评价（已屏蔽不可再屏蔽）
 * @param status 评价状态
 * @returns 可屏蔽返回 true
 */
export function canBlockAdminProductEval(
  status?: AdminProductEvalStatus | null | number,
): boolean {
  return status !== ADMIN_PRODUCT_EVAL_BLOCKED;
}
