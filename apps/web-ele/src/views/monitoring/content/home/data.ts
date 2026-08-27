import type {
  PortalContentItem,
  PortalContentListResult,
  PortalContentType,
} from '#/types/monitoring/content/home/common';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

/** 门户内容列表默认每页条数 */
export const PORTAL_CONTENT_PAGE_SIZE = 10;

/** 可选每页条数 */
export const PORTAL_CONTENT_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 前端拉取全量列表时的 pageSize（接口不支持筛选，由前端分页） */
export const PORTAL_CONTENT_FETCH_ALL_SIZE = 9999;

/** 门户内容图片上传 accept */
export const PORTAL_CONTENT_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

/** 门户内容图片允许 MIME */
const PORTAL_CONTENT_IMAGE_MIME = new Set(['image/jpeg', 'image/png']);

/**
 * 判断是否为允许的门户内容图片文件（jpg / jpeg / png）
 * @param file 文件对象
 */
export function isAllowedPortalContentImageFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (PORTAL_CONTENT_IMAGE_MIME.has(type)) {
    return true;
  }
  return /\.(jpe?g|png)$/i.test(file.name);
}

/** 启用状态筛选项 */
export type PortalContentEnableStatusFilter = '' | '0' | '1';

/** 审核状态筛选项 */
export type PortalContentAuditStatusFilter = '' | '0' | '1' | '2';

/**
 * 列表前端筛选条件
 */
export interface PortalContentListFilters {
  /** 关键词（匹配标题） */
  keyword?: string;
  /** 启用状态 */
  enableStatus?: PortalContentEnableStatusFilter;
  /** 审核状态 */
  auditStatus?: PortalContentAuditStatusFilter;
}

/** 内容类型与路由页面对应 */
export const PORTAL_CONTENT_TYPE = {
  BANNER: 'banner',
  NEWS: 'news',
  SERVICE: 'service',
  BILLING: 'billing',
  ABOUT: 'about',
} as const satisfies Record<string, PortalContentType>;

/** 启用状态值 */
export const PORTAL_CONTENT_STATUS_ENABLED = 1;

/** 审核通过状态值 */
export const PORTAL_CONTENT_AUDIT_PASSED = 1;

/** 待审核状态值 */
export const PORTAL_CONTENT_AUDIT_PENDING = 0;

/**
 * 判断是否可以提交审核（已通过不可再提交）
 * @param auditStatus 审核状态码
 * @returns 可提交返回 true
 */
export function canSubmitPortalContentAudit(
  auditStatus?: null | number,
): boolean {
  return auditStatus !== PORTAL_CONTENT_AUDIT_PASSED;
}

/**
 * 过滤含主键的门户内容条目
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizePortalContentList(
  list?: null | PortalContentItem[],
): PortalContentItem[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => Number.isFinite(item.contentId));
}

/**
 * 归一化门户内容分页结果（供页面绑定）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizePortalContentPage(
  data?: null | PortalContentListResult,
): {
  current: number;
  records: PortalContentItem[];
  size: number;
  total: number;
} {
  return {
    records: normalizePortalContentList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || PORTAL_CONTENT_PAGE_SIZE),
  };
}

/**
 * 获取启用状态 i18n 键后缀
 * @param status 状态码
 * @returns 键后缀
 */
export function getPortalContentStatusLabelKey(status?: number): string {
  if (status === PORTAL_CONTENT_STATUS_ENABLED) {
    return 'enabled';
  }
  if (status === 0) {
    return 'disabled';
  }
  return 'unknown';
}

/**
 * 获取审核状态 i18n 键后缀
 * @param auditStatus 审核状态码
 * @returns 键后缀
 */
export function getPortalContentAuditLabelKey(
  auditStatus?: null | number,
): string {
  if (auditStatus === null || auditStatus === undefined) {
    return 'none';
  }
  if (auditStatus === 0) {
    return 'pending';
  }
  if (auditStatus === PORTAL_CONTENT_AUDIT_PASSED) {
    return 'passed';
  }
  if (auditStatus === 2) {
    return 'rejected';
  }
  return 'unknown';
}

/**
 * 获取 Element Plus 状态标签 type
 * @param status 状态码
 * @returns el-tag type
 */
export function getPortalContentStatusTagType(
  status?: number,
): 'info' | 'success' | 'warning' {
  if (status === PORTAL_CONTENT_STATUS_ENABLED) {
    return 'success';
  }
  if (status === 0) {
    return 'info';
  }
  return 'warning';
}

/**
 * 获取 Element Plus 审核标签 type
 * @param auditStatus 审核状态码
 * @returns el-tag type
 */
export function getPortalContentAuditTagType(
  auditStatus?: null | number,
): 'danger' | 'info' | 'success' | 'warning' {
  if (auditStatus === 0) {
    return 'warning';
  }
  if (auditStatus === PORTAL_CONTENT_AUDIT_PASSED) {
    return 'success';
  }
  if (auditStatus === 2) {
    return 'danger';
  }
  return 'info';
}

/**
 * 格式化日期时间展示
 * @param value 时间字符串
 * @returns 格式化结果；无效返回 `-`
 */
export function formatPortalContentDateTime(value?: string): string {
  if (isEmpty(value?.trim())) {
    return '-';
  }
  return formatDate(value!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 计算分页展示区间
 * @param total 总条数
 * @param current 当前页
 * @param size 每页条数
 * @returns 起止序号
 */
export function calcPortalContentPageRange(
  total: number,
  current: number,
  size: number,
): { end: number; start: number } {
  if (total <= 0) {
    return { start: 0, end: 0 };
  }
  const start = (current - 1) * size + 1;
  const end = Math.min(current * size, total);
  return { start, end };
}

/**
 * 解析门户内容图片可访问地址（兼容相对路径）
 * @param raw 原始图片地址
 * @returns 可用于 el-image 的完整地址；无效返回空串
 */
export function resolvePortalContentImageUrl(raw?: string): string {
  if (isEmpty(raw?.trim())) {
    return '';
  }
  const url = raw!.trim();
  if (isHttpUrl(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`;
  }
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  return `${window.location.origin}/${url.replace(/^\.\//, '')}`;
}

/**
 * 从列表行数据提取图片原始字段
 * @param row 行数据
 * @param contentType 内容类型
 */
export function pickPortalContentImageRaw(
  row: PortalContentItem,
  contentType: PortalContentType,
): string | undefined {
  const imageUrl = row.imageUrl?.trim();
  const coverImage = row.coverImage?.trim();
  if (contentType === 'news') {
    return coverImage || imageUrl;
  }
  return imageUrl || coverImage;
}

/**
 * 解析列表行图片地址
 * @param row 行数据
 * @param contentType 内容类型
 */
export function resolvePortalContentRowImageUrl(
  row: PortalContentItem,
  contentType: PortalContentType,
): string {
  return resolvePortalContentImageUrl(
    pickPortalContentImageRaw(row, contentType),
  );
}

/**
 * 判断是否有可展示的图片地址
 * @param url 图片 URL
 * @returns 有图返回 true
 */
export function hasPortalContentImage(url?: string): boolean {
  return !isEmpty(resolvePortalContentImageUrl(url));
}

/**
 * 是否支持列表排序编辑（news 无 sortOrder）
 * @param contentType 内容类型
 */
export function supportsPortalContentSort(contentType: PortalContentType): boolean {
  return contentType !== 'news';
}

/**
 * 是否支持表单图片上传
 * @param contentType 内容类型
 */
export function supportsPortalContentImage(contentType: PortalContentType): boolean {
  return (
    contentType === 'banner' ||
    contentType === 'service' ||
    contentType === 'about' ||
    contentType === 'news'
  );
}

/**
 * 列表是否展示图片列
 * @param contentType 内容类型
 */
export function showsPortalContentImageColumn(
  contentType: PortalContentType,
): boolean {
  return supportsPortalContentImage(contentType);
}

/**
 * 同步排序草稿与基线
 * @param records 当前页列表
 * @returns draft 与 baseline 映射
 */
export function buildPortalContentSortMaps(records: PortalContentItem[]): {
  baseline: Record<number, number>;
  draft: Record<number, number>;
} {
  const draft: Record<number, number> = {};
  const baseline: Record<number, number> = {};
  for (const row of records) {
    const order = Number(row.sortOrder) || 0;
    draft[row.contentId] = order;
    baseline[row.contentId] = order;
  }
  return { draft, baseline };
}

/**
 * 判断排序草稿是否有变更
 * @param draft 草稿
 * @param baseline 基线
 */
export function hasPortalContentSortChanges(
  draft: Record<number, number>,
  baseline: Record<number, number>,
): boolean {
  return Object.keys(draft).some(
    (id) => draft[Number(id)] !== baseline[Number(id)],
  );
}

/**
 * 判断是否有生效的前端筛选条件
 * @param filters 筛选条件
 */
export function hasPortalContentActiveFilters(
  filters: PortalContentListFilters,
): boolean {
  return !!(
    filters.keyword?.trim() ||
    filters.enableStatus ||
    filters.auditStatus
  );
}

/**
 * 按条件过滤门户内容列表（前端筛选）
 * @param records 原始列表
 * @param filters 筛选条件
 * @returns 过滤后的列表
 */
export function filterPortalContentRecords(
  records: PortalContentItem[],
  filters: PortalContentListFilters,
): PortalContentItem[] {
  const keyword = filters.keyword?.trim().toLowerCase();

  return records.filter((row) => {
    if (keyword && !String(row.title ?? '').toLowerCase().includes(keyword)) {
      return false;
    }

    if (filters.enableStatus) {
      if (String(row.status ?? '') !== filters.enableStatus) {
        return false;
      }
    }

    if (filters.auditStatus) {
      if (String(row.auditStatus ?? '') !== filters.auditStatus) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 对列表做前端分页切片
 * @param records 待分页列表
 * @param current 当前页（从 1 开始）
 * @param size 每页条数
 * @returns 当前页数据
 */
export function paginatePortalContentRecords(
  records: PortalContentItem[],
  current: number,
  size: number,
): PortalContentItem[] {
  if (!records.length) {
    return [];
  }
  const safeSize = Math.max(1, size);
  const safeCurrent = Math.max(1, current);
  const start = (safeCurrent - 1) * safeSize;
  return records.slice(start, start + safeSize);
}
