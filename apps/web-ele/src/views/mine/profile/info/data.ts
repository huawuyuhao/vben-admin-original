import type { UserProfileResult } from '#/types/mine/profile/info';

import { isEmpty, isHttpUrl } from '@vben/utils';

/** 性别文案映射（0男 1女 2未知） */
export const SEX_LABEL_MAP: Record<string, string> = {
  '0': '男',
  '1': '女',
  '2': '未知',
};

/** 编辑表单性别选项 */
export const SEX_OPTIONS = [
  { label: '男', value: '0' },
  { label: '女', value: '1' },
  { label: '未知', value: '2' },
] as const;

/** 个人信息展示行 */
export interface ProfileDisplayField {
  /** 字段标签 */
  label: string;
  /** 展示值 */
  value: string;
}

/** 分组后的资料块 */
export interface ProfileFieldGroup {
  /** 分组标题 */
  title: string;
  /** 分组说明 */
  hint: string;
  /** 字段列表 */
  fields: ProfileDisplayField[];
}

/** 可编辑资料表单 */
export interface ProfileEditForm {
  email: string;
  nickName: string;
  phonenumber: string;
  sex: string;
}

/**
 * 将空值统一展示为占位符
 * @param value 原始值
 * @returns 可展示字符串
 */
export function formatDisplayValue(value?: null | number | string): string {
  if (value === null || value === undefined) {
    return '—';
  }
  const text = String(value).trim();
  return isEmpty(text) ? '—' : text;
}

/**
 * 将性别码转为中文
 * @param sex 性别码
 * @returns 男 / 女 / 未知 / —
 */
export function formatSexLabel(sex?: string): string {
  if (isEmpty(sex)) {
    return '—';
  }
  return SEX_LABEL_MAP[String(sex)] ?? formatDisplayValue(sex);
}

/**
 * 判断头像是否为可直接展示的 URL
 * @param avatar 头像字段
 * @returns 可展示时返回 URL，否则为空串
 */
export function resolveAvatarUrl(avatar?: number | string): string {
  if (avatar === null || avatar === undefined) {
    return '';
  }
  const text = String(avatar).trim();
  if (isEmpty(text) || !isHttpUrl(text)) {
    return '';
  }
  return text;
}

/**
 * 取头像占位字母（昵称或账号首字）
 * @param profile 个人信息
 * @returns 单个字符
 */
export function resolveAvatarLetter(profile: null | UserProfileResult): string {
  const user = profile?.user;
  const name = String(user?.nickName || user?.userName || '用').trim();
  return name.slice(0, 1).toUpperCase() || '用';
}

/**
 * 按业务语义分组生成资料展示块
 * @param profile 缓存中的个人信息
 * @returns 分组列表
 */
export function buildProfileFieldGroups(
  profile: null | UserProfileResult,
): ProfileFieldGroup[] {
  const user = profile?.user;
  return [
    {
      title: '基础资料',
      hint: '对外展示的身份与联系方式',
      fields: [
        { label: '用户账号', value: formatDisplayValue(user?.userName) },
        { label: '用户昵称', value: formatDisplayValue(user?.nickName) },
        { label: '手机号码', value: formatDisplayValue(user?.phonenumber) },
        { label: '用户邮箱', value: formatDisplayValue(user?.email) },
        { label: '用户性别', value: formatSexLabel(user?.sex) },
        { label: '用户类型', value: formatDisplayValue(user?.userType) },
      ],
    },
    {
      title: '组织归属',
      hint: '账号所属租户、部门与岗位',
      fields: [
        { label: '用户 ID', value: formatDisplayValue(user?.userId) },
        { label: '租户 ID', value: formatDisplayValue(user?.tenantId) },
        { label: '部门 ID', value: formatDisplayValue(user?.deptId) },
        { label: '部门名称', value: formatDisplayValue(user?.deptName) },
        { label: '角色组', value: formatDisplayValue(profile?.roleGroup) },
        { label: '岗位组', value: formatDisplayValue(profile?.postGroup) },
      ],
    },
    {
      title: '登录轨迹',
      hint: '最近一次登录环境',
      fields: [
        { label: '最后登录 IP', value: formatDisplayValue(user?.loginIp) },
        { label: '最后登录时间', value: formatDisplayValue(user?.loginDate) },
      ],
    },
  ];
}

/** 手机号校验（与 OpenAPI phonenumber pattern 对齐） */
export const PHONE_PATTERN = /^(?:0|86|\+86)?1[3-9]\d{9}$/;

/** 邮箱简单校验 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 新密码强度：至少 8 位，含大小写、数字与特殊字符 @$!%*?&
 * 与 OpenAPI updatePwd.newPassword pattern 一致
 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** 重置密码表单 */
export interface ResetPasswordForm {
  /** 旧密码 */
  oldPassword: string;
  /** 新密码 */
  newPassword: string;
  /** 确认新密码 */
  confirmPassword: string;
}

/**
 * 创建重置密码表单初值
 * @returns 空表单
 */
export function createResetPasswordForm(): ResetPasswordForm {
  return {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

/**
 * 从缓存资料生成可编辑表单初值
 * @param profile 个人信息
 * @returns 编辑表单
 */
export function createEditForm(
  profile: null | UserProfileResult,
): ProfileEditForm {
  const user = profile?.user;
  return {
    email: String(user?.email ?? ''),
    nickName: String(user?.nickName ?? ''),
    phonenumber: String(user?.phonenumber ?? ''),
    sex: String(user?.sex ?? '2'),
  };
}
