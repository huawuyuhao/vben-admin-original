import type {
  LoginParams,
  LoginResult,
  RegisterParams,
  RegisterResult,
  SmsCodeParams,
} from '#/types/login';

import { rootRequestClient } from '#/api/request';

/**
 * 用户登录
 * 开发态走 Apifox Mock：/api/mock/auth/login → 代理到 Mock 服务
 * 正式接口：POST /api/auth/login（文档路径自带 /api）
 * @param data 登录参数（必填 userEnterType：demand | supply）
 * @returns 登录结果（access_token 等）
 */
export async function loginApi(data: LoginParams) {
  // return rootRequestClient.post<LoginResult>('/mock/api/auth/login', data);
  return rootRequestClient.post<LoginResult>('/pwq-mock/api/auth/login', data);
  // return rootRequestClient.post<LoginResult>('/api/auth/login', data);
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
