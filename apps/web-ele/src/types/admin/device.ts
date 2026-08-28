/**
 * 设备类型列表响应体
 * GET /device/type/list
 */
export interface DeviceTypeListResponseBody {
  code?: number;
  msg?: string;
  /** 设备类型字符串列表 */
  data?: string[];
}

/**
 * 设备下拉选项
 * GET /device/options
 */
export interface DeviceOptionItem {
  /** 设备 ID（下拉 value） */
  deviceId: number;
  /** 设备编号 */
  deviceCode?: string;
  /** 设备名称（下拉 label） */
  deviceName?: string;
  /** 设备型号（label 附加信息） */
  deviceModel?: string;
}

/**
 * 设备下拉选项查询参数
 * GET /device/options
 */
export interface DeviceOptionsParams {
  /** 设备类型（可选，传入时只返回该类型） */
  deviceType?: string;
}

/** 在线状态（0-离线 1-在线） */
export type DeviceOnlineStatus = 0 | 1;

/**
 * 设备条目
 * GET /device/list · GET /device/{id} · supply_device
 */
export interface DeviceItem {
  /** 设备 ID */
  deviceId?: number;
  /** 企业 ID */
  enterpriseId?: number;
  /** 设备类型（服务器 / GPU 等） */
  deviceType?: string;
  /** 设备型号 */
  deviceModel?: string;
  /** 设备编号（企业内唯一） */
  deviceCode?: string;
  /** 设备名称 */
  deviceName?: string;
  /** GPU 厂商 */
  gpuVendor?: string;
  /** GPU 型号 */
  gpuModel?: string;
  /** CPU 型号 */
  cpuModel?: string;
  /** CPU 核数 */
  cpuCores?: number;
  /** 内存大小(GB) */
  memorySize?: number;
  /** 存储大小(GB) */
  storageSize?: number;
  /** 存储类型（SSD/HDD/NVMe） */
  storageType?: string;
  /** 机房位置 */
  location?: string;
  /** 机柜号 */
  rackNumber?: string;
  /** 机位 */
  position?: string;
  /** 在线状态（0-离线 1-在线） */
  onlineStatus?: DeviceOnlineStatus | number;
  /** 采购日期 */
  purchaseDate?: string;
  /** 保修到期日 */
  warrantyExpiry?: string;
  /** 备注 */
  remark?: string;
  /** 数量 */
  quantity?: number;
  /** 受理状态（0-未受理 1-已查看） */
  status?: number;
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
 * 设备列表查询参数
 * GET /device/list
 */
export interface DeviceListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 设备编号（可选，模糊搜索） */
  deviceCode?: string;
  /** 设备名称（可选，模糊搜索） */
  deviceName?: string;
  /** 设备类型（可选） */
  deviceType?: string;
  /** 在线状态（可选，0-离线 1-在线） */
  onlineStatus?: DeviceOnlineStatus;
}

/**
 * 新增 / 修改设备参数
 * POST /device · PUT /device/{id}（JSON body）
 */
export interface DeviceWriteParams {
  /** 设备编号（企业内唯一） */
  deviceCode: string;
  /** 设备名称 */
  deviceName: string;
  /** 设备类型 */
  deviceType: string;
  /** 设备型号 */
  deviceModel: string;
  /** GPU 厂商（可选） */
  gpuVendor?: string;
  /** GPU 型号（可选） */
  gpuModel?: string;
  /** CPU 型号（可选） */
  cpuModel?: string;
  /** CPU 核数（可选） */
  cpuCores?: number;
  /** 内存大小 GB（可选） */
  memorySize?: number | string;
  /** 存储大小 GB（可选） */
  storageSize?: number | string;
  /** 存储类型（可选，SSD/HDD/NVMe） */
  storageType?: string;
  /** 机房位置（可选） */
  location?: string;
  /** 机柜号（可选） */
  rackNumber?: string;
  /** 机位（可选） */
  position?: string;
  /** 在线状态（可选，仅修改；0-离线 1-在线） */
  onlineStatus?: DeviceOnlineStatus;
  /** 采购日期（可选，yyyy-MM-dd） */
  purchaseDate?: string;
  /** 保修到期日（可选，yyyy-MM-dd） */
  warrantyExpiry?: string;
  /** 备注（可选） */
  remark?: string;
}

/**
 * 设备列表分页结果
 */
export interface DeviceListResult<T = DeviceItem> {
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
 * 设备列表响应体（扁平分页 + code/msg，兼容 data 包裹）
 */
export interface DeviceListResponseBody<T = DeviceItem> {
  code?: number;
  msg?: string;
  total?: number;
  records?: T[];
  current?: number;
  size?: number;
  data?:
    | T[]
    | {
        records?: T[];
        total?: number;
        current?: number;
        size?: number;
      };
}

/**
 * 设备详情 / 写操作通用响应
 */
export interface DeviceMutationResponse {
  code?: number;
  msg?: string;
  data?:
    | string
    | DeviceItem
    | {
        key?: number;
        deviceId?: number;
      };
}

/**
 * 设备详情响应体
 * GET /device/{id}
 */
export interface DeviceDetailResponseBody {
  code?: number;
  msg?: string;
  data?: DeviceItem;
}
