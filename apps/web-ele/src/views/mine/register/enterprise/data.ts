import type { EnterpriseAuthStatus } from '#/types/mine/register/enterprise';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

/** sessionStorage：最近一次企业认证 authId */
export const ENTERPRISE_AUTH_ID_KEY = 'portal-enterprise-auth-id';

/** 认证材料上传字段 */
export type CertFileKey = 'businessLicense' | 'idCardBack' | 'idCardFront';

/** 企业认证申请表单（与提交接口字段对齐；enterpriseId 提交时转 number） */
export interface EnterpriseCertForm {
  /** 企业 ID（表单字符串，提交转 int64） */
  enterpriseId: string;
  /** 法人姓名 */
  legalPersonName: string;
  /** 身份证号 */
  idCardNo: string;
  /** 身份证正面 URL */
  idCardFront: string;
  /** 身份证背面 URL */
  idCardBack: string;
  /** 营业执照 URL */
  businessLicense: string;
}

/** 状态展示元数据 */
export interface AuthStatusMeta {
  /** 状态标签 */
  label: string;
  /** 标签样式修饰 */
  tagClass: 'danger' | 'info' | 'success' | 'warning';
  /** 步骤进度 0-3 */
  step: number;
  /** 主提示 */
  tip: string;
  /** 副提示 */
  sub: string;
}

/** 18 位身份证号（与 OpenAPI idCardNo pattern 对齐） */
export const ID_CARD_PATTERN =
  /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;

/** 允许的图片 MIME */
export const CERT_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

/** 单文件大小上限（MB） */
export const CERT_FILE_MAX_MB = 10;

/**
 * 创建空的认证申请表单
 * @param enterpriseId 可选默认企业 ID（表单内用字符串，提交时转 number）
 * @returns 表单初值
 */
export function createCertForm(enterpriseId = ''): EnterpriseCertForm {
  return {
    enterpriseId,
    legalPersonName: '',
    idCardNo: '',
    idCardFront: '',
    idCardBack: '',
    businessLicense: '',
  };
}

/**
 * 将接口 authStatus（integer / 文案）归一化为页面使用的标准状态
 * 约定：0 未提交，1 审核中，2 已通过，3 已驳回
 * @param status 接口返回的状态值
 * @returns draft | reviewing | approved | rejected
 */
export function normalizeAuthStatus(
  status?: EnterpriseAuthStatus | null,
): 'approved' | 'draft' | 'rejected' | 'reviewing' {
  if (status === null || status === undefined || status === '') {
    return 'draft';
  }

  // 优先按整型约定解析
  const num = typeof status === 'number' ? status : Number(status);
  if (!Number.isNaN(num) && String(status).trim() !== '') {
    switch (num) {
      case 0: {
        return 'draft';
      }
      case 1: {
        return 'reviewing';
      }
      case 2: {
        return 'approved';
      }
      case 3: {
        return 'rejected';
      }
      default: {
        break;
      }
    }
  }

  const raw = String(status).trim().toLowerCase();

  if (
    ['approved', 'passed', 'success', '已认证', '已通过', '通过'].includes(
      raw,
    ) ||
    raw.includes('pass') ||
    raw.includes('approv')
  ) {
    return 'approved';
  }

  if (
    ['failed', 'reject', 'rejected', '已驳回', '未通过', '驳回'].includes(
      raw,
    ) ||
    raw.includes('reject') ||
    raw.includes('fail')
  ) {
    return 'rejected';
  }

  if (
    [
      'audit',
      'auditing',
      'pending',
      'reviewing',
      '审核中',
      '待审核',
    ].includes(raw) ||
    raw.includes('review') ||
    raw.includes('audit') ||
    raw.includes('pend')
  ) {
    return 'reviewing';
  }

  return 'draft';
}

/**
 * 过滤无效审核备注（如 Mock 占位 string / null）
 * @param remark 原始备注
 * @returns 有效备注或空串
 */
export function sanitizeAuditRemark(remark?: null | string): string {
  const text = String(remark ?? '').trim();
  const placeholders = new Set([
    '-',
    'n/a',
    'none',
    'null',
    'string',
    'undefined',
  ]);
  if (!text || placeholders.has(text.toLowerCase())) {
    return '';
  }
  return text;
}

/**
 * 根据认证状态生成展示文案与步骤
 * @param status 归一化后的状态
 * @param auditRemark 审核备注（仅驳回时用于副提示）
 * @returns 状态元数据
 */
export function buildAuthStatusMeta(
  status: 'approved' | 'draft' | 'rejected' | 'reviewing',
  auditRemark?: string,
): AuthStatusMeta {
  const remark = sanitizeAuditRemark(auditRemark);

  switch (status) {
    case 'approved': {
      return {
        label: $t('page.mine.register.enterprise.status.approved'),
        tagClass: 'success',
        step: 3,
        tip: $t('page.mine.register.enterprise.status.approvedTip'),
        sub: $t('page.mine.register.enterprise.status.approvedSub'),
      };
    }
    case 'rejected': {
      return {
        label: $t('page.mine.register.enterprise.status.rejected'),
        tagClass: 'danger',
        step: 1,
        tip: $t('page.mine.register.enterprise.status.rejectedTip'),
        sub: remark || $t('page.mine.register.enterprise.status.rejectedSub'),
      };
    }
    case 'reviewing': {
      return {
        label: $t('page.mine.register.enterprise.status.reviewing'),
        tagClass: 'warning',
        step: 2,
        tip: $t('page.mine.register.enterprise.status.reviewingTip'),
        sub: $t('page.mine.register.enterprise.status.reviewingSub'),
      };
    }
    default: {
      return {
        label: $t('page.mine.register.enterprise.status.draft'),
        tagClass: 'info',
        step: 0,
        tip: $t('page.mine.register.enterprise.status.draftTip'),
        sub: $t('page.mine.register.enterprise.status.draftSub'),
      };
    }
  }
}

/**
 * 读取本地缓存的 authId
 * @returns authId 或空串
 */
export function readCachedAuthId(): string {
  try {
    return String(sessionStorage.getItem(ENTERPRISE_AUTH_ID_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

/**
 * 写入本地缓存的 authId
 * @param authId 认证 ID
 */
export function saveCachedAuthId(authId: string) {
  const text = String(authId ?? '').trim();
  if (isEmpty(text)) {
    clearCachedAuthId();
    return;
  }
  try {
    sessionStorage.setItem(ENTERPRISE_AUTH_ID_KEY, text);
  } catch {
    // 忽略存储失败
  }
}

/**
 * 清除本地缓存的 authId
 */
export function clearCachedAuthId() {
  try {
    sessionStorage.removeItem(ENTERPRISE_AUTH_ID_KEY);
  } catch {
    // 忽略清除失败
  }
}

/**
 * 校验认证材料文件类型与大小
 * @param file 原始文件
 * @returns 通过返回 true，否则返回错误文案 key 对应的已翻译文案
 */
export function validateCertFile(file: File): string | true {
  const mimeOk = CERT_IMAGE_TYPES.includes(
    file.type as (typeof CERT_IMAGE_TYPES)[number],
  );
  const extOk = /\.(jpe?g|png)$/i.test(file.name);
  // 部分浏览器拖拽时 file.type 为空，回退用扩展名判断
  if (!mimeOk && !extOk) {
    return $t('page.mine.register.enterprise.message.fileTypeInvalid');
  }
  if (file.size / 1024 / 1024 > CERT_FILE_MAX_MB) {
    return $t('page.mine.register.enterprise.message.fileSizeInvalid', [
      CERT_FILE_MAX_MB,
    ]);
  }
  return true;
}
