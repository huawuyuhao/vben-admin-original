/** 个人用户认证 mock 数据 */

import type { AuthStatus } from './enterprise-auth';

export interface PersonAuthHistoryItem {
  id: string;
  applyNo: string;
  realName: string;
  submittedAt: string;
  finishedAt: string;
  result: '通过' | '审核中' | '驳回';
  remark: string;
}

export const OCCUPATION_OPTIONS = [
  '企业员工',
  '个体经营者',
  '科研人员',
  '学生',
  '自由职业',
  '公务员 / 事业单位',
  '其他',
] as const;

export function createDefaultPersonForm() {
  return {
    realName: '',
    phoneCode: '+86',
    phone: '',
    idNo: '',
    gender: '',
    birthday: '',
    age: '',
    idValidFrom: '',
    idValidTo: '',
    idLongTerm: false,
    occupation: '',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    addressDetail: '',
  };
}

export const PERSON_AUTH_HISTORY: PersonAuthHistoryItem[] = [
  {
    id: 'p1',
    applyNo: 'PER-2026-0518-007',
    realName: '李某某',
    submittedAt: '2026-05-18 10:12',
    finishedAt: '2026-05-19 15:40',
    result: '驳回',
    remark: '人像面照片反光严重，无法辨认姓名与证件号，请重新上传。',
  },
];

/** 演示默认：未认证，停留在填写信息步骤 */
export const DEFAULT_PERSON_AUTH_STATUS: AuthStatus = 'draft';

/**
 * 从 18 位身份证号解析性别、出生日期、年龄
 */
export function parseIdCard(idNo: string) {
  const id = idNo.trim();
  if (!/^\d{17}[\dXx]$/.test(id)) {
    return { gender: '', birthday: '', age: '' };
  }
  const birth = `${id.slice(6, 10)}-${id.slice(10, 12)}-${id.slice(12, 14)}`;
  const genderCode = Number(id.charAt(16));
  const gender = genderCode % 2 === 1 ? '男' : '女';
  const birthDate = new Date(birth);
  if (Number.isNaN(birthDate.getTime())) {
    return { gender: '', birthday: '', age: '' };
  }
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age -= 1;
  return {
    gender,
    birthday: birth,
    age: String(Math.max(age, 0)),
  };
}
