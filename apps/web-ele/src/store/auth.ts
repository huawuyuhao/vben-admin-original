import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getAccessCodesApi, loginApi } from '#/api';
import { logoutApi } from '#/api/login';
import { $t } from '#/locales';
import { PORTAL_LOGIN_PATH } from '#/router/routes/core';

import { useLoginStore } from './login';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const loginStore = useLoginStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 用户信息来自登录缓存（不再请求 /user/info）；权限码仍按需拉取
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        if (userInfo) {
          userStore.setUserInfo(userInfo);
        }
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo?.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  /**
   * 退出登录：先调服务端退出接口，再清本地与 session 态
   * @param redirect 是否在回登录页时带上当前路由作为 redirect
   */
  async function logout(redirect: boolean = true) {
    try {
      // POST /api/auth/logout（Bearer）；失败仍继续清本地，避免卡在已失效会话
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    loginStore.$reset();
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址（redirect 勿手动 encode，交给 Vue Router）
    await router.replace({
      path: PORTAL_LOGIN_PATH,
      query: redirect
        ? {
            redirect: router.currentRoute.value.fullPath,
          }
        : {},
    });
  }

  /**
   * 从本地缓存回填用户信息（不请求接口）
   * 优先 userStore，其次 loginStore 的个人资料 / 登录用户缓存
   * @returns 用户信息；无缓存时返回 null
   */
  async function fetchUserInfo(): Promise<null | UserInfo> {
    if (userStore.userInfo) {
      return userStore.userInfo as UserInfo;
    }

    const profileUser = loginStore.userProfile?.user;
    if (profileUser) {
      const userInfo = {
        avatar: String(profileUser.avatar ?? ''),
        homePath: preferences.app.defaultHomePath,
        realName: String(profileUser.nickName ?? profileUser.userName ?? ''),
        roles: [] as string[],
        userId: String(profileUser.userId ?? ''),
        username: String(profileUser.userName ?? ''),
      } as UserInfo;
      userStore.setUserInfo(userInfo);
      return userInfo;
    }

    const cached = loginStore.userInfo;
    if (cached) {
      const userInfo = {
        avatar: String(cached.avatar ?? ''),
        homePath: preferences.app.defaultHomePath,
        realName: String(cached.realName ?? cached.username ?? ''),
        roles: [] as string[],
        userId: String(cached.userId ?? ''),
        username: String(cached.username ?? ''),
      } as UserInfo;
      userStore.setUserInfo(userInfo);
      return userInfo;
    }

    return null;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
