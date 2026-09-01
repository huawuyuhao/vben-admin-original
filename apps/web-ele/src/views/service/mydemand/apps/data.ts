import type {
  AppTypeOptionItem,
  MyAppCollectFlag,
  MyAppItem,
  MyAppListResult,
  MyAppMaterialItem,
  MyAppStatus,
} from '#/types/service/mydemand/apps';

import { formatDate, isEmpty } from '@vben/utils';

/** 我的应用列表默认每页条数（卡片 3×3） */
export const APP_PAGE_SIZE = 9;

/** 可选每页条数（供 el-pagination） */
export const APP_PAGE_SIZE_OPTIONS = [9, 18, 36];

/** 素材列表默认每页条数 */
export const MATERIAL_PAGE_SIZE = 10;

/** 素材可选每页条数 */
export const MATERIAL_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 应用 / 素材停用 */
export const APP_STATUS_OFF = 0 as MyAppStatus;

/** 应用 / 素材启用 */
export const APP_STATUS_ON = 1 as MyAppStatus;

/** 未收藏 */
export const APP_COLLECT_NO = 0 as MyAppCollectFlag;

/** 已收藏 */
export const APP_COLLECT_YES = 1 as MyAppCollectFlag;

/** 状态筛选：空串表示全部 */
export type AppStatusFilter =
  | ''
  | `${typeof APP_STATUS_OFF}`
  | `${typeof APP_STATUS_ON}`;

/** 收藏筛选：空串表示全部 */
export type AppCollectFilter =
  | ''
  | `${typeof APP_COLLECT_NO}`
  | `${typeof APP_COLLECT_YES}`;

/** 应用类型筛选：空串表示全部 */
export type AppTypeFilter = '' | `${number}`;

/**
 * 素材附件允许的扩展名（文档 + 图片 + PDF）
 */
export const MATERIAL_ALLOWED_EXTENSIONS = [
  'doc',
  'docx',
  'pdf',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
] as const;

/** el-upload accept 属性 */
export const MATERIAL_UPLOAD_ACCEPT = MATERIAL_ALLOWED_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(',');

/** 单文件大小上限（MB） */
export const MATERIAL_MAX_FILE_SIZE_MB = 50;

/** 单素材最多附件数 */
export const MATERIAL_MAX_FILE_COUNT = 5;

/**
 * 解析状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态；全部时返回 undefined
 */
export function parseAppStatusFilter(
  status?: AppStatusFilter | null,
): MyAppStatus | undefined {
  if (status === String(APP_STATUS_OFF)) {
    return APP_STATUS_OFF;
  }
  if (status === String(APP_STATUS_ON)) {
    return APP_STATUS_ON;
  }
  return undefined;
}

/**
 * 解析收藏筛选值为接口参数
 * @param flag 筛选值
 * @returns 合法收藏标记；全部时返回 undefined
 */
export function parseAppCollectFilter(
  flag?: AppCollectFilter | null,
): MyAppCollectFlag | undefined {
  if (flag === String(APP_COLLECT_NO)) {
    return APP_COLLECT_NO;
  }
  if (flag === String(APP_COLLECT_YES)) {
    return APP_COLLECT_YES;
  }
  return undefined;
}

/**
 * 解析应用类型筛选值为接口参数
 * @param type 筛选值
 * @returns 合法类型数字；全部时返回 undefined
 */
export function parseAppTypeFilter(
  type?: AppTypeFilter | null,
): number | undefined {
  if (isEmpty(type?.trim())) {
    return undefined;
  }
  const value = Number(type);
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

/**
 * 归一化应用列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeAppPage(data?: MyAppListResult | null): {
  current: number;
  records: MyAppItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || APP_PAGE_SIZE),
  };
}

/**
 * 归一化素材列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeMaterialPage(
  data?: MyAppListResult<MyAppMaterialItem> | null,
): {
  current: number;
  records: MyAppMaterialItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || MATERIAL_PAGE_SIZE),
  };
}

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatAppDateTime(time?: string): string {
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
export function displayAppValue(
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
 * 从类型选项解析可写入接口的 appType 数值
 * 优先 typeId，其次 typeCode（Mock 中 typeId 可能为 type001 等非数字）
 * @param item 类型选项
 * @returns 合法数字；无效返回 undefined
 */
export function resolveAppTypeOptionValue(item?: {
  typeCode?: null | string;
  typeId?: null | number | string;
} | null): number | undefined {
  if (!item) {
    return undefined;
  }
  return resolveAppTypeId(item.typeId) ?? resolveAppTypeId(item.typeCode);
}

/**
 * 将类型 ID / 编码转为数字（无法转换时返回 undefined）
 * @param typeId 选项 typeId 或 typeCode
 * @returns 合法数字；无效返回 undefined
 */
export function resolveAppTypeId(typeId?: null | number | string): number | undefined {
  const id = Number(typeId);
  if (!Number.isFinite(id)) {
    return undefined;
  }
  return id;
}

/**
 * 根据列表行的 appType / appTypeName，在类型选项中匹配下拉应选中的 value
 * 优先按类型名称匹配，再按 typeId / typeCode / 数值匹配
 * @param row 列表行（含 appType、appTypeName）
 * @param options 应用类型下拉选项
 * @returns 与选项 value 一致的数字；无法匹配时回退列表 appType
 */
export function matchAppTypeSelectValue(
  row?: null | Pick<MyAppItem, 'appType' | 'appTypeName'>,
  options?: AppTypeOptionItem[] | null,
): number | undefined {
  const list = Array.isArray(options) ? options : [];
  const typeName = row?.appTypeName?.trim();
  const appType = resolveAppTypeId(row?.appType);

  if (typeName) {
    const byName = list.find((item) => item.typeName?.trim() === typeName);
    const value = resolveAppTypeOptionValue(byName);
    if (value != null) {
      return value;
    }
  }

  if (appType != null) {
    const byValue = list.find((item) => {
      if (resolveAppTypeOptionValue(item) === appType) {
        return true;
      }
      const idText = String(item.typeId ?? '').trim();
      const codeText = String(item.typeCode ?? '').trim();
      return idText === String(appType) || codeText === String(appType);
    });
    const value = resolveAppTypeOptionValue(byValue);
    if (value != null) {
      return value;
    }
    return appType;
  }

  return undefined;
}

/**
 * 获取状态对应的 i18n 键后缀
 * @param status 状态
 * @returns on / off / unknown
 */
export function getAppStatusI18nKey(
  status?: null | number,
): 'off' | 'on' | 'unknown' {
  const value = Number(status);
  if (value === APP_STATUS_ON) {
    return 'on';
  }
  if (value === APP_STATUS_OFF) {
    return 'off';
  }
  return 'unknown';
}

/**
 * 获取状态对应的 Element Plus 标签类型
 * @param status 状态
 * @returns tag type
 */
export function getAppStatusTagType(
  status?: null | number,
): 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === APP_STATUS_ON) {
    return 'success';
  }
  if (value === APP_STATUS_OFF) {
    return 'info';
  }
  return 'warning';
}

/**
 * 判断应用 / 素材是否已启用
 * @param status 状态
 * @returns 已启用返回 true
 */
export function isAppEnabled(status?: null | number): boolean {
  return Number(status) === APP_STATUS_ON;
}

/**
 * 判断应用是否已收藏
 * @param flag 收藏标记
 * @returns 已收藏返回 true
 */
export function isAppCollected(flag?: null | number): boolean {
  return Number(flag) === APP_COLLECT_YES;
}

/**
 * 从列表行解析应用 ID
 * @param item 列表行
 * @returns 合法 ID；无效返回 undefined
 */
export function resolveMyAppId(
  item?: null | Pick<MyAppItem, 'appId'>,
): number | undefined {
  const id = Number(item?.appId);
  if (!Number.isFinite(id) || id <= 0) {
    return undefined;
  }
  return id;
}

/**
 * 从列表行解析素材 ID
 * @param item 列表行
 * @returns 合法 ID；无效返回 undefined
 */
export function resolveMaterialId(
  item?: null | Pick<MyAppMaterialItem, 'materialId'>,
): number | undefined {
  const id = Number(item?.materialId);
  if (!Number.isFinite(id) || id <= 0) {
    return undefined;
  }
  return id;
}

/**
 * 解析素材附件 URL 列表
 * 兼容 attachmentUrls 数组、attachmentUrl JSON 数组、逗号分隔字符串、单 URL
 * @param item 素材条目
 * @returns URL 数组
 */
export function parseMaterialAttachmentUrls(
  item?: null | MyAppMaterialItem,
): string[] {
  if (!item) {
    return [];
  }

  if (Array.isArray(item.attachmentUrls) && item.attachmentUrls.length > 0) {
    return item.attachmentUrls
      .map((url) => String(url ?? '').trim())
      .filter(Boolean);
  }

  const raw = String(item.attachmentUrl ?? '').trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((url) => String(url ?? '').trim()).filter(Boolean);
      }
    } catch {
      // 非合法 JSON 时继续按逗号 / 单 URL 解析
    }
  }

  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [raw];
}

/**
 * 从附件 URL 提取展示用文件名
 * @param url 附件地址
 * @returns 文件名
 */
export function getMaterialFileName(url?: string): string {
  const text = String(url ?? '').trim();
  if (!text) {
    return '';
  }
  try {
    const path = text.split('?')[0] || text;
    const name = path.split('/').pop() || path;
    return decodeURIComponent(name);
  } catch {
    return text;
  }
}

/**
 * 判断附件是否为可预览图片
 * @param url 附件地址
 * @returns 图片返回 true
 */
export function isMaterialImageUrl(url?: string): boolean {
  const name = getMaterialFileName(url).toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp)$/.test(name);
}

/**
 * 判断附件是否为 PDF
 * @param url 附件地址
 * @returns PDF 返回 true
 */
export function isMaterialPdfUrl(url?: string): boolean {
  const name = getMaterialFileName(url).toLowerCase();
  return name.endsWith('.pdf');
}

/**
 * 校验文件是否为允许的素材格式
 * @param file 待上传文件
 * @returns 合法返回 true
 */
export function isAllowedMaterialFile(file: File): boolean {
  const name = String(file.name || '').toLowerCase();
  const idx = name.lastIndexOf('.');
  if (idx < 0) {
    return false;
  }
  const ext = name.slice(idx + 1);
  return (MATERIAL_ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * 将素材 ID 数组转为接口要求的逗号分隔字符串
 * @param ids 素材 ID 列表
 * @returns 逗号分隔字符串；空则返回 undefined
 */
export function joinMaterialIds(ids?: Array<number | string>): string | undefined {
  if (!Array.isArray(ids) || ids.length === 0) {
    return undefined;
  }
  const text = ids
    .map((id) => String(id).trim())
    .filter(Boolean)
    .join(',');
  return text || undefined;
}

/**
 * 将逗号分隔的素材 ID 字符串拆为数字数组
 * @param raw 原始字符串
 * @returns 数字 ID 列表
 */
export function splitMaterialIds(raw?: string): number[] {
  if (isEmpty(raw?.trim())) {
    return [];
  }
  return raw!
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}
