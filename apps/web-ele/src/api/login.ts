import type {
  LoginParams,
  LoginResult,
  RegisterParams,
  RegisterResult,
  SmsCodeParams,
} from '#/types/login';

import { rootRequestClient } from '#/api/request';
import { AUTH_DEFAULT_TENANT_ID } from '#/types/login';

/**
 * 用户登录
 * 开发态走 Apifox Mock：/mock/auth/login
 * 正式接口：POST /auth/login（文档路径不带 /api）
 * 必填：clientKey、grantType、username；密码登录传 password，短信登录传 smsCode + phonenumber
 * tenantId 未传时默认 '000000'
 * @param data 登录参数
 * @returns 登录结果 data（access_token / refresh_token 等）
 */
export async function loginApi(data: LoginParams) {
  const payload: LoginParams = {
    ...data,
    tenantId: data.tenantId || AUTH_DEFAULT_TENANT_ID,
  };
  // return rootRequestClient.post<LoginResult>('/mock/auth/login', payload);
  return rootRequestClient.post<LoginResult>('/pwq-mock/auth/login', payload);
  // return rootRequestClient.post<LoginResult>('/auth/login', payload);
}

/**
 * 用户注册
 * 开发态走 Apifox Mock：/mock/auth/register
 * 正式接口：POST /auth/register
 * @param data 注册参数
 * @returns 业务 data（文档为 string）
 */
export async function registerApi(data: RegisterParams) {
  // return rootRequestClient.post<RegisterResult>('/mock/auth/register', data);
  return rootRequestClient.post<RegisterResult>('/pwq-mock/auth/register', data);
  // return rootRequestClient.post<RegisterResult>('/auth/register', data);
}

/**
 * 发送短信验证码
 * 开发态走 Apifox Mock：/mock/auth/sms-code
 * 正式接口：POST /auth/sms-code
 * @param data 含手机号的请求体
 */
export async function sendSmsCodeApi(data: SmsCodeParams) {
  return rootRequestClient.post<null | undefined>(
    // '/mock/auth/sms-code',
    '/pwq-mock/auth/sms-code',
    data,
  );
  // return rootRequestClient.post<null | undefined>('/auth/sms-code', data);
}

/**
 * 用户退出登录（需 Bearer Token）
 * 开发态走 Apifox Mock：/mock/auth/logout
 * 正式接口：POST /auth/logout
 * @returns 业务 data（成功时可为 null/空）
 */
export async function logoutApi() {
  // return rootRequestClient.post<null | undefined>('/mock/auth/logout');
  return rootRequestClient.post<null | undefined>('/pwq-mock/auth/logout');
  // return rootRequestClient.post<null | undefined>('/auth/logout');
}
