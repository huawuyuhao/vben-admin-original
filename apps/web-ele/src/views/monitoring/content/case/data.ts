import type {
  CaseAuditStatus,
  CaseListItem,
  CaseListResult,
  CaseType,
} from '#/types/monitoring/content/case';

import { formatDate, isEmpty } from '@vben/utils';

/** 案例列表默认每页条数（2 列 × 3 行） */
export const CASE_PAGE_SIZE = 6;

/** 可选每页条数（供 el-pagination） */
export const CASE_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 已发布状态 */
export const CASE_STATUS_PUBLISHED = 1;

/** 草稿状态 */
export const CASE_STATUS_DRAFT = 0;

/** 通算 */
export const CASE_TYPE_GENERAL = 1 as CaseType;

/** 智算 */
export const CASE_TYPE_SMART = 2 as CaseType;

/** 封面图上传 accept */
export const CASE_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

/** 审核待审 / 草稿态（列表 status） */
export const CASE_AUDIT_PENDING = 0;

/** 审核通过 */
export const CASE_AUDIT_PASSED = 1;

/** 审核不通过 */
export const CASE_AUDIT_REJECTED = 2;

/**
 * 提交审核接口入参 auditStatus 默认值（当前为 1）
 * 后续若甲方要求变更，只改此处即可
 */
export const CASE_AUDIT_SUBMIT_STATUS = CASE_AUDIT_PASSED;

/**
 * 是否草稿筛选值（空串表示全部；走接口 isDraft）
 */
export type CaseDraftFilter = '' | 'false' | 'true';

/**
 * 将筛选值转为列表接口 isDraft 入参
 * @param filter 筛选值
 * @returns true / false；全部时 undefined（不传）
 */
export function resolveCaseListIsDraft(
  filter?: CaseDraftFilter | null,
): boolean | undefined {
  if (filter === 'true') {
    return true;
  }
  if (filter === 'false') {
    return false;
  }
  return undefined;
}

/**
 * 列表 status 是否视为草稿（0-待审核/草稿）
 * @param status 审核状态
 * @returns 草稿返回 true
 */
export function isCaseListDraft(
  status?: CaseAuditStatus | null | number,
): boolean {
  return status === CASE_AUDIT_PENDING;
}

/**
 * 解析审核状态文案 i18n 键后缀
 * @param status 审核状态
 * @returns labelKey
 */
export function resolveCaseAuditLabelKey(
  status?: CaseAuditStatus | number,
): string {
  if (status === CASE_AUDIT_PENDING) {
    return 'pending';
  }
  if (status === CASE_AUDIT_PASSED) {
    return 'passed';
  }
  if (status === CASE_AUDIT_REJECTED) {
    return 'rejected';
  }
  return 'unknown';
}

/**
 * 解析审核状态 Tag 类型
 * @param status 审核状态
 * @returns Element Plus tag type
 */
export function resolveCaseAuditTagType(
  status?: CaseAuditStatus | number,
): 'danger' | 'info' | 'success' | 'warning' {
  if (status === CASE_AUDIT_PASSED) {
    return 'success';
  }
  if (status === CASE_AUDIT_PENDING) {
    return 'warning';
  }
  if (status === CASE_AUDIT_REJECTED) {
    return 'danger';
  }
  return 'info';
}

/**
 * 案例类型前端筛选值（空串表示全部）
 */
export type CaseTypeFilter =
  | ''
  | `${typeof CASE_TYPE_GENERAL}`
  | `${typeof CASE_TYPE_SMART}`;

/**
 * 校验是否为允许的封面图文件类型
 * @param file 原始文件
 * @returns 允许返回 true
 */
export function isAllowedCaseImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ['.jpg', '.jpeg', '.png'].some((ext) => name.endsWith(ext));
}

/**
 * 规范化标签列表
 * @param tags 标签数组
 * @returns 去空后的标签
 */
export function normalizeCaseTags(tags?: null | string[]): string[] {
  if (!tags?.length) {
    return [];
  }
  return tags.map((t) => String(t).trim()).filter((t) => !isEmpty(t));
}

/**
 * 将标签数组拼成接口所需的逗号分隔字符串
 * @param tags 标签列表
 * @returns 非空字符串；无标签返回 undefined
 */
export function joinCaseTags(tags?: null | string[]): string | undefined {
  const list = normalizeCaseTags(tags);
  return list.length > 0 ? list.join(',') : undefined;
}

/**
 * 判断是否有生效的案例类型前端筛选
 * @param caseType 类型筛选值
 * @returns 有筛选返回 true
 */
export function hasCaseTypeFilter(caseType?: CaseTypeFilter | null): boolean {
  return (
    caseType === String(CASE_TYPE_GENERAL) ||
    caseType === String(CASE_TYPE_SMART)
  );
}

/**
 * 按案例类型过滤当前页列表（前端筛选，不请求接口）
 * @param records 当前页原始列表
 * @param caseType 类型筛选值（空为全部）
 * @returns 过滤后的列表
 */
export function filterCaseRecordsByType(
  records: CaseListItem[],
  caseType?: CaseTypeFilter | null,
): CaseListItem[] {
  if (!hasCaseTypeFilter(caseType)) {
    return records;
  }
  return records.filter((row) => String(row.caseType ?? '') === caseType);
}

/**
 * 过滤含标题的案例条目（列表接口已返回已发布数据，此处做兜底）
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeCaseList(
  list?: CaseListItem[] | null,
): CaseListItem[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.title?.trim()));
}

/**
 * 归一化案例列表分页结果（供页面绑定）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeCasePage(data?: CaseListResult | null): {
  current: number;
  records: CaseListItem[];
  size: number;
  total: number;
} {
  return {
    records: normalizeCaseList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || CASE_PAGE_SIZE),
  };
}

/**
 * 是否有封面图
 * @param coverImage 封面地址
 * @returns 有图返回 true
 */
export function hasCaseCover(coverImage?: string): boolean {
  return !isEmpty(coverImage?.trim());
}

/**
 * 格式化浏览次数
 * @param count 浏览次数
 * @returns 本地化数字；无效返回空串
 */
export function formatCaseViewCount(count?: number): string {
  if (count === null || count === undefined || Number.isNaN(Number(count))) {
    return '';
  }
  return Number(count).toLocaleString('zh-CN');
}

/**
 * 格式化案例时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatCaseDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}
