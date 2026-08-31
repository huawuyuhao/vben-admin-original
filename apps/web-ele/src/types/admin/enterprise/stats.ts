/**
 * 统计筛选公共参数（年 / 月）
 */
export interface EnterpriseStatPeriodParams {
  /** 年（可选） */
  year?: number;
  /** 月 1-12（可选） */
  month?: number;
}

/**
 * 告警统计筛选（支持日）
 */
export interface EnterpriseStatAlertParams extends EnterpriseStatPeriodParams {
  /** 日 1-31（可选） */
  day?: number;
}

/**
 * 导出统计数据参数
 * POST /enterprise/stat/export
 */
export interface EnterpriseStatExportParams extends EnterpriseStatPeriodParams {
  /**
   * 统计类型（必填，query）
   * 官方枚举：overview | device-count | online-time | power-usage | alert
   */
  statType: EnterpriseStatType;
}

/**
 * 可导出的统计类型（与 OpenAPI statType enum 对齐）
 * overview | device-count | online-time | power-usage | alert
 */
export type EnterpriseStatType =
  | 'alert'
  | 'device-count'
  | 'online-time'
  | 'overview'
  | 'power-usage';

/** 导出 statType 合法取值列表 */
export const ENTERPRISE_STAT_TYPES: readonly EnterpriseStatType[] = [
  'overview',
  'device-count',
  'online-time',
  'power-usage',
  'alert',
] as const;

/**
 * 服务数据统计概览
 * GET /enterprise/stat/overview → data
 */
export interface EnterpriseStatOverview {
  /** 设备数量汇总 */
  deviceCount?: number;
  /** 在线时间汇总（小时） */
  onlineTime?: number;
  /** 用电量汇总（kWh） */
  powerUsage?: number;
  /** 告警数量汇总 */
  alertCount?: number;
}

/**
 * 供给设备数量统计点
 * GET /enterprise/stat/device-count → data[]
 */
export interface EnterpriseDeviceCountStatItem {
  /** 统计日期 */
  date?: string;
  /** 当日设备总数 */
  total?: number;
  /** 当日新增设备数 */
  newCount?: number;
  /** 当日离线设备数 */
  offline?: number;
}

/**
 * 设备在线时间统计点
 * GET /enterprise/stat/online-time → data[]
 */
export interface EnterpriseOnlineTimeStatItem {
  /** 统计日期 */
  date?: string;
  /** 当日在线总时长（小时） */
  totalHours?: number;
  /** 单设备平均在线时长（小时） */
  avgHours?: number;
  /** 在线率（0-1） */
  onlineRate?: number;
}

/**
 * 设备用电量统计点
 * GET /enterprise/stat/power-usage → data[]
 */
export interface EnterprisePowerUsageStatItem {
  /** 统计日期 */
  date?: string;
  /** 当日总用电量（kWh） */
  totalPower?: number;
  /** 单设备平均用电量（kWh） */
  avgPower?: number;
  /** 同比比率（整数百分比） */
  yoyRatio?: number;
  /** 环比比率（整数百分比） */
  momRatio?: number;
}

/**
 * 告警等级分布（key 为等级 1-4）
 * 1-次要 2-重要 3-严重 4-紧急
 */
export type EnterpriseAlertLevelDistribution = Record<string, number>;

/**
 * 设备告警统计点
 * GET /enterprise/stat/alert → data[]
 */
export interface EnterpriseAlertStatItem {
  /** 统计日期 */
  date?: string;
  /** 当日告警总数 */
  totalAlert?: number;
  /** 告警等级分布 */
  levelDistribution?: EnterpriseAlertLevelDistribution;
  /** 处理率（百分比整数，如 85） */
  handleRate?: number;
}

/**
 * 导出结果
 */
export interface EnterpriseStatExportResult {
  /** 下载地址 */
  fileUrl?: string;
  /** 文件名 */
  fileName?: string;
}

/**
 * 写操作 / 导出通用响应体
 */
export interface EnterpriseStatMutationResponse {
  code?: number;
  msg?: string;
  data?: null | EnterpriseStatExportResult | string;
}
