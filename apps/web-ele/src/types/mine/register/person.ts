/**
 * 个人认证状态码（进度接口 authStatus 为 integer）
 * 约定：0 未提交/草稿，1 审核中，2 已通过，3 已驳回
 */
export type PersonalAuthStatus = number | string;

/**
 * 个人认证提交入参（POST /auth/personal-cert，JSON body）
 */
export interface PersonalCertParams {
  /** 真实姓名 */
  realName: string;
  /** 联系电话 */
  phone: string;
  /** 身份证号 */
  idCardNo: string;
  /** 身份证正面 URL */
  idCardFront: string;
  /** 身份证背面 URL */
  idCardBack: string;
}

/**
 * 个人认证提交接口 data（返参 key 即后续进度查询的 authId）
 */
export interface PersonalCertResult {
  /** 认证 ID（进度接口 authId） */
  key: number;
}

/**
 * 个人认证进度查询入参（GET /auth/personal-cert/progress）
 */
export interface PersonalCertProgressParams {
  /** 认证 ID（提交接口返回的 key；可选，缺省由后端按登录用户解析） */
  authId?: number;
}

/**
 * 个人认证进度查询接口 data
 */
export interface PersonalCertProgressResult {
  /** 认证状态（integer） */
  authStatus?: number;
  /** 审核备注 */
  auditRemark?: string;
}
