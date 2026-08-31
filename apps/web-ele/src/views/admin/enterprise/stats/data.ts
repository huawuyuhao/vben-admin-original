import type {
  EnterpriseAlertStatItem,
  EnterpriseDeviceCountStatItem,
  EnterpriseOnlineTimeStatItem,
  EnterprisePowerUsageStatItem,
  EnterpriseStatOverview,
  EnterpriseStatType,
} from '#/types/admin/enterprise/stats';

import { isEmpty, isHttpUrl } from '@vben/utils';
import { $t } from '@vben/locales';

/** 折线长表数据点（供 VChart seriesField） */
export interface StatSeriesPoint {
  /** 横轴日期 */
  date: string;
  /** 系列名 */
  series: string;
  /** 数值 */
  value: number;
}

/** 告警等级饼图数据点 */
export interface AlertLevelPiePoint {
  /** 等级文案 */
  type: string;
  /** 数量 */
  value: number;
}

/**
 * 获取当前年份
 * @returns 四位年份
 */
export function getCurrentStatYear(): number {
  return new Date().getFullYear();
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位
 * @returns 展示文本
 */
export function displayStatValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 格式化小时数（保留 1 位小数）
 * @param value 小时
 * @returns 展示文本
 */
export function formatStatHours(value?: null | number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return $t('page.admin.enterprise.stats.valueEmpty');
  }
  return `${value.toFixed(1)}`;
}

/**
 * 格式化用电量（保留 1 位小数）
 * @param value kWh
 * @returns 展示文本
 */
export function formatStatPower(value?: null | number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return $t('page.admin.enterprise.stats.valueEmpty');
  }
  return `${value.toFixed(1)}`;
}

/**
 * 告警等级码转文案
 * @param level 等级 1-4
 * @returns 文案
 */
export function formatAlertLevelLabel(level: number | string): string {
  const map: Record<string, string> = {
    '1': $t('page.admin.enterprise.stats.alertLevel.minor'),
    '2': $t('page.admin.enterprise.stats.alertLevel.major'),
    '3': $t('page.admin.enterprise.stats.alertLevel.critical'),
    '4': $t('page.admin.enterprise.stats.alertLevel.urgent'),
  };
  return map[String(level)] ?? String(level);
}

/**
 * 设备数量序列转 VChart 长表
 * @param list 接口数据
 * @returns 长表数据
 */
export function buildDeviceCountSeries(
  list: EnterpriseDeviceCountStatItem[],
): StatSeriesPoint[] {
  const points: StatSeriesPoint[] = [];
  for (const item of list) {
    const date = String(item.date ?? '').trim();
    if (isEmpty(date)) continue;
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.deviceTotal'),
      value: Number(item.total) || 0,
    });
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.deviceNew'),
      value: Number(item.newCount) || 0,
    });
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.deviceOffline'),
      value: Number(item.offline) || 0,
    });
  }
  return points;
}

/**
 * 在线时间序列转 VChart 长表
 * @param list 接口数据
 * @returns 长表数据
 */
export function buildOnlineTimeSeries(
  list: EnterpriseOnlineTimeStatItem[],
): StatSeriesPoint[] {
  const points: StatSeriesPoint[] = [];
  for (const item of list) {
    const date = String(item.date ?? '').trim();
    if (isEmpty(date)) continue;
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.totalHours'),
      value: Number(item.totalHours) || 0,
    });
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.avgHours'),
      value: Number(item.avgHours) || 0,
    });
  }
  return points;
}

/**
 * 用电量序列转 VChart 长表
 * @param list 接口数据
 * @returns 长表数据
 */
export function buildPowerUsageSeries(
  list: EnterprisePowerUsageStatItem[],
): StatSeriesPoint[] {
  const points: StatSeriesPoint[] = [];
  for (const item of list) {
    const date = String(item.date ?? '').trim();
    if (isEmpty(date)) continue;
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.totalPower'),
      value: Number(item.totalPower) || 0,
    });
    points.push({
      date,
      series: $t('page.admin.enterprise.stats.series.avgPower'),
      value: Number(item.avgPower) || 0,
    });
  }
  return points;
}

/**
 * 告警总数序列
 * @param list 接口数据
 * @returns 柱状数据
 */
export function buildAlertTotalSeries(
  list: EnterpriseAlertStatItem[],
): Array<{ date: string; value: number }> {
  return list
    .map((item) => ({
      date: String(item.date ?? '').trim(),
      value: Number(item.totalAlert) || 0,
    }))
    .filter((item) => !isEmpty(item.date));
}

/**
 * 汇总告警等级分布为饼图数据
 * @param list 接口数据
 * @returns 饼图数据
 */
export function buildAlertLevelPie(
  list: EnterpriseAlertStatItem[],
): AlertLevelPiePoint[] {
  const bucket: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
  };
  for (const item of list) {
    const dist = item.levelDistribution ?? {};
    for (const [key, raw] of Object.entries(dist)) {
      const n = Number(raw) || 0;
      bucket[key] = (bucket[key] ?? 0) + n;
    }
  }
  return Object.entries(bucket)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      type: formatAlertLevelLabel(key),
      value,
    }));
}

/**
 * 概览指标卡片配置
 * @param overview 概览数据
 * @returns 卡片列表
 */
export function buildOverviewCards(overview: null | EnterpriseStatOverview) {
  return [
    {
      key: 'deviceCount' as const,
      label: $t('page.admin.enterprise.stats.overview.deviceCount'),
      value: displayStatValue(
        overview?.deviceCount,
        $t('page.admin.enterprise.stats.valueEmpty'),
      ),
      unit: $t('page.admin.enterprise.stats.units.device'),
      exportType: 'device-count' as EnterpriseStatType,
    },
    {
      key: 'onlineTime' as const,
      label: $t('page.admin.enterprise.stats.overview.onlineTime'),
      value: formatStatHours(overview?.onlineTime),
      unit: $t('page.admin.enterprise.stats.units.hour'),
      exportType: 'online-time' as EnterpriseStatType,
    },
    {
      key: 'powerUsage' as const,
      label: $t('page.admin.enterprise.stats.overview.powerUsage'),
      value: formatStatPower(overview?.powerUsage),
      unit: $t('page.admin.enterprise.stats.units.kwh'),
      exportType: 'power-usage' as EnterpriseStatType,
    },
    {
      key: 'alertCount' as const,
      label: $t('page.admin.enterprise.stats.overview.alertCount'),
      value: displayStatValue(
        overview?.alertCount,
        $t('page.admin.enterprise.stats.valueEmpty'),
      ),
      unit: $t('page.admin.enterprise.stats.units.alert'),
      exportType: 'alert' as EnterpriseStatType,
    },
  ];
}

/**
 * 导出类型选项
 * @returns 选项列表
 */
export function getStatExportTypeOptions() {
  return [
    {
      label: $t('page.admin.enterprise.stats.exportTypes.overview'),
      value: 'overview' as EnterpriseStatType,
    },
    {
      label: $t('page.admin.enterprise.stats.exportTypes.deviceCount'),
      value: 'device-count' as EnterpriseStatType,
    },
    {
      label: $t('page.admin.enterprise.stats.exportTypes.onlineTime'),
      value: 'online-time' as EnterpriseStatType,
    },
    {
      label: $t('page.admin.enterprise.stats.exportTypes.powerUsage'),
      value: 'power-usage' as EnterpriseStatType,
    },
    {
      label: $t('page.admin.enterprise.stats.exportTypes.alert'),
      value: 'alert' as EnterpriseStatType,
    },
  ];
}

/**
 * 解析导出下载 URL
 * @param value fileUrl
 * @returns 可下载地址
 */
export function resolveStatExportDownloadUrl(
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
