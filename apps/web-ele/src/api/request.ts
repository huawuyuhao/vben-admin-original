/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

/** 避免 401 连锁请求反复触发登出 */
let isReAuthenticating = false;

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑（token 失效 / 业务码 401）
   */
  async function doReAuthenticate() {
    if (isReAuthenticating) {
      return;
    }
    isReAuthenticating = true;
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    try {
      accessStore.setAccessToken(null);
      accessStore.setClientId(null);
      // 认证失败统一退出到登录页，避免停在空白业务页
      await authStore.logout(false);
    } finally {
      isReAuthenticating = false;
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  /**
   * 是否为认证失败（HTTP 401 或业务体 code=401）
   */
  function isUnauthorizedError(error: any): boolean {
    const httpStatus = error?.response?.status ?? error?.status;
    if (httpStatus === 401) {
      return true;
    }
    const responseData = error?.response?.data ?? error?.data ?? {};
    return Number(responseData?.code) === 401;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      // 后端要求：登录返回的 client_id 以 clientid 请求头带到所有接口
      if (accessStore.clientId) {
        config.headers.clientid = accessStore.clientId;
      }
      return config;
    },
  });

  // 处理返回的响应数据格式（门户部分接口成功码为 200，历史接口为 0）
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: (code) => code === 0 || code === 200,
    }),
  );

  // token过期的处理（HTTP 401）
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 业务码 401（如 HTTP 200 + code:401「认证失败，无法访问系统资源」）同样触发退出
  client.addResponseInterceptor({
    rejected: async (error) => {
      if (isUnauthorizedError(error)) {
        const responseData = error?.response?.data ?? error?.data ?? {};
        const tip =
          responseData?.msg ||
          responseData?.error ||
          responseData?.message ||
          '';
        if (tip) {
          ElMessage.error(tip);
        }
        await doReAuthenticate();
      }
      throw error;
    },
  });

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 401 已在上方拦截并退出，避免重复弹错
      if (isUnauthorizedError(error)) {
        return;
      }
      // 门户接口业务错误多为 { code, msg }；兼容 error / message
      const responseData = error?.response?.data ?? error?.data ?? {};
      const errorMessage =
        responseData?.msg ??
        responseData?.error ??
        responseData?.message ??
        '';
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

/**
 * 无 baseURL 前缀的请求客户端。
 * 用于文档路径本身是否带 `/api` 不一致的接口（须在调用处写全路径）。
 */
export const rootRequestClient = createRequestClient('', {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
