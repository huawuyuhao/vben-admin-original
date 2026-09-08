import type { PortalAboutUs } from '#/types/portal/home/about';
import type { PortalBanner } from '#/types/portal/home/banner';
import type { PortalBillingInfo } from '#/types/portal/home/billing';
import type {
  PortalNews,
  PortalNewsId,
  PortalNewsPageResult,
} from '#/types/portal/home/news';
import type { PortalProductRecommend } from '#/types/portal/home/product';
import type { PortalServiceIntro } from '#/types/portal/home/service';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

import dayjs from 'dayjs';

/** 门户内容启用 / 已发布 / 上架 / 审核通过 */
export const PORTAL_STATUS_ENABLED = 1;

/** 轮播自动切换间隔（毫秒） */
export const BANNER_INTERVAL_MS = 5000;

/** 首页行业资讯每页条数 */
export const NEWS_PAGE_SIZE = 3;

/**
 * 判断门户条目是否启用（兼容 number / 数字字符串；缺省视为启用）
 * @param status 状态字段
 * @returns 启用返回 true
 */
export function isPortalItemEnabled(status?: number | string): boolean {
  if (status === null || status === undefined || status === '') {
    return true;
  }
  return Number(status) === PORTAL_STATUS_ENABLED;
}

/**
 * 过滤启用且含图片的轮播，并按 sortOrder、bannerId 升序排列
 * @param list 接口原始列表
 * @returns 可展示的轮播列表
 */
export function normalizeBannerList(
  list?: null | PortalBanner[],
): PortalBanner[] {
  if (!list?.length) {
    return [];
  }

  return [...list]
    .filter(
      (item) => isPortalItemEnabled(item.status) && !isEmpty(item.imageUrl),
    )
    .sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return (a.bannerId ?? 0) - (b.bannerId ?? 0);
    });
}

/**
 * 过滤启用且含标题的业务服务，并按 sortOrder、serviceId 升序排列
 * @param list 接口原始列表
 * @returns 可展示的业务服务介绍列表
 */
export function normalizeServiceList(
  list?: null | PortalServiceIntro[],
): PortalServiceIntro[] {
  if (!list?.length) {
    return [];
  }

  return [...list]
    .filter(
      (item) =>
        isPortalItemEnabled(item.status) && !isEmpty(item.title?.trim()),
    )
    .sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return (a.serviceId ?? 0) - (b.serviceId ?? 0);
    });
}

/**
 * 过滤上架且审核通过的推荐产品，并按推荐度降序、productId 升序
 * @param list 接口原始列表
 * @returns 可展示的推荐产品
 */
export function normalizeProductRecommendList(
  list?: null | PortalProductRecommend[],
): PortalProductRecommend[] {
  if (!list?.length) {
    return [];
  }

  return [...list]
    .filter(
      (item) =>
        !isEmpty(item.productName?.trim()) &&
        Number(item.shelfStatus) === PORTAL_STATUS_ENABLED &&
        Number(item.status) === PORTAL_STATUS_ENABLED,
    )
    .sort((a, b) => {
      const levelDiff = (b.recommendLevel ?? 0) - (a.recommendLevel ?? 0);
      if (levelDiff !== 0) {
        return levelDiff;
      }
      return (a.productId ?? 0) - (b.productId ?? 0);
    });
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
 * 过滤含标题的「关于我们」条目，并按 sortOrder、aboutId 升序排列
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeAboutList(
  list?: null | PortalAboutUs[],
): PortalAboutUs[] {
  if (!list?.length) {
    return [];
  }

  return [...list]
    .filter((item) => !isEmpty(item.title?.trim()))
    .sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return (a.aboutId ?? 0) - (b.aboutId ?? 0);
    });
}

/**
 * 过滤含标题的计费说明，并按 sortOrder、billingId 升序排列
 * @param list 接口原始列表
 * @returns 可展示的计费说明列表
 */
export function normalizeBillingList(
  list?: null | PortalBillingInfo[],
): PortalBillingInfo[] {
  if (!list?.length) {
    return [];
  }

  return [...list]
    .filter((item) => !isEmpty(item.title?.trim()))
    .sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return (a.billingId ?? 0) - (b.billingId ?? 0);
    });
}

/**
 * 归一化资讯主键：保留字符串雪花 ID，避免 Number 精度丢失
 * @param value 原始主键
 * @returns 可用主键；无法识别时 undefined
 */
export function normalizePortalNewsId(
  value: unknown,
): PortalNewsId | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const text = value.trim();
    if (!/^\d+$/.test(text)) {
      return undefined;
    }
    // 安全整数范围内可保留 number；超长雪花 ID 必须保持字符串
    if (text.length <= 15) {
      const num = Number(text);
      if (Number.isSafeInteger(num)) {
        return num;
      }
    }
    return text;
  }
  return undefined;
}

/**
 * 从资讯原始项解析 newsId（兼容 newsId / id / contentId）
 * @param raw 接口原始列表项
 * @returns 有效主键；无法识别时 undefined
 */
export function resolvePortalNewsId(
  raw?: null | Record<string, unknown>,
): PortalNewsId | undefined {
  if (!raw) {
    return undefined;
  }
  const candidates = [raw.newsId, raw.id, raw.contentId];
  for (const candidate of candidates) {
    const id = normalizePortalNewsId(candidate);
    if (id !== undefined) {
      return id;
    }
  }
  return undefined;
}

/**
 * 从分页 / 列表接口 data 解析资讯数组
 * 兼容：直接数组、{ records } / { rows } / { list }
 * @param data 接口 data
 * @returns 原始列表数组
 */
export function pickPortalNewsRecords(
  data?: null | PortalNews[] | PortalNewsPageResult | Record<string, unknown>,
): PortalNews[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  const source = data as Record<string, unknown>;
  if (Array.isArray(source.records)) {
    return source.records as PortalNews[];
  }
  if (Array.isArray(source.rows)) {
    return source.rows as PortalNews[];
  }
  if (Array.isArray(source.list)) {
    return source.list as PortalNews[];
  }
  return [];
}

/**
 * 过滤已发布且含标题的资讯列表，并补齐 newsId
 * @param list 接口原始列表
 * @returns 可展示的资讯列表
 */
export function normalizeNewsList(
  list?: null | PortalNews[] | Record<string, unknown>[],
): PortalNews[] {
  if (!list?.length) {
    return [];
  }

  const result: PortalNews[] = [];
  for (const item of list) {
    const raw = item as Record<string, unknown>;
    const newsId = resolvePortalNewsId(raw);
    if (newsId === undefined) {
      continue;
    }
    const title = String(raw.title ?? '').trim();
    if (isEmpty(title)) {
      continue;
    }
    if (!isPortalItemEnabled(raw.status as number | string | undefined)) {
      continue;
    }
    result.push({
      ...(item as PortalNews),
      newsId,
      title,
    });
  }
  return result;
}

/**
 * 是否还有下一页（优先按接口 total；无 total 时回退当前页条数判断）
 * @param page 当前页码（从 1 开始）
 * @param pageSize 每页大小
 * @param total 总条数（可选）
 * @param currentCount 当前页条数（无 total 时用于兜底）
 * @returns 还有下一页返回 true
 */
export function hasNewsNextPage(
  page: number,
  pageSize: number,
  total?: number,
  currentCount?: number,
): boolean {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || 1);
  if (total != null && Number.isFinite(Number(total))) {
    return safePage * safeSize < Number(total);
  }
  return (Number(currentCount) || 0) >= safeSize;
}

/**
 * 归一化发布时间字符串（兼容 Mock 用 ? 代替 - / : 的脏数据）
 * @param publishTime 原始发布时间
 * @returns 可被 dayjs 解析的时间串
 */
export function sanitizePublishTime(publishTime?: string): string {
  if (isEmpty(publishTime?.trim())) {
    return '';
  }
  return publishTime!
    .trim()
    .replaceAll('?', '-')
    .replace(/(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-(\d{2})/, '$1 $2:$3:$4')
    .replace(/(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})/, '$1 $2');
}

/**
 * 格式化资讯列表/详情时间
 * @param publishTime 发布时间
 * @returns 年月日时分；无效时返回空串
 */
export function formatNewsDateTime(publishTime?: string): string {
  const normalized = sanitizePublishTime(publishTime);
  if (!normalized) {
    return '';
  }
  // Mock/脏数据解析失败时直接返回空，避免触发 formatDate 的 console.error
  if (!dayjs(normalized).isValid()) {
    return '';
  }
  return formatDate(normalized, 'YYYY-MM-DD HH:mm');
}

/**
 * 打开资讯详情（新窗口，无侧栏公开壳）
 * @param newsId 资讯 ID
 */
export function openNewsDetailWindow(newsId: PortalNewsId) {
  const url = `/portal/news/${newsId}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * 判断轮播是否有可跳转链接
 * @param linkUrl 跳转链接
 * @returns 有有效链接时返回 true
 */
export function hasBannerLink(linkUrl?: string): boolean {
  return !isEmpty(linkUrl?.trim());
}

/**
 * 判断是否为外链（http / https）
 * @param linkUrl 跳转链接
 * @returns 外链返回 true
 */
export function isExternalBannerLink(linkUrl?: string): boolean {
  return isHttpUrl(linkUrl?.trim());
}
