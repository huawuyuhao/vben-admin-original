import type {
  EnterpriseAuthStatus,
  EnterpriseInfo,
  EnterpriseStatus,
  EnterpriseType,
} from '#/types/admin/enterprise/info';

import { isEmpty } from '@vben/utils';
import { $t } from '@vben/locales';

/** 资料分组 key */
export type EnterpriseInfoGroupKey = 'basic' | 'contact' | 'meta';

/** 展示行 */
export interface EnterpriseDisplayField {
  /** 字段标签 */
  label: string;
  /** 展示值 */
  value: string;
}

/** 分组后的资料块 */
export interface EnterpriseFieldGroup {
  /** 分组 key */
  key: EnterpriseInfoGroupKey;
  /** 分组标题 */
  title: string;
  /** 分组说明 */
  hint: string;
  /** 字段列表 */
  fields: EnterpriseDisplayField[];
}

/** 可编辑表单（对齐 PUT 入参） */
export interface EnterpriseEditForm {
  /** 联系电话 */
  contactPhone: string;
  /** 企业地址 */
  address: string;
}

/** 手机号校验 */
export const PHONE_PATTERN = /^(?:0|86|\+86)?1[3-9]\d{9}$/;

/**
 * 将空值统一展示为占位符
 * @param value 原始值
 * @returns 可展示字符串
 */
export function formatDisplayValue(value?: null | number | string): string {
  if (value === null || value === undefined) {
    return $t('page.admin.enterprise.info.valueEmpty');
  }
  const text = String(value).trim();
  return isEmpty(text) ? $t('page.admin.enterprise.info.valueEmpty') : text;
}

/**
 * 认证状态文案
 * @param status 认证状态码
 * @returns 文案
 */
export function formatAuthStatusLabel(
  status?: EnterpriseAuthStatus | number,
): string {
  if (status === null || status === undefined) {
    return $t('page.admin.enterprise.info.valueEmpty');
  }
  const map: Record<number, string> = {
    0: $t('page.admin.enterprise.info.authStatus.unauthenticated'),
    1: $t('page.admin.enterprise.info.authStatus.pending'),
    2: $t('page.admin.enterprise.info.authStatus.authenticated'),
    3: $t('page.admin.enterprise.info.authStatus.rejected'),
  };
  return map[Number(status)] ?? formatDisplayValue(status);
}

/**
 * 认证状态提示文案
 * @param status 认证状态码
 * @returns 提示
 */
export function formatAuthStatusTip(
  status?: EnterpriseAuthStatus | number,
): string {
  const map: Record<number, string> = {
    0: $t('page.admin.enterprise.info.authTip.unauthenticated'),
    1: $t('page.admin.enterprise.info.authTip.pending'),
    2: $t('page.admin.enterprise.info.authTip.authenticated'),
    3: $t('page.admin.enterprise.info.authTip.rejected'),
  };
  return map[Number(status)] ?? $t('page.admin.enterprise.info.authTip.unknown');
}

/**
 * 认证状态对应的 el-tag type
 * @param status 认证状态码
 * @returns Element Plus Tag type
 */
export function resolveAuthTagType(
  status?: EnterpriseAuthStatus | number,
): 'danger' | 'info' | 'success' | 'warning' {
  switch (Number(status)) {
    case 1: {
      return 'warning';
    }
    case 2: {
      return 'success';
    }
    case 3: {
      return 'danger';
    }
    default: {
      return 'info';
    }
  }
}

/**
 * 企业类型文案
 * @param type 企业类型码
 * @returns 文案
 */
export function formatEnterpriseTypeLabel(
  type?: EnterpriseType | number,
): string {
  if (type === null || type === undefined) {
    return $t('page.admin.enterprise.info.valueEmpty');
  }
  const map: Record<number, string> = {
    1: $t('page.admin.enterprise.info.enterpriseType.demand'),
    2: $t('page.admin.enterprise.info.enterpriseType.supply'),
  };
  return map[Number(type)] ?? formatDisplayValue(type);
}

/**
 * 启用状态文案
 * @param status 状态码
 * @returns 文案
 */
export function formatStatusLabel(status?: EnterpriseStatus | number): string {
  if (status === null || status === undefined) {
    return $t('page.admin.enterprise.info.valueEmpty');
  }
  const map: Record<number, string> = {
    0: $t('page.admin.enterprise.info.status.disabled'),
    1: $t('page.admin.enterprise.info.status.enabled'),
  };
  return map[Number(status)] ?? formatDisplayValue(status);
}

/**
 * 按业务语义分组生成企业信息展示块
 * @param info 企业信息
 * @returns 分组列表
 */
export function buildEnterpriseFieldGroups(
  info: null | EnterpriseInfo,
): EnterpriseFieldGroup[] {
  return [
    {
      key: 'basic',
      title: $t('page.admin.enterprise.info.groups.basic.title'),
      hint: $t('page.admin.enterprise.info.groups.basic.hint'),
      fields: [
        {
          label: $t('page.admin.enterprise.info.fields.enterpriseName'),
          value: formatDisplayValue(info?.enterpriseName),
        },
        {
          label: $t('page.admin.enterprise.info.fields.legalPerson'),
          value: formatDisplayValue(info?.legalPerson),
        },
        {
          label: $t('page.admin.enterprise.info.fields.creditCode'),
          value: formatDisplayValue(info?.creditCode),
        },
        {
          label: $t('page.admin.enterprise.info.fields.industry'),
          value: formatDisplayValue(info?.industry),
        },
        {
          label: $t('page.admin.enterprise.info.fields.enterpriseType'),
          value: formatEnterpriseTypeLabel(info?.enterpriseType),
        },
        {
          label: $t('page.admin.enterprise.info.fields.status'),
          value: formatStatusLabel(info?.status),
        },
      ],
    },
    {
      key: 'contact',
      title: $t('page.admin.enterprise.info.groups.contact.title'),
      hint: $t('page.admin.enterprise.info.groups.contact.hint'),
      fields: [
        {
          label: $t('page.admin.enterprise.info.fields.contactPhone'),
          value: formatDisplayValue(info?.contactPhone),
        },
        {
          label: $t('page.admin.enterprise.info.fields.contactEmail'),
          value: formatDisplayValue(info?.contactEmail),
        },
        {
          label: $t('page.admin.enterprise.info.fields.address'),
          value: formatDisplayValue(info?.address),
        },
      ],
    },
    {
      key: 'meta',
      title: $t('page.admin.enterprise.info.groups.meta.title'),
      hint: $t('page.admin.enterprise.info.groups.meta.hint'),
      fields: [
        {
          label: $t('page.admin.enterprise.info.fields.enterpriseId'),
          value: formatDisplayValue(info?.enterpriseId),
        },
        {
          label: $t('page.admin.enterprise.info.fields.tenantId'),
          value: formatDisplayValue(info?.tenantId),
        },
        {
          label: $t('page.admin.enterprise.info.fields.createTime'),
          value: formatDisplayValue(info?.createTime),
        },
        {
          label: $t('page.admin.enterprise.info.fields.updateTime'),
          value: formatDisplayValue(info?.updateTime),
        },
      ],
    },
  ];
}

/**
 * 从企业信息生成可编辑表单初值
 * @param info 企业信息
 * @returns 编辑表单
 */
export function createEditForm(info: null | EnterpriseInfo): EnterpriseEditForm {
  return {
    contactPhone: String(info?.contactPhone ?? ''),
    address: String(info?.address ?? ''),
  };
}
