import type { UserInfo } from '@vben/types';

import type { UserProfileResult } from '#/types/mine/profile/info';

import { getUserProfileApi } from '#/api/mine/profile/info';

/**
 * 将门户个人信息接口 data 映射为 vben UserInfo，写入 userStore 用。
 * @param profile GET /system/user/profile 的业务 data
 * @returns vben 标准用户信息
 */
export function mapProfileToUserInfo(
  profile?: null | UserProfileResult,
): UserInfo {
  const user = profile?.user;
  const roles = String(profile?.roleGroup ?? '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    avatar: String(user?.avatar ?? ''),
    desc: '',
    homePath: '',
    realName: String(user?.nickName ?? user?.userName ?? ''),
    roles,
    token: '',
    userId: String(user?.userId ?? ''),
    username: String(user?.userName ?? ''),
  };
}

/**
 * 获取当前登录用户信息（vben 登录链路标准入口）。
 * 后端为门户个人信息接口，返回值对齐 vben UserInfo，便于与其它 vben 项目共用 userStore。
 * @returns 当前用户信息
 */
export async function getUserInfoApi() {
  const profile = await getUserProfileApi();
  return mapProfileToUserInfo(profile);
}
