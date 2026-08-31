/**
 * 子账号状态（0-停用 1-启用）
 */
export type SubAccountStatus = 0 | 1;

/**
 * 企业子账号条目
 * GET /enterprise/sub-account/list → records[]
 */
export interface SubAccountItem {
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: number;
  /** 更新时间 */
  updateTime?: string;
  /** 租户编号 */
  tenantId?: string;
  /** 子账号 ID */
  subAccountId?: number;
  /** 企业 ID */
  enterpriseId?: number;
  /** 用户名 */
  username?: string;
  /** 密码（加密存储，列表一般不回传明文） */
  password?: string;
  /** 真实姓名 */
  realName?: string;
  /** 所属部门 */
  department?: string;
  /** 联系电话 */
  phone?: string;
  /** 状态（0-停用 1-启用） */
  status?: SubAccountStatus | number;
  /** 有效期（yyyy-MM-dd） */
  expireDate?: string;
}

/**
 * 子账号列表查询参数
 * GET /enterprise/sub-account/list
 */
export interface SubAccountListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 用户名（可选，模糊搜索） */
  username?: string;
  /** 部门（可选） */
  department?: string;
  /** 状态（可选，0-停用 1-启用） */
  status?: SubAccountStatus;
}

/**
 * 新增子账号参数
 * POST /enterprise/sub-account（query）
 */
export interface SubAccountCreateParams {
  /** 用户名 */
  username: string;
  /** 真实姓名 */
  realName: string;
  /** 密码 */
  password: string;
  /** 部门（可选） */
  department?: string;
  /** 联系电话（可选） */
  phone?: string;
  /** 有效期（可选，yyyy-MM-dd） */
  expireDate?: string;
}

/**
 * 修改子账号参数
 * PUT /enterprise/sub-account/{id}（query）
 */
export interface SubAccountUpdateParams {
  /** 真实姓名 */
  realName: string;
  /** 状态（0-停用 1-启用） */
  status: SubAccountStatus;
  /** 部门（可选） */
  department?: string;
  /** 有效期（可选） */
  expireDate?: string;
}

/**
 * 分配子账号权限参数
 * PUT /enterprise/sub-account/{id}/permission（query）
 */
export interface SubAccountPermissionParams {
  /** 菜单 ID 列表（逗号分隔） */
  menuIds: string;
}

/**
 * 重置子账号密码参数
 * POST /enterprise/sub-account/{id}/reset-password（query）
 */
export interface SubAccountResetPasswordParams {
  /** 新密码 */
  newPassword: string;
}

/**
 * 导出子账号列表参数
 * POST /enterprise/sub-account/export（query）
 */
export interface SubAccountExportParams {
  /** 用户名（可选） */
  username?: string;
  /** 状态（可选） */
  status?: SubAccountStatus;
}

/**
 * 子账号列表分页结果
 */
export interface SubAccountListResult<T = SubAccountItem> {
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
 * 列表接口原始响应体（扁平分页 + code/msg）
 */
export interface SubAccountListResponseBody<T = SubAccountItem> {
  code?: number;
  msg?: string;
  total?: number;
  records?: T[];
  current?: number;
  size?: number;
  data?: null | SubAccountListResult<T> | T[];
}

/**
 * 写操作 / 导出通用响应体
 */
export interface SubAccountMutationResponse {
  code?: number;
  msg?: string;
  data?:
    | null
    | string
    | SubAccountExportResult
    | { key?: number; subAccountId?: number };
}

/**
 * 导出结果
 * data.fileUrl / data.fileName
 */
export interface SubAccountExportResult {
  /** 下载地址 */
  fileUrl?: string;
  /** 文件名 */
  fileName?: string;
}
