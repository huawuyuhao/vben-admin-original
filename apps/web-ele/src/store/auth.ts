import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, logoutApi } from '#/api';
// 后端暂无 /auth/codes，有等价接口后再恢复：import { getAccessCodesApi } from '#/api';
import { $t } from '#/locales';
import { PORTAL_LOGIN_PATH } from '#/router/routes/core';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作（vben 标准链路）：
   * 取 token → 写入 accessStore → 拉用户信息 → 写入 userStore → 跳转。
   * 权限码接口 /auth/codes 后端暂未提供，先写入空数组；有接口后再恢复 getAccessCodesApi。
   * @param params 登录表单数据
   * @param onSuccess 登录成功后的自定义跳转；不传则按 homePath / 默认首页跳转
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken, refreshToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中（pinia persist，与其它 vben 项目互通）
        accessStore.setAccessToken(accessToken);
        if (refreshToken) {
          accessStore.setRefreshToken(refreshToken);
        }

        // 获取用户信息并写入 userStore
        userInfo = await fetchUserInfo();
        userStore.setUserInfo(userInfo);

        // 后端暂无 /auth/codes，先置空；恢复时改为：
        // const accessCodes = await getAccessCodesApi();
        // accessStore.setAccessCodes(accessCodes);
        accessStore.setAccessCodes([]);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
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
   * 退出登录：先调服务端退出接口，再重置全部 vben store，回登录页。
   * @param redirect 是否在回登录页时带上当前路由作为 redirect
   */
  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: PORTAL_LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  /**
   * 请求并写入当前用户信息（vben 标准：走 getUserInfoApi → userStore）。
   * @returns 用户信息
   */
  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 重置本 store 的 loading 态（登出时由 resetAllStores 调用）
   */
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
