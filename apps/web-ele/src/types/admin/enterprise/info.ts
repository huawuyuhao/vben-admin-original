/**
 * 认证状态（0-未认证 1-认证中 2-已认证 3-认证不通过）
 */
export type EnterpriseAuthStatus = 0 | 1 | 2 | 3;

/**
 * 企业类型（1-算力需求方 2-算力供给方）
 */
export type EnterpriseType = 1 | 2;

/**
 * 企业启用状态（0-停用 1-启用）
 */
export type EnterpriseStatus = 0 | 1;

/**
 * 企业基础信息
 * GET /enterprise/info → data
 */
export interface EnterpriseInfo {
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
  /** 企业 ID */
  enterpriseId?: number;
  /** 企业名称 */
  enterpriseName?: string;
  /** 法人姓名 */
  legalPerson?: string;
  /** 统一社会信用代码（唯一不可修改） */
  creditCode?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 企业地址 */
  address?: string;
  /** 所属行业 */
  industry?: string;
  /** 认证状态（0-未认证 1-认证中 2-已认证 3-认证不通过） */
  authStatus?: EnterpriseAuthStatus | number;
  /** 企业类型（1-算力需求方 2-算力供给方） */
  enterpriseType?: EnterpriseType | number;
  /** 状态（0-停用 1-启用） */
  status?: EnterpriseStatus | number;
}

/**
 * 修改企业信息入参（PUT /enterprise/info，query）
 */
export interface UpdateEnterpriseInfoParams {
  /** 联系电话（必填） */
  contactPhone: string;
  /** 企业地址（必填） */
  address: string;
}

/**
 * 修改企业信息接口 data（文档为 string）
 */
export type UpdateEnterpriseInfoResult = string;
