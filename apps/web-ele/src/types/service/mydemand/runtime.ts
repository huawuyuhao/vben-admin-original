/**
 * 在运应用列表查询参数
 * GET /task/running/list
 */
export interface RunningTaskListParams {
  /** 页码（默认 1） */
  page: number;
  /** 每页条数（默认 10） */
  pageSize: number;
}

/**
 * 运行状态枚举
 * 0-任务提交 1-资源准备中 2-任务运行中 3-任务完成
 * 列表接口为字符串 "0"|"1"|"2"|"3"，详情为数字
 */
export type RunningTaskStatus = 0 | 1 | 2 | 3;

/**
 * 在运应用列表条目
 * GET /task/running/list · records[]
 */
export interface RunningTaskItem {
  /** 兼容字段：部分接口可能返回 id */
  id?: number | string;
  /** 任务 ID（列表可能为 string） */
  taskId?: number | string;
  /** 任务名称 */
  taskName?: string;
  /** 运行状态码（列表多为字符串枚举） */
  runStatus?: number | string;
  /** 运行状态名称（列表展示文案） */
  runStatusName?: string;
  /** 运行时间（秒） */
  runTime?: number;
  /** 完成百分比 */
  completePercent?: number;
}

/**
 * 任务运行详情
 * GET /task/running/{id} · data
 */
export interface RunningTaskDetail {
  /** 任务名称 */
  taskName?: string;
  /** 运行状态名称 */
  runStatusName?: string;
  /** 运行状态码 */
  runStatus?: number | string;
  /** 任务 ID */
  taskId?: number | string;
  /** 运行时长（秒） */
  runTime?: number;
  /** 完成百分比 */
  completePercent?: number;
  /** 累计耗电量 */
  powerConsumption?: number;
  /** 累计碳排放量 */
  carbonEmission?: number;
  /** GPU 使用率 */
  gpuUsage?: number;
  /** CPU 使用率 */
  cpuUsage?: number;
  /** 内存使用率 */
  memoryUsage?: number;
  /** 监控数据采集时间 */
  collectTime?: string;
}

/**
 * 电力 / 碳排 / 资源 / 趋势 公共时间范围查询
 */
export interface RunningTaskSeriesParams {
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 电力实时数据点
 * GET /task/running/{id}/power-data · data[]
 */
export interface RunningTaskPowerPoint {
  /** 采集时间 */
  collectTime?: string;
  /** 实时电量消耗 */
  powerConsumption?: number;
  /** 实时电价 */
  powerPrice?: number;
}

/**
 * 碳排放实时数据点
 * GET /task/running/{id}/carbon-data · data[]
 */
export interface RunningTaskCarbonPoint {
  /** 采集时间 */
  time?: string;
  /** 碳排放量 */
  carbonEmission?: number;
}

/**
 * 资源监控数据点
 * GET /task/running/{id}/resource-data · data[]
 */
export interface RunningTaskResourcePoint {
  /** 采集时间 */
  time?: string;
  /** GPU 使用率(%) */
  gpuUsage?: number;
  /** CPU 使用率(%) */
  cpuUsage?: number;
  /** 内存使用率(%) */
  memoryUsage?: number;
  /** 磁盘使用率(%) */
  diskUsage?: number;
  /** 网络使用信息 */
  networkUsage?: number;
}

/**
 * 历史趋势维度
 * GET /task/running/{id}/history-trend · dimension
 */
export type RunningTaskHistoryDimension =
  | 'carbon'
  | 'cpu'
  | 'gpu'
  | 'memory'
  | 'power';

/**
 * 历史趋势查询参数
 */
export interface RunningTaskHistoryParams extends RunningTaskSeriesParams {
  /** 趋势维度，默认 power */
  dimension?: RunningTaskHistoryDimension | string;
}

/**
 * 历史趋势数据点
 * GET /task/running/{id}/history-trend · data[]
 */
export interface RunningTaskHistoryPoint {
  /** 采集时间 */
  time?: string;
  /** 采集值 */
  value?: number;
}

/**
 * 列表分页结果
 */
export interface RunningTaskListResult<T = RunningTaskItem> {
  /** 当前页列表 */
  records: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 列表响应体（扁平分页 + code/msg）
 */
export interface RunningTaskListResponseBody<T = RunningTaskItem> {
  code?: number;
  msg?: string;
  total?: number;
  records?: T[];
  current?: number;
  size?: number;
  data?:
    | T[]
    | {
        current?: number;
        records?: T[];
        size?: number;
        total?: number;
      };
}

/**
 * 详情 / 序列 / 写操作通用响应
 */
export interface RunningTaskMutationResponse<T = unknown> {
  code?: number;
  msg?: string;
  data?: T;
}
