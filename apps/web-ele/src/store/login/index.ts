import type {
  LoginParams,
  LoginResult,
  LoginUserInfo,
  RegisterParams,
} from '#/types/login';
import type { UserProfileResult } from '#/types/mine/profile/info';

import { ref } from 'vue';

import { useAccessStore, useUserStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { loginApi, registerApi, sendSmsCodeApi } from '#/api/login';
import {
  getUserProfileApi,
  updateUserProfileApi,
} from '#/api/mine/profile/info';
import { LoginType, UserEnterType } from '#/types/login';

/** sessionStorage：登录返参缓存键 */
const LOGIN_RESULT_SESSION_KEY = 'portal-login-result';

/** sessionStorage：个人信息缓存键 */
const USER_PROFILE_SESSION_KEY = 'portal-user-profile';

/**
 * 将登录接口 data 写入 sessionStorage
 * @param result 登录返参
 */
function saveLoginResultToSession(result: LoginResult) {
  sessionStorage.setItem(LOGIN_RESULT_SESSION_KEY, JSON.stringify(result));
}

/**
 * 从 sessionStorage 读取登录返参
 * @returns 缓存的登录结果，无则返回 null
 */
function readLoginResultFromSession(): LoginResult | null {
  const raw = sessionStorage.getItem(LOGIN_RESULT_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as LoginResult;
  } catch {
    sessionStorage.removeItem(LOGIN_RESULT_SESSION_KEY);
    return null;
  }
}

/**
 * 清除 sessionStorage 中的登录返参
 */
function clearLoginResultSession() {
  sessionStorage.removeItem(LOGIN_RESULT_SESSION_KEY);
}

/**
 * 将个人信息写入 sessionStorage
 * @param profile 个人信息
 */
function saveUserProfileToSession(profile: UserProfileResult) {
  sessionStorage.setItem(USER_PROFILE_SESSION_KEY, JSON.stringify(profile));
}

/**
 * 从 sessionStorage 读取个人信息
 * @returns 缓存的个人信息，无则返回 null
 */
function readUserProfileFromSession(): null | UserProfileResult {
  const raw = sessionStorage.getItem(USER_PROFILE_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserProfileResult;
  } catch {
    sessionStorage.removeItem(USER_PROFILE_SESSION_KEY);
    return null;
  }
}

/**
 * 清除 sessionStorage 中的个人信息
 */
function clearUserProfileSession() {
  sessionStorage.removeItem(USER_PROFILE_SESSION_KEY);
}

/**
 * 门户登录状态（token、身份选项卡、用户信息、个人资料等）
 * 完整登录返参与个人资料同时写入 store 与 sessionStorage
 */
export const useLoginStore = defineStore(
  'login',
  () => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();

    /** 访问令牌 */
    const token = ref<null | string>(null);
    /** 登录页身份选项卡（demand / supply） */
    const userEnterType = ref<UserEnterType>(UserEnterType.Demand);
    /** 登录用户信息（登录接口若返回） */
    const userInfo = ref<LoginUserInfo | null>(null);
    /** 登录接口完整返参（与 sessionStorage 同步） */
    const loginResult = ref<LoginResult | null>(readLoginResultFromSession());
    /** 个人信息（GET /system/user/profile，与 sessionStorage 同步） */
    const userProfile = ref<null | UserProfileResult>(
      readUserProfileFromSession(),
    );
    /** 登录请求中 */
    const loginLoading = ref(false);
    /** 注册请求中 */
    const registerLoading = ref(false);
    /** 发送验证码请求中 */
    const smsLoading = ref(false);

    // 刷新页面时，若 session 中有 token，则回填到内存与 accessStore
    if (loginResult.value?.access_token) {
      token.value = loginResult.value.access_token;
      if (!accessStore.accessToken) {
        accessStore.setAccessToken(loginResult.value.access_token);
      }
    }

    // 刷新时用已缓存的个人资料回填 userStore，避免再请求用户信息接口
    if (userProfile.value?.user && !userStore.userInfo) {
      const u = userProfile.value.user;
      userStore.setUserInfo({
        avatar: String(u.avatar ?? ''),
        realName: String(u.nickName ?? u.userName ?? ''),
        roles: [],
        userId: String(u.userId ?? ''),
        username: String(u.userName ?? ''),
      });
    } else if (userInfo.value && !userStore.userInfo) {
      userStore.setUserInfo({
        avatar: String(userInfo.value.avatar ?? ''),
        realName: String(
          userInfo.value.realName ?? userInfo.value.username ?? '',
        ),
        roles: [],
        userId: String(userInfo.value.userId ?? ''),
        username: String(userInfo.value.username ?? ''),
      });
    }

    /**
     * 拉取个人信息并写入 store / userStore / sessionStorage
     * @returns 个人信息
     */
    async function fetchUserProfile(): Promise<UserProfileResult> {
      const profile = await getUserProfileApi();
      userProfile.value = profile ?? null;
      if (profile) {
        saveUserProfileToSession(profile);
      }

      const u = profile?.user;
      if (u) {
        userStore.setUserInfo({
          avatar: String(u.avatar ?? ''),
          realName: String(u.nickName ?? u.userName ?? ''),
          roles: [],
          userId: String(u.userId ?? ''),
          username: String(u.userName ?? ''),
        });
        // 同步一份精简用户信息到 login.userInfo，便于顶栏等读取
        userInfo.value = {
          avatar: String(u.avatar ?? ''),
          phone: String(u.phonenumber ?? ''),
          realName: String(u.nickName ?? u.userName ?? ''),
          userId: u.userId,
          username: String(u.userName ?? ''),
        };
      }

      return profile;
    }

    /**
     * 调用登录接口；成功后写入 token，并拉取个人信息
     * @param params 登录入参
     * @returns 登录结果
     */
    async function login(params: LoginParams): Promise<LoginResult> {
      loginLoading.value = true;
      try {
        const result = await loginApi(params);
        const accessToken = result?.access_token ?? '';

        token.value = accessToken || null;
        userEnterType.value = params.userEnterType;
        userInfo.value = result?.userInfo ?? null;
        loginResult.value = result ?? null;

        if (result) {
          saveLoginResultToSession(result);
        }

        if (accessToken) {
          accessStore.setAccessToken(accessToken);
        }
        if (result?.refresh_token) {
          accessStore.setRefreshToken(result.refresh_token);
        }

        // 登录接口若仍返回 userInfo，先落一份；随后以 profile 为准覆盖
        if (result?.userInfo) {
          userStore.setUserInfo({
            avatar: String(result.userInfo.avatar ?? ''),
            realName: String(
              result.userInfo.realName ?? result.userInfo.username ?? '',
            ),
            roles: [],
            userId: String(result.userInfo.userId ?? ''),
            username: String(result.userInfo.username ?? ''),
          });
        }

        // 登录成功后拉取个人信息并缓存到 sessionStorage
        try {
          await fetchUserProfile();
        } catch {
          // 个人资料失败不阻断登录；错误提示由请求拦截器处理
        }

        return result;
      } finally {
        loginLoading.value = false;
      }
    }

    /**
     * 调用注册接口；成功后自动账号密码登录（并拉个人信息）
     * @param params 注册入参
     * @returns 登录结果
     */
    async function register(params: RegisterParams): Promise<LoginResult> {
      registerLoading.value = true;
      try {
        await registerApi(params);
        // 注册成功后自动登录
        return await login({
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
     * 调用修改个人信息接口，成功后同步本地缓存
     * @param patch 可编辑字段
     */
    async function updateProfile(patch: {
      email?: string;
      nickName: string;
      phonenumber?: string;
      sex?: string;
    }) {
      await updateUserProfileApi({
        email: patch.email,
        nickName: patch.nickName,
        phonenumber: patch.phonenumber,
        sex: patch.sex,
      });
      patchCachedProfile(patch);
    }

    /**
     * 更新本地缓存的个人信息（编辑资料后写入）
     * @param patch 可编辑字段补丁
     */
    function patchCachedProfile(patch: {
      email?: string;
      nickName?: string;
      phonenumber?: string;
      sex?: string;
    }) {
      const current = userProfile.value ?? { user: {} };
      const nextUser = {
        ...(current.user ?? {}),
        ...patch,
      };
      const nextProfile: UserProfileResult = {
        ...current,
        user: nextUser,
      };
      userProfile.value = nextProfile;
      saveUserProfileToSession(nextProfile);

      userStore.setUserInfo({
        avatar: String(nextUser.avatar ?? ''),
        realName: String(nextUser.nickName ?? nextUser.userName ?? ''),
        roles: userStore.userInfo?.roles ?? [],
        userId: String(nextUser.userId ?? ''),
        username: String(nextUser.userName ?? ''),
      });
      userInfo.value = {
        avatar: String(nextUser.avatar ?? ''),
        phone: String(nextUser.phonenumber ?? ''),
        realName: String(nextUser.nickName ?? nextUser.userName ?? ''),
        userId: nextUser.userId,
        username: String(nextUser.userName ?? ''),
      };
    }

    /**
     * 设置登录页身份选项卡
     * @param type demand | supply
     */
    function setUserEnterType(type: UserEnterType) {
      userEnterType.value = type;
    }

    /**
     * 重置登录相关状态（含 sessionStorage）
     */
    function $reset() {
      token.value = null;
      userEnterType.value = UserEnterType.Demand;
      userInfo.value = null;
      loginResult.value = null;
      userProfile.value = null;
      loginLoading.value = false;
      registerLoading.value = false;
      smsLoading.value = false;
      clearLoginResultSession();
      clearUserProfileSession();
    }

    return {
      $reset,
      fetchUserProfile,
      login,
      loginLoading,
      loginResult,
      patchCachedProfile,
      register,
      registerLoading,
      sendSmsCode,
      setUserEnterType,
      smsLoading,
      token,
      updateProfile,
      userEnterType,
      userInfo,
      userProfile,
    };
  },
  {
    // pinia 侧再持久一份（session），与手写 sessionStorage 双保险；关闭标签页即清
    persist: {
      pick: [
        'token',
        'userEnterType',
        'userInfo',
        'loginResult',
        'userProfile',
      ],
      storage: sessionStorage,
    },
  },
);
