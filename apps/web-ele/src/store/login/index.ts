import type { RegisterParams } from '#/types/login';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { registerApi, sendSmsCodeApi } from '#/api/login';
import { LoginType, UserEnterType } from '#/types/login';

import { useAuthStore } from '../auth';

/**
 * 登录页 UI 态（身份选项卡、短信/注册请求中）。
 * token / 用户信息一律走 vben 的 accessStore、userStore，不在此持久化。
 */
export const useLoginStore = defineStore('login', () => {
  /** 登录页身份选项卡（demand / supply） */
  const userEnterType = ref<UserEnterType>(UserEnterType.Demand);
  /** 注册请求中 */
  const registerLoading = ref(false);
  /** 发送验证码请求中 */
  const smsLoading = ref(false);

  /**
   * 调用注册接口；成功后走 vben authLogin 完成登录态写入。
   * @param params 注册入参
   */
  async function register(params: RegisterParams) {
    const authStore = useAuthStore();
    registerLoading.value = true;
    try {
      await registerApi(params);
      await authStore.authLogin({
        username: params.username,
        password: params.password,
        loginType: LoginType.Password,
        userEnterType: params.userEnterType ?? UserEnterType.Demand,
      });
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
