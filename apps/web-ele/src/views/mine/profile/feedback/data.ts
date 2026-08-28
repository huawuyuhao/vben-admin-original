import type {
  FeedbackItem,
  FeedbackListResult,
  FeedbackStatus,
} from '#/types/mine/profile/feedback';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

/** 意见反馈默认每页条数 */
export const FEEDBACK_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const FEEDBACK_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 待处理 */
export const FEEDBACK_STATUS_PENDING = 0 as FeedbackStatus;

/** 处理中 */
export const FEEDBACK_STATUS_PROCESSING = 1 as FeedbackStatus;

/** 已处理 */
export const FEEDBACK_STATUS_DONE = 2 as FeedbackStatus;

/** 处理状态筛选：空串表示全部 */
export type FeedbackStatusFilter =
  | ''
  | `${typeof FEEDBACK_STATUS_DONE}`
  | `${typeof FEEDBACK_STATUS_PENDING}`
  | `${typeof FEEDBACK_STATUS_PROCESSING}`;

/** 反馈图片上传：允许的 MIME */
export const FEEDBACK_IMAGE_ACCEPT = 'image/jpeg,image/png,image/jpg';

/** 反馈图片最大数量 */
export const FEEDBACK_IMAGE_MAX_COUNT = 6;

/** 反馈图片单张最大 MB */
export const FEEDBACK_IMAGE_MAX_MB = 5;

/** 反馈内容最大字数 */
export const FEEDBACK_CONTENT_MAX_LENGTH = 500;

/**
 * 解析处理状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态；全部时返回 undefined
 */
export function parseFeedbackStatusFilter(
  status?: FeedbackStatusFilter | null,
): FeedbackStatus | undefined {
  if (status === String(FEEDBACK_STATUS_PENDING)) {
    return FEEDBACK_STATUS_PENDING;
  }
  if (status === String(FEEDBACK_STATUS_PROCESSING)) {
    return FEEDBACK_STATUS_PROCESSING;
  }
  if (status === String(FEEDBACK_STATUS_DONE)) {
    return FEEDBACK_STATUS_DONE;
  }
  return undefined;
}

/**
 * 归一化意见反馈分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeFeedbackPage(data?: null | FeedbackListResult): {
  current: number;
  records: FeedbackItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || FEEDBACK_PAGE_SIZE),
  };
}

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 年月日时分秒；无效返回空串
 */
export function formatFeedbackDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 获取处理状态对应的 i18n 键后缀
 * @param status 处理状态
 * @returns pending / processing / done / unknown
 */
export function getFeedbackStatusI18nKey(
  status?: null | number,
): 'done' | 'pending' | 'processing' | 'unknown' {
  const value = Number(status);
  if (value === FEEDBACK_STATUS_PENDING) {
    return 'pending';
  }
  if (value === FEEDBACK_STATUS_PROCESSING) {
    return 'processing';
  }
  if (value === FEEDBACK_STATUS_DONE) {
    return 'done';
  }
  return 'unknown';
}

/**
 * 获取处理状态对应的 Element Plus 标签类型
 * @param status 处理状态
 * @returns tag type
 */
export function getFeedbackStatusTagType(
  status?: null | number,
): 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === FEEDBACK_STATUS_DONE) {
    return 'success';
  }
  if (value === FEEDBACK_STATUS_PROCESSING) {
    return 'warning';
  }
  return 'info';
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位文案
 * @returns 展示文本
 */
export function displayFeedbackValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 将逗号分隔的图片字符串解析为 URL 列表
 * @param images 接口 images 字段
 * @returns URL 数组
 */
export function parseFeedbackImageUrls(images?: null | string): string[] {
  if (isEmpty(images?.trim())) {
    return [];
  }
  return images!
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => resolveFeedbackImageUrl(item))
    .filter((item): item is string => Boolean(item));
}

/**
 * 将上传结果或相对路径解析为可展示 URL
 * @param value 原始地址
 * @returns 可访问地址；无效时 undefined
 */
export function resolveFeedbackImageUrl(
  value?: null | string,
): string | undefined {
  const text = value?.trim();
  if (!text) {
    return undefined;
  }
  if (isHttpUrl(text)) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return text;
}

/**
 * 校验是否为允许的反馈图片类型
 * @param file 文件
 * @returns 允许返回 true
 */
export function isAllowedFeedbackImageFile(file: File): boolean {
  const type = String(file.type || '').toLowerCase();
  if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
    return true;
  }
  const name = String(file.name || '').toLowerCase();
  return (
    name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
  );
}

/**
 * 将图片 URL 数组拼接为接口入参字符串
 * @param urls URL 列表
 * @returns 逗号分隔字符串；空则 undefined
 */
export function joinFeedbackImageUrls(urls: string[]): string | undefined {
  const list = urls.map((item) => item.trim()).filter(Boolean);
  return list.length > 0 ? list.join(',') : undefined;
}
