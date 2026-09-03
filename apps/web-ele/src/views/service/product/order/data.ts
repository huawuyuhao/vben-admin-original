import type { DemandDiskPayload } from '#/types/service/product/order';

/** 下单向导步骤：0 基础 / 1 镜像网络 / 2 高级 / 3 确认 */
export type OrderStepIndex = 0 | 1 | 2 | 3;

/** 规格列表每页条数 */
export const SPEC_PAGE_SIZE = 10;

/** 模型市场每页条数 */
export const MODEL_PAGE_SIZE = 8;

/** 磁盘用途：系统盘 */
export const DISK_USAGE_SYSTEM = 1;

/** 磁盘用途：数据盘 */
export const DISK_USAGE_DATA = 2;

/** 关联应用来源：模型市场 */
export const APP_SOURCE_MODEL_MARKET = 2;

/** 数据盘数量上限 */
export const MAX_DATA_DISKS = 20;

/** 默认带宽（Mbps） */
export const DEFAULT_BANDWIDTH = 5;

/** 带宽范围 */
export const BANDWIDTH_MIN = 1;
export const BANDWIDTH_MAX = 200;

/** 磁盘类型选项（与接口说明对齐） */
export const DISK_TYPE_OPTIONS = [
  '通用型SSD',
  '增强型SSD',
  '高性能云硬盘',
  'SSD',
] as const;

/** 默认系统盘 */
export const DEFAULT_SYSTEM_DISK: DemandDiskPayload = {
  diskUsage: DISK_USAGE_SYSTEM,
  diskType: '高性能云硬盘',
  capacityGb: 50,
  quantity: 1,
};

/**
 * 解析路由中的正整数 ID
 * @param raw 路由 query / param 原始值
 * @returns 有效正整数，否则 null
 */
export function parsePositiveId(raw: unknown): null | number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return Math.trunc(num);
}

/**
 * 格式化金额展示
 * @param value 数值
 * @param digits 小数位
 * @returns 字符串，空值返回 —
 */
export function formatFee(value?: null | number, digits = 2): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return '—';
  }
  return Number(value).toFixed(digits);
}
