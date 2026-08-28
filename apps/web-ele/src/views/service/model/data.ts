import type { ModelInfo, ModelListResult } from '#/types/service/model';

import { downloadFileFromBlobPart, formatDate, isEmpty } from '@vben/utils';

/** 模型列表默认每页条数（3 列 × 2 行） */
export const MODEL_PAGE_SIZE = 6;

/** 可选每页条数（供 el-pagination） */
export const MODEL_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 模型对比最多可选数量 */
export const MODEL_COMPARE_MAX = 5;

/** 评价列表默认每页条数 */
export const MODEL_EVAL_PAGE_SIZE = 6;

/** 评价列表可选每页条数 */
export const MODEL_EVAL_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 启用状态 */
export const MODEL_STATUS_ENABLED = 1;

/**
 * 过滤含名称的模型条目（列表接口已返回启用数据，此处做兜底）
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeModelList(list?: null | ModelInfo[]): ModelInfo[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.modelName?.trim()));
}

/**
 * 归一化模型列表分页结果（供页面绑定）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeModelPage(data?: null | ModelListResult): {
  current: number;
  records: ModelInfo[];
  size: number;
  total: number;
} {
  return {
    records: normalizeModelList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || MODEL_PAGE_SIZE),
  };
}

/**
 * 是否有模型图标
 * @param iconUrl 图标地址
 * @returns 有图返回 true
 */
export function hasModelIcon(iconUrl?: string): boolean {
  return !isEmpty(iconUrl?.trim());
}

/**
 * 判断当前用户是否可对该模型评价（依接口 canEvaluate）
 * @param item 模型信息（或仅含 canEvaluate 的片段）
 * @returns 可评价返回 true
 */
export function canEvaluateModel(
  item?: null | Pick<ModelInfo, 'canEvaluate'>,
): boolean {
  return item?.canEvaluate === true;
}

/**
 * 格式化评分展示
 * @param score 评分
 * @returns 如 4.5；无效返回空串
 */
export function formatModelScore(score?: number): string {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return '';
  }
  const num = Number(score);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

/**
 * 格式化调用量展示
 * @param count 调用量
 * @returns 本地化数字；无效返回空串
 */
export function formatModelCallCount(count?: number): string {
  if (count === null || count === undefined || Number.isNaN(Number(count))) {
    return '';
  }
  return Number(count).toLocaleString('zh-CN');
}

/**
 * 格式化模型时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatModelDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 解析路由中的模型 ID
 * @param raw 路由 params.id
 * @returns 合法正整数；否则 NaN
 */
export function parseModelRouteId(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isFinite(id) && Number.isInteger(id) && id > 0
    ? id
    : Number.NaN;
}

/**
 * 解析模型 paramsJson 为键值对象
 * @param paramsJson JSON 字符串
 * @returns 扁平键值表；解析失败返回空对象
 */
export function parseModelParamsJson(
  paramsJson?: string,
): Record<string, unknown> {
  if (isEmpty(paramsJson?.trim())) {
    return {};
  }
  try {
    const parsed = JSON.parse(paramsJson!.trim()) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * 将参数值格式化为可读文案
 * @param value 任意值
 * @returns 展示字符串
 */
export function formatModelParamValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * CSV 单元格转义（含逗号 / 引号 / 换行时包双引号）
 * @param value 原始单元格
 * @returns 转义后文本
 */
function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/**
 * 导出模型信息 CSV 模板（前端实现，无需后端接口）
 * 使用 @vben/utils 的 downloadFileFromBlobPart；UTF-8 BOM 便于 Excel 打开中文
 * @param models 待导出模型列表
 * @param fileName 下载文件名（默认带日期）
 */
export function exportModelInfoTemplate(
  models: ModelInfo[],
  fileName?: string,
): void {
  const headers = [
    'modelId',
    'modelName',
    'iconUrl',
    'description',
    'score',
    'callCount',
    'paramsJson',
    'status',
  ];

  const rows = models.map((item) =>
    [
      item.modelId ?? '',
      item.modelName ?? '',
      item.iconUrl ?? '',
      item.description ?? '',
      item.score ?? '',
      item.callCount ?? '',
      item.paramsJson ?? '',
      item.status ?? '',
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(','),
  );

  const csv = `\uFEFF${[headers.join(','), ...rows].join('\r\n')}`;
  const name =
    fileName ||
    `model-info-template-${formatDate(new Date(), 'YYYYMMDD-HHmmss')}.csv`;

  downloadFileFromBlobPart({
    fileName: name,
    source: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
  });
}
