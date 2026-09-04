import type { RegisterParams } from '#/types/login';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';
import { defineStore } from 'pinia';

import { registerApi, sendSmsCodeApi } from '#/api/login';
import {
  AUTH_CLIENT_KEY,
  AuthGrantType,
  UserEnterType,
} from '#/types/login';

import { useAuthStore } from '../auth';

/**
 * 登录页 UI 态（身份选项卡、短信/注册请求中）。
 * token / 用户信息一律走 vben 的 accessStore、userStore，不在此持久化。
 */
export const useLoginStore = defineStore('login', () => {
  const router = useRouter();

  /** 登录页身份选项卡（demand / supply） */
  const userEnterType = ref<UserEnterType>(UserEnterType.Demand);
  /** 注册请求中 */
  const registerLoading = ref(false);
  /** 发送验证码请求中 */
  const smsLoading = ref(false);

  /**
   * 调用注册接口；成功后自动登录并跳转门户首页。
   * @param params 注册入参
   */
  async function register(params: RegisterParams) {
    const authStore = useAuthStore();
    registerLoading.value = true;
    try {
      await registerApi(params);
      // 注册成功后自动登录；显式跳门户首页，避免依赖用户信息里的空 homePath
      await authStore.authLogin(
        {
          clientKey: AUTH_CLIENT_KEY,
          grantType: AuthGrantType.Password,
          username: params.username,
          password: params.password,
          userEnterType: params.userEnterType ?? UserEnterType.Demand,
        },
        async () => {
          await router.replace(preferences.app.defaultHomePath || '/portal');
        },
      );
    } finally {
      registerLoading.value = false;
    }
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   */
  async function sendSmsCode(phone: string) {
    smsLoading.value = true;
    try {
      await sendSmsCodeApi({ phone });
    } finally {
      smsLoading.value = false;
    }
  }

  /**
   * 设置登录页身份选项卡
   * @param type demand | supply
   */
  function setUserEnterType(type: UserEnterType) {
    userEnterType.value = type;
  }

  /**
   * 重置登录页 UI 态
   */
  function $reset() {
    userEnterType.value = UserEnterType.Demand;
    registerLoading.value = false;
    smsLoading.value = false;
  }

  return {
    $reset,
    register,
    registerLoading,
    sendSmsCode,
    setUserEnterType,
    smsLoading,
    userEnterType,
  };
});
