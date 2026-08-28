import type {
  DeviceItem,
  DeviceListResult,
  DeviceOnlineStatus,
} from '#/types/admin/device';

import { formatDate, isEmpty } from '@vben/utils';

/** 设备列表默认每页条数 */
export const DEVICE_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const DEVICE_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 离线 */
export const DEVICE_ONLINE_OFFLINE = 0 as DeviceOnlineStatus;

/** 在线 */
export const DEVICE_ONLINE_ONLINE = 1 as DeviceOnlineStatus;

/** 在线状态筛选：空串表示全部 */
export type DeviceOnlineFilter =
  | ''
  | `${typeof DEVICE_ONLINE_OFFLINE}`
  | `${typeof DEVICE_ONLINE_ONLINE}`;

/** 存储类型选项 */
export const DEVICE_STORAGE_TYPES = ['SSD', 'HDD', 'NVMe'] as const;

/** 预设设备类型关键字：GPU（用于判断是否展示 GPU 字段） */
export const DEVICE_TYPE_GPU = 'gpu';

/**
 * 判断设备类型是否需要填写 GPU 字段
 * @param deviceType 设备类型
 * @returns 需要 GPU 信息返回 true
 */
export function isGpuDeviceType(deviceType?: null | string): boolean {
  const value = String(deviceType ?? '')
    .trim()
    .toLowerCase();
  if (!value) {
    return false;
  }
  return value.includes('gpu') || value === DEVICE_TYPE_GPU;
}

/**
 * 解析在线状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态数字；全部时返回 undefined
 */
export function parseDeviceOnlineFilter(
  status?: DeviceOnlineFilter | null,
): DeviceOnlineStatus | undefined {
  if (status === String(DEVICE_ONLINE_OFFLINE)) {
    return DEVICE_ONLINE_OFFLINE;
  }
  if (status === String(DEVICE_ONLINE_ONLINE)) {
    return DEVICE_ONLINE_ONLINE;
  }
  return undefined;
}

/**
 * 归一化设备列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeDevicePage(data?: null | DeviceListResult): {
  current: number;
  records: DeviceItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || DEVICE_PAGE_SIZE),
  };
}

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatDeviceDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 格式化日期（采购 / 保修）
 * @param time 日期字符串
 * @returns 年月日；无效返回空串
 */
export function formatDeviceDate(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD');
}

/**
 * 获取在线状态对应的 i18n 键后缀
 * @param status 在线状态
 * @returns online / offline / unknown
 */
export function getDeviceOnlineI18nKey(
  status?: null | number,
): 'offline' | 'online' | 'unknown' {
  const value = Number(status);
  if (value === DEVICE_ONLINE_ONLINE) {
    return 'online';
  }
  if (value === DEVICE_ONLINE_OFFLINE) {
    return 'offline';
  }
  return 'unknown';
}

/**
 * 获取在线状态对应的 Element Plus 标签类型
 * @param status 在线状态
 * @returns tag type
 */
export function getDeviceOnlineTagType(
  status?: null | number,
): 'danger' | 'info' | 'success' {
  const value = Number(status);
  if (value === DEVICE_ONLINE_ONLINE) {
    return 'success';
  }
  if (value === DEVICE_ONLINE_OFFLINE) {
    return 'danger';
  }
  return 'info';
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位文案
 * @returns 展示文本
 */
export function displayDeviceValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}
