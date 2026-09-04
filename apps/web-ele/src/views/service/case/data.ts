import type {
  CaseInfo,
  CaseListItem,
  CaseListResult,
  CaseType,
} from '#/types/service/case';

import { formatDate, isEmpty } from '@vben/utils';

/** 案例列表默认每页条数（2 列 × 3 行） */
export const CASE_PAGE_SIZE = 6;

/** 可选每页条数（供 el-pagination） */
export const CASE_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 已发布状态 */
export const CASE_STATUS_PUBLISHED = 1;

/** 通算 */
export const CASE_TYPE_GENERAL = 1 as CaseType;

/** 智算 */
export const CASE_TYPE_SMART = 2 as CaseType;

/** 草稿状态 */
export const CASE_STATUS_DRAFT = 0;

/** 封面图上传 accept */
export const CASE_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

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
 * 将标签数组拼成接口所需的逗号分隔字符串
 * @param tags 标签列表
 * @returns 非空字符串；无标签返回 undefined
 */
export function joinCaseTags(tags?: null | string[]): string | undefined {
  const list = normalizeCaseTags(tags);
  return list.length > 0 ? list.join(',') : undefined;
}

/**
 * 案例类型前端筛选值（空串表示全部）
 */
export type CaseTypeFilter = '' | `${typeof CASE_TYPE_GENERAL}` | `${typeof CASE_TYPE_SMART}`;

/**
 * 判断是否有生效的案例类型前端筛选
 * @param caseType 类型筛选值
 * @returns 有筛选返回 true
 */
export function hasCaseTypeFilter(caseType?: CaseTypeFilter | null): boolean {
  return caseType === String(CASE_TYPE_GENERAL) || caseType === String(CASE_TYPE_SMART);
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

/**
 * 解析路由中的案例 ID
 * @param raw 路由 params.id
 * @returns 合法正整数；否则 NaN
 */
export function parseCaseRouteId(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isFinite(id) && Number.isInteger(id) && id > 0
    ? id
    : Number.NaN;
}

/**
 * 判断内容是否为 HTML（用于选择 v-html 或纯文本渲染）
 * @param content 正文
 * @returns 疑似 HTML 返回 true
 */
export function isCaseHtmlContent(content?: string): boolean {
  if (isEmpty(content?.trim())) {
    return false;
  }
  return /<\/?[a-z][\s\S]*>/i.test(content!.trim());
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
 * 按案例类型分组（通算 / 智算 / 其他）
 * @param list 关联案例列表
 * @returns 分组结果
 */
export function groupCasesByType(list?: CaseInfo[] | null): {
  general: CaseInfo[];
  other: CaseInfo[];
  smart: CaseInfo[];
} {
  const general: CaseInfo[] = [];
  const smart: CaseInfo[] = [];
  const other: CaseInfo[] = [];

  for (const item of normalizeCaseList(list)) {
    const type = Number(item.caseType);
    if (type === CASE_TYPE_GENERAL) {
      general.push(item);
    } else if (type === CASE_TYPE_SMART) {
      smart.push(item);
    } else {
      other.push(item);
    }
  }

  return { general, smart, other };
}
