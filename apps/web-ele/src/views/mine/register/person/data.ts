import type { AuthStatusMeta } from '../enterprise/data';

import { isEmpty } from '@vben/utils';
import { $t } from '@vben/locales';

import {
  CERT_FILE_MAX_MB,
  CERT_IMAGE_TYPES,
  ID_CARD_PATTERN,
  normalizeAuthStatus,
  readFileAsDataUrl,
  sanitizeAuditRemark,
} from '../enterprise/data';

export {
  CERT_FILE_MAX_MB,
  CERT_IMAGE_TYPES,
  ID_CARD_PATTERN,
  normalizeAuthStatus,
  readFileAsDataUrl,
  sanitizeAuditRemark,
};
export type { AuthStatusMeta };

/** sessionStorage：最近一次个人认证 authId */
export const PERSONAL_AUTH_ID_KEY = 'portal-personal-auth-id';

/** 个人认证材料上传字段（上传接口待接入） */
export type PersonalCertFileKey = 'idCardBack' | 'idCardFront';

/** 手机号（与 OpenAPI phone pattern 对齐） */
export const PHONE_PATTERN = /^1[3-9]\d{9}$/;

/** 个人认证申请表单（与提交接口字段对齐） */
export interface PersonalCertForm {
  /** 真实姓名 */
  realName: string;
  /** 联系电话 */
  phone: string;
  /** 身份证号 */
  idCardNo: string;
  /**
   * 身份证正面 URL
   * TODO: 接入上传接口后改为服务端返回的 URL；当前仅本地预览占位
   */
  idCardFront: string;
  /**
   * 身份证背面 URL
   * TODO: 接入上传接口后改为服务端返回的 URL；当前仅本地预览占位
   */
  idCardBack: string;
}

/**
 * 创建空的个人认证申请表单
 * @returns 表单初值
 */
export function createPersonalCertForm(): PersonalCertForm {
  return {
    realName: '',
    phone: '',
    idCardNo: '',
    idCardFront: '',
    idCardBack: '',
  };
}

/**
 * 根据认证状态生成展示文案与步骤（个人认证文案）
 * @param status 归一化后的状态
 * @param auditRemark 审核备注（仅驳回时用于副提示）
 * @returns 状态元数据
 */
export function buildPersonalAuthStatusMeta(
  status: 'approved' | 'draft' | 'rejected' | 'reviewing',
  auditRemark?: string,
): AuthStatusMeta {
  const remark = sanitizeAuditRemark(auditRemark);

  switch (status) {
    case 'approved': {
      return {
        label: $t('page.mine.register.person.status.approved'),
        tagClass: 'success',
        step: 3,
        tip: $t('page.mine.register.person.status.approvedTip'),
        sub: $t('page.mine.register.person.status.approvedSub'),
      };
    }
    case 'rejected': {
      return {
        label: $t('page.mine.register.person.status.rejected'),
        tagClass: 'danger',
        step: 1,
        tip: $t('page.mine.register.person.status.rejectedTip'),
        sub: remark || $t('page.mine.register.person.status.rejectedSub'),
      };
    }
    case 'reviewing': {
      return {
        label: $t('page.mine.register.person.status.reviewing'),
        tagClass: 'warning',
        step: 2,
        tip: $t('page.mine.register.person.status.reviewingTip'),
        sub: $t('page.mine.register.person.status.reviewingSub'),
      };
    }
    default: {
      return {
        label: $t('page.mine.register.person.status.draft'),
        tagClass: 'info',
        step: 0,
        tip: $t('page.mine.register.person.status.draftTip'),
        sub: $t('page.mine.register.person.status.draftSub'),
      };
    }
  }
}

/**
 * 读取本地缓存的个人认证 authId
 * @returns authId 或空串
 */
export function readCachedPersonalAuthId(): string {
  try {
    return String(sessionStorage.getItem(PERSONAL_AUTH_ID_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

/**
 * 写入本地缓存的个人认证 authId
 * @param authId 认证 ID
 */
export function saveCachedPersonalAuthId(authId: string) {
  const text = String(authId ?? '').trim();
  if (isEmpty(text)) {
    clearCachedPersonalAuthId();
    return;
  }
  try {
    sessionStorage.setItem(PERSONAL_AUTH_ID_KEY, text);
  } catch {
    // 忽略存储失败
  }
}

/**
 * 清除本地缓存的个人认证 authId
 */
export function clearCachedPersonalAuthId() {
  try {
    sessionStorage.removeItem(PERSONAL_AUTH_ID_KEY);
  } catch {
    // 忽略清除失败
  }
}

/**
 * 校验认证材料文件类型与大小（文案走个人认证语言包）
 * @param file 原始文件
 * @returns 通过返回 true，否则返回已翻译错误文案
 */
export function validatePersonalCertFile(file: File): string | true {
  const mimeOk = CERT_IMAGE_TYPES.includes(
    file.type as (typeof CERT_IMAGE_TYPES)[number],
  );
  const extOk = /\.(jpe?g|png)$/i.test(file.name);
  if (!mimeOk && !extOk) {
    return $t('page.mine.register.person.message.fileTypeInvalid');
  }
  if (file.size / 1024 / 1024 > CERT_FILE_MAX_MB) {
    return $t('page.mine.register.person.message.fileSizeInvalid', [
      CERT_FILE_MAX_MB,
    ]);
  }
  return true;
}
