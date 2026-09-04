/**
 * 登录状态（0 成功 1 失败）
 */
export type LoginLogStatus = '0' | '1';

/**
 * 登录日志条目
 * GET /monitor/logininfor/list · records[]
 */
export interface LoginLogItem {
  /** 访问 ID */
  infoId?: number;
  /** 租户编号 */
  tenantId?: string;
  /** 用户账号 */
  userName?: string;
  /** 客户端 */
  clientKey?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 登录状态（0 成功 1 失败） */
  status?: LoginLogStatus | string;
  /** 登录 IP 地址 */
  ipaddr?: string;
  /** 登录地点 */
  loginLocation?: string;
  /** 浏览器类型 */
  browser?: string;
  /** 操作系统 */
  os?: string;
  /** 提示消息 */
  msg?: string;
  /** 访问时间 */
  loginTime?: string;
}

/**
 * 登录日志列表查询参数
 * GET /monitor/logininfor/list
 */
export interface LoginLogListParams {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 用户账号 */
  userName?: string;
  /** 登录 IP 地址 */
  ipaddr?: string;
  /** 登录地点 */
  loginLocation?: string;
  /** 登录状态（0 成功 1 失败） */
  status?: LoginLogStatus | string;
  /** 访问时间起（若依 params[beginTime]） */
  'params[beginTime]'?: string;
  /** 访问时间止（若依 params[endTime]） */
  'params[endTime]'?: string;
}

/**
 * 登录日志导出参数
 * POST /monitor/logininfor/export（query）
 */
export type LoginLogExportParams = Omit<
  LoginLogListParams,
  'page' | 'pageSize'
>;

/**
 * 登录日志分页结果
 */
export interface LoginLogListResult<T = LoginLogItem> {
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
 * 登录日志列表响应体（扁平分页 + code/msg，兼容 data 包裹）
 */
export interface LoginLogListResponseBody<T = LoginLogItem> {
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
 * 导出结果（data.fileUrl / data.fileName）
 */
export interface LoginLogExportResult {
  /** 下载地址 */
  fileUrl?: string;
  /** 文件名 */
  fileName?: string;
}

/**
 * 导出 / 写操作通用响应
 */
export interface LoginLogMutationResponse {
  code?: number;
  msg?: string;
  data?: LoginLogExportResult;
}
