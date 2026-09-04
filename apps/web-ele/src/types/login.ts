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
 * 用户登录请求体（与 OpenAPI POST /auth/login 对齐）
 */
export interface LoginParams {
  /** 客户端 key（必填，如 pc、app） */
  clientKey: string;
  /** 授权类型（必填；密码登录 password，短信登录 sms） */
  grantType: AuthGrantType;
  /** 用户名（必填；账号密码登录传账号） */
  username: string;
  /** 密码（密码登录必填；明文传输，开启 ApiEncrypt 时由后端加密） */
  password?: string;
  /** 短信验证码（短信登录必填） */
  smsCode?: string;
  /** 登录手机号（短信登录必填） */
  phonenumber?: string;
  /** 客户端 ID（可选，如 e5cd7e4891bf95d1d19206ce24a7b32e） */
  clientId?: string;
  /** 租户 ID（多租户场景；不传走默认） */
  tenantId?: string;
  /** 用户入驻类型：demand / supply */
  userEnterType?: UserEnterType;
  /** 图形验证码答案（captcha.enable=true 时必填） */
  code?: string;
  /** 图形验证码唯一标识（与 code 配对） */
  uuid?: string;
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
  userId?: number | string;
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
 * 登录接口 data 结构（与 OpenAPI POST /auth/login 对齐）
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
 * 授权类型（注册 / 登录 grantType）
 */
export enum AuthGrantType {
  /** 邮箱 */
  Email = 'email',
  /** 密码 */
  Password = 'password',
  /** 短信 */
  Sms = 'sms',
  /** 社交账号 */
  Social = 'social',
  /** 小程序 */
  Xcx = 'xcx',
}

/**
 * 行业属性（注册 industryType）
 */
export enum IndustryType {
  /** 碳 */
  Carbon = 'carbon',
  /** 算力 */
  Computing = 'computing',
  /** 电力 */
  Electricity = 'electricity',
  /** 政务 */
  Government = 'government',
  /** 互联网 */
  Internet = 'internet',
  /** 制造业 */
  Manufacturing = 'manufacturing',
  /** 新能源 */
  NewEnergy = 'new_energy',
  /** 其他 */
  Other = 'other',
  /** 科研 */
  Research = 'research',
}

/**
 * 用户类型（注册 userType）
 */
export enum AuthUserType {
  /** 应用用户 */
  AppUser = 'app_user',
  /** 系统用户 */
  SysUser = 'sys_user',
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
  /** 行业属性（提交值为 IndustryType 枚举） */
  industryType: '' | IndustryType;
  /** 登录密码 */
  password: string;
  /** 确认密码（仅前端校验，不提交） */
  confirmPassword: string;
}

/**
 * 用户注册请求体（与 OpenAPI POST /auth/register 对齐）
 */
export interface RegisterParams {
  /** 客户端 id（必填） */
  clientId: string;
  /** 授权类型（必填） */
  grantType: AuthGrantType;
  /** 用户名（必填） */
  username: string;
  /** 密码（必填，需含大小写、数字、特殊字符，至少 8 位） */
  password: string;
  /** 真实姓名（必填） */
  realName: string;
  /** 手机号（必填，1[3-9] 开头 11 位） */
  phonenumber: string;
  /** 行业属性（必填） */
  industryType: IndustryType;
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
  /**
   * 用户类型（按端区分，不可写死）
   * - sys_user：PC / Web
   * - app_user：移动客户端
   */
  userType: AuthUserType;
  /** 是否勾选用户协议与隐私政策 */
  agreementAccepted?: boolean;
}

/**
 * 注册接口返回的 data（文档为 string）
 */
export type RegisterResult = string;

/** 门户 OAuth 客户端 ID（注册等接口沿用） */
export const AUTH_CLIENT_ID = 'pc';

/** 门户登录客户端 key（POST /auth/login 必填：pc / app） */
export const AUTH_CLIENT_KEY = 'pc';

/** 门户默认租户 ID（登录未显式传入时使用） */
export const AUTH_DEFAULT_TENANT_ID = '000000';

/** 注册授权类型（注册必填，与后端约定） */
export const AUTH_REGISTER_GRANT_TYPE = AuthGrantType.Password;

/**
 * 是否为移动端 UA（用于注册 userType 区分 PC / 移动）
 */
export function isMobileClientUserAgent(
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

/**
 * 按端解析注册 userType：PC/Web → sys_user，移动客户端 → app_user
 * @param isMobileClient 是否移动端；默认根据 UA 判断
 */
export function resolveRegisterUserType(
  isMobileClient = isMobileClientUserAgent(),
): AuthUserType {
  return isMobileClient ? AuthUserType.AppUser : AuthUserType.SysUser;
}

/** 注册页行业属性可选值（与 OpenAPI enum 一致） */
export const INDUSTRY_TYPE_VALUES = Object.values(IndustryType);


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
