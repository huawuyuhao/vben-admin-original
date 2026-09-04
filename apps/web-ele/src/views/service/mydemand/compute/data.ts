import type { MyAppItem, MyAppListResult } from '#/types/service/mydemand/apps';
import type {
  ComputeDemandItem,
  ComputeDemandListResult,
  ComputeDemandStatus,
} from '#/types/service/mydemand/compute';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

/** 算力需求列表默认每页条数 */
export const COMPUTE_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const COMPUTE_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 关联应用分页选择默认每页条数（卡片 3×3） */
export const COMPUTE_APP_PICKER_PAGE_SIZE = 9;

/** 关联应用分页可选每页条数 */
export const COMPUTE_APP_PICKER_PAGE_SIZE_OPTIONS = [9, 18, 36];

/** 待提交 */
export const COMPUTE_STATUS_DRAFT = 0 as ComputeDemandStatus;

/** 待审核 */
export const COMPUTE_STATUS_PENDING = 1 as ComputeDemandStatus;

/** 审核不通过 */
export const COMPUTE_STATUS_REJECTED = 2 as ComputeDemandStatus;

/** 已转任务 */
export const COMPUTE_STATUS_CONVERTED = 3 as ComputeDemandStatus;

/** 执行中 */
export const COMPUTE_STATUS_RUNNING = 4 as ComputeDemandStatus;

/** 已完成 */
export const COMPUTE_STATUS_DONE = 5 as ComputeDemandStatus;

/** 全部需求状态（筛选下拉） */
export const COMPUTE_STATUS_OPTIONS = [
  COMPUTE_STATUS_DRAFT,
  COMPUTE_STATUS_PENDING,
  COMPUTE_STATUS_REJECTED,
  COMPUTE_STATUS_CONVERTED,
  COMPUTE_STATUS_RUNNING,
  COMPUTE_STATUS_DONE,
] as const;

/** 需求类型：训练类 */
export const COMPUTE_TYPE_TRAIN = 1;

/** 需求类型：推理类 */
export const COMPUTE_TYPE_INFER = 2;

/** 需求类型：分析类 */
export const COMPUTE_TYPE_ANALYSIS = 3;

/** 需求类型：渲染类 */
export const COMPUTE_TYPE_RENDER = 4;

/** 需求类型选项 */
export const COMPUTE_TYPE_OPTIONS = [
  COMPUTE_TYPE_TRAIN,
  COMPUTE_TYPE_INFER,
  COMPUTE_TYPE_ANALYSIS,
  COMPUTE_TYPE_RENDER,
] as const;

/** 状态筛选：空串表示全部 */
export type ComputeStatusFilter =
  | ''
  | `${typeof COMPUTE_STATUS_CONVERTED}`
  | `${typeof COMPUTE_STATUS_DONE}`
  | `${typeof COMPUTE_STATUS_DRAFT}`
  | `${typeof COMPUTE_STATUS_PENDING}`
  | `${typeof COMPUTE_STATUS_REJECTED}`
  | `${typeof COMPUTE_STATUS_RUNNING}`;

/** 时间范围筛选：[开始, 结束]；未选时为 null */
export type ComputeTimeRange = [string, string] | null;

/**
 * 解析状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态数字；全部时返回 undefined
 */
export function parseComputeStatusFilter(
  status?: ComputeStatusFilter | null,
): ComputeDemandStatus | undefined {
  if (isEmpty(status?.trim())) {
    return undefined;
  }
  const value = Number(status);
  if (
    value === COMPUTE_STATUS_DRAFT ||
    value === COMPUTE_STATUS_PENDING ||
    value === COMPUTE_STATUS_REJECTED ||
    value === COMPUTE_STATUS_CONVERTED ||
    value === COMPUTE_STATUS_RUNNING ||
    value === COMPUTE_STATUS_DONE
  ) {
    return value;
  }
  return undefined;
}

/**
 * 归一化需求列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeComputePage(data?: ComputeDemandListResult | null): {
  current: number;
  records: ComputeDemandItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || COMPUTE_PAGE_SIZE),
  };
}

/**
 * 解析需求 ID
 * @param row 列表行或详情
 * @returns 合法 ID；无效时 null
 */
export function resolveComputeDemandId(
  row?: ComputeDemandItem | null,
): null | number {
  const id = Number(row?.demandId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * 格式化时间展示
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatComputeDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 获取需求状态对应的 i18n 键后缀
 * @param status 需求状态
 * @returns draft / pending / rejected / converted / running / done / unknown
 */
export function getComputeStatusI18nKey(
  status?: null | number,
):
  | 'converted'
  | 'done'
  | 'draft'
  | 'pending'
  | 'rejected'
  | 'running'
  | 'unknown' {
  const value = Number(status);
  if (value === COMPUTE_STATUS_DRAFT) {
    return 'draft';
  }
  if (value === COMPUTE_STATUS_PENDING) {
    return 'pending';
  }
  if (value === COMPUTE_STATUS_REJECTED) {
    return 'rejected';
  }
  if (value === COMPUTE_STATUS_CONVERTED) {
    return 'converted';
  }
  if (value === COMPUTE_STATUS_RUNNING) {
    return 'running';
  }
  if (value === COMPUTE_STATUS_DONE) {
    return 'done';
  }
  return 'unknown';
}

/**
 * 获取需求状态对应的 Element Plus 标签类型
 * @param status 需求状态
 * @returns tag type
 */
export function getComputeStatusTagType(
  status?: null | number,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' {
  const value = Number(status);
  if (value === COMPUTE_STATUS_DONE) {
    return 'success';
  }
  if (value === COMPUTE_STATUS_REJECTED) {
    return 'danger';
  }
  if (value === COMPUTE_STATUS_PENDING || value === COMPUTE_STATUS_RUNNING) {
    return 'warning';
  }
  if (value === COMPUTE_STATUS_CONVERTED) {
    return 'primary';
  }
  return 'info';
}

/**
 * 获取需求类型对应的 i18n 键后缀
 * @param type 需求类型
 * @returns train / infer / analysis / render / unknown
 */
export function getComputeTypeI18nKey(
  type?: null | number,
): 'analysis' | 'infer' | 'render' | 'train' | 'unknown' {
  const value = Number(type);
  if (value === COMPUTE_TYPE_TRAIN) {
    return 'train';
  }
  if (value === COMPUTE_TYPE_INFER) {
    return 'infer';
  }
  if (value === COMPUTE_TYPE_ANALYSIS) {
    return 'analysis';
  }
  if (value === COMPUTE_TYPE_RENDER) {
    return 'render';
  }
  return 'unknown';
}

/**
 * 是否允许编辑（待提交 / 审核不通过）
 * @param status 需求状态
 * @returns 可编辑返回 true
 */
export function canEditComputeDemand(status?: null | number): boolean {
  const value = Number(status);
  return value === COMPUTE_STATUS_DRAFT || value === COMPUTE_STATUS_REJECTED;
}

/**
 * 是否允许删除（待提交 / 审核不通过）
 * @param status 需求状态
 * @returns 可删除返回 true
 */
export function canDeleteComputeDemand(status?: null | number): boolean {
  return canEditComputeDemand(status);
}

/**
 * 是否允许重新提交（审核不通过）
 * @param status 需求状态
 * @returns 可重新提交返回 true
 */
export function canResubmitComputeDemand(status?: null | number): boolean {
  return Number(status) === COMPUTE_STATUS_REJECTED;
}

/**
 * 是否已完成（可预览 / 下载结果）
 * @param status 需求状态
 * @returns 已完成返回 true
 */
export function isComputeDemandDone(status?: null | number): boolean {
  return Number(status) === COMPUTE_STATUS_DONE;
}

/**
 * 将导出 / 下载接口返参解析为可下载 URL
 * @param value 接口 data.fileUrl
 * @returns 可下载地址；无法识别时 undefined
 */
export function resolveComputeDownloadUrl(
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
  return undefined;
}

/**
 * 判断预览内容是否为可打开的链接
 * @param content 预览内容
 * @returns 是链接返回 true
 */
export function isComputePreviewUrl(content?: null | string): boolean {
  const text = content?.trim();
  if (!text) {
    return false;
  }
  return isHttpUrl(text) || text.startsWith('/');
}

/**
 * 归一化「我的应用」列表分页结果（关联应用选择器用）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeComputeAppPage(
  data?: MyAppListResult<MyAppItem> | null,
): {
  current: number;
  records: MyAppItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || COMPUTE_APP_PICKER_PAGE_SIZE),
  };
}

/**
 * 解析新建/编辑页路由中的需求 ID（兼容 id / demandId）
 * @param query 路由 query
 * @returns 合法 ID；无效时 null
 */
export function parseComputeCreateDemandId(query: {
  demandId?: unknown;
  id?: unknown;
}): null | number {
  const raw = query.id ?? query.demandId;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * 取应用展示名称
 * @param app 应用条目
 * @param empty 空值占位
 * @returns 名称或占位
 */
export function displayComputeAppName(
  app?: MyAppItem | null,
  empty = '',
): string {
  return app?.appName?.trim() || String(app?.appId ?? '') || empty;
}

/**
 * 取应用封面首字
 * @param app 应用条目
 * @returns 单个字符
 */
export function getComputeAppCoverLetter(app?: MyAppItem | null): string {
  const name = displayComputeAppName(app).trim();
  return name ? name.slice(0, 1) : 'A';
}
