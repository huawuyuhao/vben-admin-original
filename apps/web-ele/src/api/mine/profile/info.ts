import type {
  UpdatePasswordParams,
  UpdatePasswordResult,
  UpdateUserProfileParams,
  UpdateUserProfileResult,
  UserProfileResult,
} from '#/types/mine/profile/info';

import { rootRequestClient } from '#/api/request';

/**
 * 获取个人信息（需 Bearer Token）
 * 开发态走 Apifox Mock：/mock/system/user/profile
 * 正式接口：GET /system/user/profile（文档路径不带 /api）
 * @returns 个人信息（user / roleGroup / postGroup）
 */
export async function getUserProfileApi() {
  // return rootRequestClient.get<UserProfileResult>(
  //   '/mock/system/user/profile',
  // );
  return rootRequestClient.get<UserProfileResult>(
    '/pwq-mock/system/user/profile',
  );
  // return rootRequestClient.get<UserProfileResult>('/system/user/profile');
}

/**
 * 修改个人信息（需 Bearer Token）
 * 开发态走 Apifox Mock：PUT /mock/system/user/profile
 * 正式接口：PUT /system/user/profile（文档路径不带 /api）
 * @param data 可改字段（昵称必填）
 * @returns 业务 data（文档为 string）
 */
export async function updateUserProfileApi(data: UpdateUserProfileParams) {
  // return rootRequestClient.put<UpdateUserProfileResult>(
  //   '/mock/system/user/profile',
  //   data,
  // );
  return rootRequestClient.put<UpdateUserProfileResult>(
    '/pwq-mock/system/user/profile',
    data,
  );
  // return rootRequestClient.put<UpdateUserProfileResult>(
  //   '/system/user/profile',
  //   data,
  // );
}

/**
 * 重置密码（需 Bearer Token）
 * 开发态走 Apifox Mock：PUT /mock/system/user/profile/updatePwd
 * 正式接口：PUT /system/user/profile/updatePwd（文档路径不带 /api）
 * @param data 旧密码 + 新密码
 * @returns 业务 data（文档为 string）
 */
export async function updatePasswordApi(data: UpdatePasswordParams) {
  // return rootRequestClient.put<UpdatePasswordResult>(
  //   '/mock/system/user/profile/updatePwd',
  //   data,
  // );
  return rootRequestClient.put<UpdatePasswordResult>(
    '/pwq-mock/system/user/profile/updatePwd',
    data,
  );
  // return rootRequestClient.put<UpdatePasswordResult>(
  //   '/system/user/profile/updatePwd',
  //   data,
  // );
}
