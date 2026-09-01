/**
 * 应用状态（0-停用 1-启用）
 */
export type MyAppStatus = 0 | 1;

/**
 * 是否收藏（0-否 1-是）
 */
export type MyAppCollectFlag = 0 | 1;

/**
 * 应用启停操作
 * PUT /my-application/{id}/toggle · action
 */
export type MyAppToggleAction = 'disable' | 'enable';

/**
 * 应用收藏操作
 * PUT /my-application/{id}/collect · action
 */
export type MyAppCollectAction = 'collect' | 'uncollect';

/**
 * 我的应用条目
 * GET /my-application/list · my_application
 */
export interface MyAppItem {
  /** 应用 ID */
  appId?: number;
  /** 应用名称 */
  appName?: string;
  /** 应用版本 */
  appVersion?: string;
  /** 应用类型（整型字典） */
  appType?: number;
  /** 应用类型名称（列表直接渲染） */
  appTypeName?: string;
  /** 应用状态（0-停用 1-启用） */
  appStatus?: MyAppStatus | number;
  /** 是否收藏（0-否 1-是） */
  isCollect?: MyAppCollectFlag | number;
  /** 用户 ID */
  userId?: number;
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
 * 我的应用列表查询参数
 * GET /my-application/list
 */
export interface MyAppListParams {
  /** 页码（默认 1） */
  page: number;
  /** 每页条数（默认 10） */
  pageSize: number;
  /** 应用名称（可选，模糊搜索） */
  appName?: string;
  /** 应用类型（可选） */
  appType?: number;
  /** 应用状态（可选） */
  appStatus?: MyAppStatus;
  /** 是否收藏（可选） */
  isCollect?: MyAppCollectFlag;
}

/**
 * 新增 / 编辑我的应用参数
 * POST /my-application · PUT /my-application/{id}
 */
export interface MyAppWriteParams {
  /** 应用名称 */
  appName: string;
  /** 应用版本 */
  appVersion: string;
  /** 应用类型 */
  appType: number;
  /** 应用状态（0-停用 1-启用） */
  appStatus?: MyAppStatus | number;
  /** 是否收藏（0-否 1-是） */
  isCollect?: MyAppCollectFlag | number;
}

/**
 * 应用版本条目
 * GET /my-application/{id}/version · app_version
 */
export interface MyAppVersionItem {
  /** 版本 ID */
  versionId?: number;
  /** 应用 ID */
  appId?: number;
  /** 版本号 */
  versionNo?: string;
  /** 关联素材 ID（多个用逗号分隔） */
  materialIds?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 新增应用版本参数
 * POST /my-application/{id}/version
 */
export interface MyAppVersionWriteParams {
  /** 版本号 */
  versionNo: string;
  /** 关联素材 ID（多个用逗号分隔） */
  materialIds?: string;
}

/**
 * 创建定时任务参数
 * POST /my-application/schedule-task
 */
export interface MyAppScheduleTaskParams {
  /** 应用 ID */
  appId: number;
  /** Cron 表达式 */
  cronExpression: string;
  /** 状态（0-停用 1-启用） */
  status?: MyAppStatus | number;
}

/**
 * 应用素材条目
 * GET /my-application/material/list · app_material
 */
export interface MyAppMaterialItem {
  /** 素材 ID */
  materialId?: number;
  /** 素材名称 */
  materialName?: string;
  /** 素材描述 */
  description?: string;
  /** 素材附件 URL（列表返参，可能为 JSON 数组字符串） */
  attachmentUrl?: string;
  /** 素材附件 URL 列表（写接口 / 部分返参） */
  attachmentUrls?: string[];
  /** 素材状态（0-停用 1-启用） */
  status?: MyAppStatus | number;
  /** 应用 ID */
  appId?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 应用素材列表查询参数
 * GET /my-application/material/list
 */
export interface MyAppMaterialListParams {
  /** 页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 应用 ID */
  appId: number;
}

/**
 * 新增 / 编辑应用素材参数
 * POST /my-application/material · PUT /my-application/material/{id}
 */
export interface MyAppMaterialWriteParams {
  /** 素材名称 */
  materialName: string;
  /** 素材描述 */
  description?: string;
  /** 素材附件 URL 列表 */
  attachmentUrls?: string[];
  /** 素材状态（0-停用 1-启用） */
  status?: MyAppStatus | number;
  /** 应用 ID */
  appId: number;
}

/**
 * 分页列表结果
 */
export interface MyAppListResult<T = MyAppItem> {
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
 * 列表响应体（扁平分页 + code/msg，兼容 data 包裹）
 */
export interface MyAppListResponseBody<T = MyAppItem> {
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
 * 写操作 / 查询通用响应
 */
export interface MyAppMutationResponse<T = unknown> {
  code?: number;
  msg?: string;
  data?: T;
}

/**
 * 应用类型下拉选项
 * GET /app/type/options · data[]
 */
export interface AppTypeOptionItem {
  /** 应用类型 ID */
  typeId?: string;
  /** 类型名称 */
  typeName?: string;
  /** 类型编码（唯一标识） */
  typeCode?: string;
}

/**
 * 应用类型下拉查询参数
 * GET /app/type/options
 */
export interface AppTypeOptionsParams {
  /** 搜索关键词（可选，模糊匹配 typeName / typeCode） */
  keyword?: string;
}
