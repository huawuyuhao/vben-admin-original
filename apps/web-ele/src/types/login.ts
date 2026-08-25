/**
 * 登录 / 注册相关类型与枚举
 */

/**
 * 登录页身份选项卡（对应入参 userEnterType，文档必填）
 */
export enum UserEnterType {
  /** 算力需求下单 */
  Demand = 'demand',
  /** 算力资源供给 */
  Supply = 'supply',
}

/**
 * 租户编号（临时枚举，多租户场景可选；与 userEnterType 配合使用）
 */
export enum LoginTenantId {
  /** 算力需求下单 */
  Demand = 'TENANT_DEMAND',
  /** 算力资源供给 */
  Supply = 'TENANT_SUPPLY',
}

/**
 * 登录方式
 */
export enum LoginType {
  /** 账号密码登录 */
  Password = 'password',
  /** 短信验证码登录（未注册手机号验证通过后自动注册） */
  Sms = 'sms',
}

/**
 * 认证页模式
 */
export type AuthMode = 'account' | 'forgot' | 'register' | 'sms';

/**
 * 页面标题与按钮文案元信息
 */
export interface AuthPageMeta {
  /** 卡片主标题 */
  title: string;
  /** 副提示文案 */
  hint: string;
  /** 提交按钮文案 */
  submit: string;
}

/**
 * 用户登录请求体
 */
export interface LoginParams {
  /** 用户名（短信登录时传手机号） */
  username?: string;
  /** 密码（短信登录时可传验证码） */
  password?: string;
  /** 验证码 */
  captcha?: string;
  /** 登录类型 */
  loginType?: LoginType | string;
  /** 租户编号（多租户场景） */
  tenantId?: LoginTenantId | string;
  /** 登录页切换选项卡（必填：demand / supply） */
  userEnterType: UserEnterType;
}

/**
 * 发送短信验证码请求体
 */
export interface SmsCodeParams {
  /** 手机号 */
  phone: string;
}

/**
 * 登录成功后的用户信息（接口文档未完善时的扩展字段）
 */
export interface LoginUserInfo {
  /** 用户 ID */
  userId?: string | number;
  /** 用户名 */
  username?: string;
  /** 真实姓名 / 昵称 */
  realName?: string;
  /** 手机号 */
  phone?: string;
  /** 头像 */
  avatar?: string;
  /** 首页路径 */
  homePath?: string;
  /** 其它扩展字段 */
  [key: string]: unknown;
}

/**
 * 登录接口 data 结构（与最新 OpenAPI 对齐）
 */
export interface LoginResult {
  /** 授权令牌，后续请求需携带 */
  access_token: string;
  /** 刷新令牌（未启用时为 null） */
  refresh_token?: null | string;
  /** access_token 有效期（秒） */
  expire_in?: number;
  /** refresh_token 有效期（秒） */
  refresh_expire_in?: null | number;
  /** 应用（客户端）ID */
  client_id?: string;
  /** 令牌权限范围 */
  scope?: null | string;
  /** 用户 openid（仅小程序登录时返回） */
  openid?: null | string;
  /** 兼容旧字段：用户信息（若后端仍返回） */
  userInfo?: LoginUserInfo;
  /** 兼容旧字段：租户编号 */
  tenantId?: string;
}

/**
 * 通用接口响应
 * 注意：门户部分接口成功码为 200，历史接口可能为 0
 */
export interface CommonResponse<T = unknown> {
  /** 状态码，0 或 200 表示成功 */
  code: number;
  /** 提示信息 */
  msg: string;
  /** 业务数据 */
  data: T;
}

/**
 * 短信登录表单
 */
export interface SmsLoginForm {
  /** 手机号 */
  phone: string;
  /** 短信验证码 */
  code: string;
}

/**
 * 账号密码登录表单
 */
export interface AccountLoginForm {
  /** 账号 / 手机号 */
  account: string;
  /** 密码 */
  password: string;
}

/**
 * 注册表单（页面字段；提交时映射为 RegisterParams）
 */
export interface RegisterForm {
  /** 用户名 */
  username: string;
  /** 真实姓名 */
  realName: string;
  /** 手机号 */
  phone: string;
  /** 短信验证码 */
  code: string;
  /** 行业属性 */
  industryType: string;
  /** 登录密码 */
  password: string;
  /** 确认密码（仅前端校验，不提交） */
  confirmPassword: string;
}

/**
 * 用户注册请求体（与 OpenAPI /auth/register 对齐）
 */
export interface RegisterParams {
  /** 客户端 id（必填） */
  clientId: string;
  /** 授权类型（必填） */
  grantType: string;
  /** 用户名（必填） */
  username: string;
  /** 密码（必填，需含大小写、数字、特殊字符，至少 8 位） */
  password: string;
  /** 真实姓名（必填） */
  realName: string;
  /** 手机号（必填） */
  phonenumber: string;
  /** 行业属性（必填） */
  industryType: string;
  /** 短信验证码（必填） */
  smsCode: string;
  /** 租户 ID */
  tenantId?: string;
  /** 图形验证码 */
  code?: string;
  /** 图形验证码唯一标识 */
  uuid?: string;
  /** 用户入驻类型：demand / supply */
  userEnterType?: UserEnterType;
  /** 用户类型 */
  userType?: string;
  /** 是否勾选用户协议与隐私政策 */
  agreementAccepted?: boolean;
}

/**
 * 注册接口返回的 data（文档为 string）
 */
export type RegisterResult = string;

/** 门户 OAuth 客户端 ID（注册必填，与后端约定） */
export const AUTH_CLIENT_ID = 'pc';

/** 注册授权类型（注册必填，与后端约定） */
export const AUTH_REGISTER_GRANT_TYPE = 'password';


/**
 * 找回密码表单
 */
export interface ForgotForm {
  /** 手机号 */
  phone: string;
  /** 短信验证码 */
  code: string;
  /** 新密码 */
  password: string;
  /** 确认新密码 */
  confirmPassword: string;
}

/**
 * 登录页身份选项（用于角色 Tab，对应 userEnterType）
 */
export interface TenantRoleOption {
  /** 展示文案 */
  label: string;
  /** 对应 userEnterType */
  value: UserEnterType;
}
