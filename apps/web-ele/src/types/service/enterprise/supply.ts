/**
 * 供给设备受理状态（0-未受理 1-已查看）
 */
export type SupplyDeviceStatus = 0 | 1;

/**
 * 供给设备清单条目
 * GET /supply/device/list · supply_device
 */
export interface SupplyDeviceItem {
  /** 设备 ID */
  deviceId?: number;
  /** 企业 ID */
  enterpriseId?: number;
  /** 设备类型（服务器 / GPU 等） */
  deviceType?: string;
  /** 设备型号 */
  deviceModel?: string;
  /** GPU 厂商 */
  gpuVendor?: string;
  /** GPU 型号 */
  gpuModel?: string;
  /** 数量 */
  quantity?: number;
  /** 受理状态（0-未受理 1-已查看） */
  status?: number | SupplyDeviceStatus;
  /** 提交时间 */
  submitTime?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 更新者 */
  updateBy?: number;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 供给设备列表查询参数
 * GET /supply/device/list
 */
export interface SupplyDeviceListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 受理状态（可选，0-未受理 1-已查看） */
  status?: SupplyDeviceStatus;
}

/**
 * 提交供给设备清单参数
 * POST /supply/device（JSON body）
 */
export interface SupplyDeviceSubmitParams {
  /** 设备类型（服务器 / GPU 等） */
  deviceType: string;
  /** 设备型号 */
  deviceModel: string;
  /** GPU 厂商（可选） */
  gpuVendor?: string;
  /** GPU 型号（可选） */
  gpuModel?: string;
  /** 数量 */
  quantity: number;
}

/**
 * 导出设备清单参数
 * POST /supply/device/export（JSON body）
 */
export interface SupplyDeviceExportParams {
  /** 受理状态（可选） */
  status?: SupplyDeviceStatus;
}

/**
 * 导出设备清单结果
 * data.fileUrl / data.fileName
 */
export interface SupplyDeviceExportResult {
  /** 下载地址 */
  fileUrl?: string;
  /** 文件名 */
  fileName?: string;
}

/**
 * 供给设备列表分页结果
 * 文档返参为扁平结构：与 code/msg 同级的 records / total / current / size
 */
export interface SupplyDeviceListResult<T = SupplyDeviceItem> {
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
 * 供给设备列表响应体（扁平分页 + code/msg）
 */
export interface SupplyDeviceListResponseBody<T = SupplyDeviceItem> {
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
 * 写操作通用响应
 */
export interface SupplyDeviceMutationResponse {
  code?: number;
  msg?: string;
  data?: SupplyDeviceExportResult | { key?: number | string };
}
