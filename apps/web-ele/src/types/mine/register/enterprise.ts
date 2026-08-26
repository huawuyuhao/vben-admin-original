/**
 * 企业认证状态码（进度接口 authStatus 为 integer）
 * 约定：0 未提交/草稿，1 审核中，2 已通过，3 已驳回（兼容字符串文案）
 */
export type EnterpriseAuthStatus = number | string;

/**
 * 企业认证提交入参（POST /auth/enterprise-cert，JSON body）
 */
export interface EnterpriseCertParams {
  /** 企业 ID */
  enterpriseId: number;
  /** 法人姓名 */
  legalPersonName: string;
  /** 身份证号 */
  idCardNo: string;
  /** 身份证正面 URL */
  idCardFront: string;
  /** 身份证背面 URL */
  idCardBack: string;
  /** 营业执照 URL */
  businessLicense: string;
}

/**
 * 企业认证提交接口 data（返参 key 即后续进度查询的 authId）
 */
export interface EnterpriseCertResult {
  /** 认证 ID（进度接口 authId） */
  key: number;
}

/**
 * 企业认证进度查询入参（GET /auth/enterprise-cert/progress）
 * 进入页可先查当前用户进度；有本地 key 时带上 authId
 */
export interface EnterpriseCertProgressParams {
  /** 认证 ID（提交接口返回的 key；可选，缺省由后端按登录用户解析） */
  authId?: number;
}

/**
 * 企业认证进度查询接口 data
 */
export interface EnterpriseCertProgressResult {
  /** 认证状态（integer） */
  authStatus?: number;
  /** 审核备注（驳回原因等） */
  auditRemark?: string;
}
