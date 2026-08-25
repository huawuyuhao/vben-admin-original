/**
 * 个人信息中的用户对象（GET /system/user/profile）
 */
export interface UserProfileInfo {
  /** 用户 ID */
  userId?: number;
  /** 租户 ID */
  tenantId?: string;
  /** 部门 ID */
  deptId?: number;
  /** 用户账号 */
  userName?: string;
  /** 用户昵称 */
  nickName?: string;
  /** 用户类型 */
  userType?: string;
  /** 用户邮箱 */
  email?: string;
  /** 手机号码 */
  phonenumber?: string;
  /** 用户性别（0男 1女 2未知） */
  sex?: string;
  /** 头像地址（文档为 int64，可能为资源 ID） */
  avatar?: number | string;
  /** 最后登录 IP */
  loginIp?: string;
  /** 最后登录时间 */
  loginDate?: string;
  /** 部门名 */
  deptName?: string;
}

/**
 * 获取个人信息接口 data
 */
export interface UserProfileResult {
  /** 用户信息 */
  user?: UserProfileInfo;
  /** 用户所属角色组 */
  roleGroup?: string;
  /** 用户所属岗位组 */
  postGroup?: string;
}

/**
 * 修改个人信息入参（PUT /system/user/profile）
 */
export interface UpdateUserProfileParams {
  /** 用户昵称（必填，2-30 字） */
  nickName: string;
  /** 用户邮箱 */
  email?: string;
  /** 手机号码 */
  phonenumber?: string;
  /** 用户性别（0男 1女 2未知） */
  sex?: string;
}

/**
 * 修改个人信息接口 data（文档为 string）
 */
export type UpdateUserProfileResult = string;

/**
 * 重置密码入参（PUT /system/user/profile/updatePwd）
 */
export interface UpdatePasswordParams {
  /** 旧密码 */
  oldPassword: string;
  /** 新密码（需满足强度：至少 8 位，含大小写、数字与特殊字符） */
  newPassword: string;
}

/**
 * 重置密码接口 data（文档为 string）
 */
export type UpdatePasswordResult = string;
