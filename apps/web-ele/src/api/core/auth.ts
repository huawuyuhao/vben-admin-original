import type { LoginParams as PortalLoginParams } from '#/types/login';

import { loginApi as portalLoginApi, logoutApi as portalLogoutApi } from '#/api/login';
import { baseRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数（vben 标准字段；门户会额外携带 loginType / userEnterType 等） */
  export interface LoginParams {
    password?: string;
    username?: string;
    [key: string]: unknown;
  }

  /** 登录接口返回值（对齐 vben authLogin：使用 accessToken） */
  export interface LoginResult {
    accessToken: string;
    refreshToken?: null | string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录（vben 标准入口）。
 * 实际请求走门户登录接口，再把 access_token 规范成 accessToken，供 accessStore 持久化。
 * @param data 登录表单数据
 * @returns 含 accessToken 的登录结果
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const result = await portalLoginApi(data as unknown as PortalLoginParams);
  return {
    accessToken: result?.access_token ?? '',
    refreshToken: result?.refresh_token ?? null,
  } satisfies AuthApi.LoginResult;
}

/**
 * 刷新 accessToken（vben 请求拦截器在 token 过期时调用）
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录（vben 标准入口，实际请求走门户退出接口）
 */
export async function logoutApi() {
  return portalLogoutApi();
}

/**
 * 获取用户权限码（vben 登录后写入 accessStore.accessCodes）。
 * 当前后端未提供 /auth/codes，暂不请求；有等价接口后改路径并恢复 authStore 中的调用。
 */
export async function getAccessCodesApi() {
  // return requestClient.get<string[]>('/auth/codes');
  return [] as string[];
}
