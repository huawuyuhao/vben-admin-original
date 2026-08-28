import type { DeviceOptionItem } from '#/types/admin/device';
import type {
  SupplyDeviceItem,
  SupplyDeviceListResult,
  SupplyDeviceStatus,
} from '#/types/enterprise/supply';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';

/** 供给设备列表默认每页条数 */
export const SUPPLY_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const SUPPLY_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 未受理 */
export const SUPPLY_STATUS_PENDING = 0 as SupplyDeviceStatus;

/** 已查看 */
export const SUPPLY_STATUS_VIEWED = 1 as SupplyDeviceStatus;

/** 受理状态筛选：空串表示全部 */
export type SupplyStatusFilter =
  | ''
  | `${typeof SUPPLY_STATUS_PENDING}`
  | `${typeof SUPPLY_STATUS_VIEWED}`;

/** 预设设备类型关键字：GPU（用于判断是否展示 GPU 字段） */
export const SUPPLY_DEVICE_TYPE_GPU = 'gpu';

/**
 * 判断设备类型是否需要填写 GPU 字段
 * @param deviceType 设备类型
 * @returns 需要 GPU 信息返回 true
 */
export function isGpuDeviceType(deviceType?: null | string): boolean {
  const value = String(deviceType ?? '').trim().toLowerCase();
  if (!value) {
    return false;
  }
  return value.includes('gpu') || value === SUPPLY_DEVICE_TYPE_GPU;
}

/**
 * 格式化设备下拉展示文案：名称 + 型号 + 编号
 * @param item 设备选项
 * @returns 下拉 label
 */
export function formatDeviceOptionLabel(item: DeviceOptionItem): string {
  const name = item.deviceName?.trim() || '';
  const model = item.deviceModel?.trim() || '';
  const code = item.deviceCode?.trim() || '';
  const main = [name, model].filter(Boolean).join(' · ') || String(item.deviceId);
  return code ? `${main}（${code}）` : main;
}

/**
 * 解析受理状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态数字；全部时返回 undefined
 */
export function parseSupplyStatusFilter(
  status?: SupplyStatusFilter | null,
): SupplyDeviceStatus | undefined {
  if (status === String(SUPPLY_STATUS_PENDING)) {
    return SUPPLY_STATUS_PENDING;
  }
  if (status === String(SUPPLY_STATUS_VIEWED)) {
    return SUPPLY_STATUS_VIEWED;
  }
  return undefined;
}

/**
 * 归一化供给设备列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeSupplyPage(data?: null | SupplyDeviceListResult): {
  current: number;
  records: SupplyDeviceItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || SUPPLY_PAGE_SIZE),
  };
}

/**
 * 格式化提交时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatSupplyDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 获取受理状态对应的 i18n 键后缀
 * @param status 受理状态
 * @returns pending / viewed / unknown
 */
export function getSupplyStatusI18nKey(
  status?: null | number,
): 'pending' | 'unknown' | 'viewed' {
  const value = Number(status);
  if (value === SUPPLY_STATUS_PENDING) {
    return 'pending';
  }
  if (value === SUPPLY_STATUS_VIEWED) {
    return 'viewed';
  }
  return 'unknown';
}

/**
 * 获取受理状态对应的 Element Plus 标签类型
 * @param status 受理状态
 * @returns tag type
 */
export function getSupplyStatusTagType(
  status?: null | number,
): 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === SUPPLY_STATUS_VIEWED) {
    return 'success';
  }
  if (value === SUPPLY_STATUS_PENDING) {
    return 'warning';
  }
  return 'info';
}

/**
 * 将导出接口返参解析为可下载 URL
 * @param value 接口 data.fileUrl
 * @returns 可下载地址；无法识别时 undefined
 */
export function resolveSupplyExportDownloadUrl(
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
