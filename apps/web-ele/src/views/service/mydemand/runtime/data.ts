import type {
  RunningTaskCarbonPoint,
  RunningTaskDetail,
  RunningTaskHistoryDimension,
  RunningTaskHistoryPoint,
  RunningTaskItem,
  RunningTaskListResult,
  RunningTaskPowerPoint,
  RunningTaskResourcePoint,
} from '#/types/service/mydemand/runtime';

import { formatDate, isEmpty } from '@vben/utils';

/** 在运应用列表默认每页条数 */
export const RUNTIME_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const RUNTIME_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 运行状态：任务提交 */
export const RUNTIME_STATUS_SUBMITTED = 0;

/** 运行状态：资源准备中 */
export const RUNTIME_STATUS_PREPARING = 1;

/** 运行状态：任务运行中 */
export const RUNTIME_STATUS_RUNNING = 2;

/** 运行状态：任务完成 */
export const RUNTIME_STATUS_DONE = 3;

/** 详情步骤条步骤（与 runStatus 0-3 对齐） */
export const RUNTIME_STEP_KEYS = [
  'submitted',
  'preparing',
  'running',
  'done',
] as const;

/** 快捷时间范围：近 1 小时 */
export const RUNTIME_RANGE_1H = '1h';

/** 快捷时间范围：近 6 小时 */
export const RUNTIME_RANGE_6H = '6h';

/** 快捷时间范围：近 24 小时 */
export const RUNTIME_RANGE_24H = '24h';

/** 快捷时间范围键 */
export type RuntimeRangeKey =
  | typeof RUNTIME_RANGE_1H
  | typeof RUNTIME_RANGE_6H
  | typeof RUNTIME_RANGE_24H;

/** 图表时间范围：[开始, 结束]；未选时为 null */
export type RuntimeTimeRange = [string, string] | null;

/** 历史趋势维度选项 */
export const RUNTIME_HISTORY_DIMENSIONS: RunningTaskHistoryDimension[] = [
  'power',
  'carbon',
  'cpu',
  'gpu',
  'memory',
];

/** 折线图单点（统一 series 结构） */
export interface RuntimeChartPoint {
  /** 横轴时间文案 */
  time: string;
  /** 数值 */
  value: number;
  /** 图例系列名 */
  series: string;
}

/**
 * 归一化列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeRuntimePage(data?: null | RunningTaskListResult): {
  current: number;
  records: RunningTaskItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || RUNTIME_PAGE_SIZE),
  };
}

/**
 * 规范化任务 ID 字符串
 * @param value 原始值
 * @returns 非空 ID；无效时 null
 */
export function normalizeRunningTaskId(
  value?: null | number | string,
): null | string {
  if (value == null) {
    return null;
  }
  const text = String(value).trim();
  if (!text || text === '0' || text.toLowerCase() === 'null') {
    return null;
  }
  return text;
}

/**
 * 解析任务 ID（兼容 taskId / id；支持数字与业务编号字符串）
 * @param row 列表行或详情
 * @returns 合法 ID；无效时 null
 */
export function resolveRunningTaskId(
  row?: null | RunningTaskDetail | RunningTaskItem | { id?: number | string },
): null | string {
  const raw =
    (row as RunningTaskItem | undefined)?.taskId ??
    (row as undefined | { id?: number | string })?.id;
  return normalizeRunningTaskId(raw);
}

/**
 * 从路由参数解析任务 ID
 * @param value query / params 原始值
 * @returns 合法 ID；无效时 null
 */
export function parseRunningTaskIdParam(value?: unknown): null | string {
  if (Array.isArray(value)) {
    return parseRunningTaskIdParam(value[0]);
  }
  return normalizeRunningTaskId(
    value == null ? null : (value as number | string),
  );
}

/**
 * 将运行秒数格式化为 HH:mm:ss
 * @param seconds 秒数
 * @returns 时长文案；无效返回空串
 */
export function formatRuntimeDuration(seconds?: null | number): string {
  if (seconds == null || !Number.isFinite(Number(seconds))) {
    return '';
  }
  const total = Math.max(0, Math.floor(Number(seconds)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * 格式化完成百分比展示
 * @param percent 百分比
 * @returns 带 % 的文案；无效返回空串
 */
export function formatRuntimePercent(percent?: null | number): string {
  if (percent == null || !Number.isFinite(Number(percent))) {
    return '';
  }
  const value = Number(percent);
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${text}%`;
}

/**
 * 格式化指标数值（保留合理小数）
 * @param value 原始值
 * @param digits 小数位，默认 2
 * @returns 展示文案；无效返回空串
 */
export function formatRuntimeMetric(
  value?: null | number,
  digits = 2,
): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return '';
  }
  const num = Number(value);
  if (Number.isInteger(num)) {
    return String(num);
  }
  return num.toFixed(digits);
}

/**
 * 格式化采集时间展示
 * @param time 时间字符串
 * @returns 年月日时分秒；无效返回空串
 */
export function formatRuntimeDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 将运行状态归一为枚举码 0-3
 * @param status 接口状态（数字或 "0"|"1"|"2"|"3"）
 * @returns 状态码；无法识别返回 null
 */
export function normalizeRuntimeStatusCode(
  status?: null | number | string,
): null | number {
  if (status == null || status === '') {
    return null;
  }
  const value = Number(status);
  if (
    value === RUNTIME_STATUS_SUBMITTED ||
    value === RUNTIME_STATUS_PREPARING ||
    value === RUNTIME_STATUS_RUNNING ||
    value === RUNTIME_STATUS_DONE
  ) {
    return value;
  }
  return null;
}

/**
 * 获取运行状态对应的 Element Plus 标签类型（依据 runStatus）
 * @param status 运行状态
 * @returns tag type
 */
export function getRuntimeStatusTagType(
  status?: null | number | string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' {
  const code = normalizeRuntimeStatusCode(status);
  if (code === RUNTIME_STATUS_SUBMITTED) {
    return 'info';
  }
  if (code === RUNTIME_STATUS_PREPARING) {
    return 'primary';
  }
  if (code === RUNTIME_STATUS_RUNNING) {
    return 'warning';
  }
  if (code === RUNTIME_STATUS_DONE) {
    return 'success';
  }
  return 'info';
}

/**
 * 是否允许关闭任务（仅「任务运行中」）
 * @param status 运行状态
 * @returns 可关闭返回 true
 */
export function canCloseRunningTask(status?: null | number | string): boolean {
  return normalizeRuntimeStatusCode(status) === RUNTIME_STATUS_RUNNING;
}

/**
 * 列表 / 详情状态展示文案：优先 runStatusName
 * @param row 列表行或详情
 * @param fallback 空值占位
 * @returns 展示文案
 */
export function displayRuntimeStatusName(
  row?: null | { runStatusName?: string },
  fallback = '',
): string {
  const name = row?.runStatusName?.trim();
  return name || fallback;
}

/**
 * 详情步骤条当前激活下标（Element Plus Steps）
 * 已完成时推进到步骤总数，使四步均为 finish
 * @param status 运行状态
 * @returns active 下标
 */
export function getRuntimeStepsActive(
  status?: null | number | string,
): number {
  const code = normalizeRuntimeStatusCode(status);
  if (code == null) {
    return 0;
  }
  if (code === RUNTIME_STATUS_DONE) {
    return RUNTIME_STEP_KEYS.length;
  }
  return code;
}

/**
 * 根据快捷范围生成查询用起止时间
 * @param rangeKey 快捷键
 * @returns [startTime, endTime]
 */
export function buildRuntimeRangeByKey(
  rangeKey: RuntimeRangeKey,
): [string, string] {
  const end = new Date();
  const start = new Date(end.getTime());
  if (rangeKey === RUNTIME_RANGE_1H) {
    start.setHours(start.getHours() - 1);
  } else if (rangeKey === RUNTIME_RANGE_6H) {
    start.setHours(start.getHours() - 6);
  } else {
    start.setHours(start.getHours() - 24);
  }
  return [
    formatDate(start, 'YYYY-MM-DD HH:mm:ss'),
    formatDate(end, 'YYYY-MM-DD HH:mm:ss'),
  ];
}

/**
 * 缩短横轴时间展示
 * @param time 原始时间
 * @returns HH:mm 或原串
 */
function formatAxisTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  const full = formatDate(time!.trim(), 'HH:mm:ss');
  return full || time!.trim();
}

/**
 * 将电力实时数据转为双系列折线点
 * @param list 接口数据
 * @param powerLabel 电量系列名
 * @param priceLabel 电价系列名
 * @returns 图表点
 */
export function buildPowerChartSeries(
  list: RunningTaskPowerPoint[],
  powerLabel: string,
  priceLabel: string,
): RuntimeChartPoint[] {
  const points: RuntimeChartPoint[] = [];
  for (const item of list) {
    const time = formatAxisTime(item.collectTime);
    if (!time) {
      continue;
    }
    if (item.powerConsumption != null && Number.isFinite(item.powerConsumption)) {
      points.push({
        time,
        value: Number(item.powerConsumption),
        series: powerLabel,
      });
    }
    if (item.powerPrice != null && Number.isFinite(item.powerPrice)) {
      points.push({
        time,
        value: Number(item.powerPrice),
        series: priceLabel,
      });
    }
  }
  return points;
}

/**
 * 将碳排放数据转为折线点
 * @param list 接口数据
 * @param seriesLabel 系列名
 * @returns 图表点
 */
export function buildCarbonChartSeries(
  list: RunningTaskCarbonPoint[],
  seriesLabel: string,
): RuntimeChartPoint[] {
  return list
    .map((item) => {
      const time = formatAxisTime(item.time);
      const value = Number(item.carbonEmission);
      if (!time || !Number.isFinite(value)) {
        return null;
      }
      return { time, value, series: seriesLabel } as RuntimeChartPoint;
    })
    .filter((item): item is RuntimeChartPoint => item != null);
}

/**
 * 将资源监控数据转为多系列折线点
 * @param list 接口数据
 * @param labels 各指标系列名
 * @returns 图表点
 */
export function buildResourceChartSeries(
  list: RunningTaskResourcePoint[],
  labels: {
    cpu: string;
    disk: string;
    gpu: string;
    memory: string;
    network: string;
  },
): RuntimeChartPoint[] {
  const points: RuntimeChartPoint[] = [];
  for (const item of list) {
    const time = formatAxisTime(item.time);
    if (!time) {
      continue;
    }
    const pairs: Array<[keyof typeof labels, number | undefined]> = [
      ['cpu', item.cpuUsage],
      ['gpu', item.gpuUsage],
      ['memory', item.memoryUsage],
      ['disk', item.diskUsage],
      ['network', item.networkUsage],
    ];
    for (const [key, raw] of pairs) {
      if (raw == null || !Number.isFinite(Number(raw))) {
        continue;
      }
      points.push({ time, value: Number(raw), series: labels[key] });
    }
  }
  return points;
}

/**
 * 将历史趋势数据转为折线点
 * @param list 接口数据
 * @param seriesLabel 系列名
 * @returns 图表点
 */
export function buildHistoryChartSeries(
  list: RunningTaskHistoryPoint[],
  seriesLabel: string,
): RuntimeChartPoint[] {
  return list
    .map((item) => {
      const time = formatAxisTime(item.time);
      const value = Number(item.value);
      if (!time || !Number.isFinite(value)) {
        return null;
      }
      return { time, value, series: seriesLabel } as RuntimeChartPoint;
    })
    .filter((item): item is RuntimeChartPoint => item != null);
}
