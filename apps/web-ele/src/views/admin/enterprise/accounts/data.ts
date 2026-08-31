import type {
  SubAccountItem,
  SubAccountListResult,
  SubAccountStatus,
} from '#/types/admin/enterprise/accounts';

import { formatDate, isEmpty, isHttpUrl } from '@vben/utils';
import { $t } from '@vben/locales';

/** 列表默认每页条数 */
export const SUB_ACCOUNT_PAGE_SIZE = 10;

/** 可选每页条数 */
export const SUB_ACCOUNT_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 停用 */
export const SUB_ACCOUNT_STATUS_DISABLED = 0 as SubAccountStatus;

/** 启用 */
export const SUB_ACCOUNT_STATUS_ENABLED = 1 as SubAccountStatus;

/** 状态筛选：空串表示全部 */
export type SubAccountStatusFilter =
  | ''
  | `${typeof SUB_ACCOUNT_STATUS_DISABLED}`
  | `${typeof SUB_ACCOUNT_STATUS_ENABLED}`;

/** 可分配菜单树节点（对接 menuIds；无菜单列表接口时本地维护） */
export interface AssignableMenuNode {
  /** 菜单 ID */
  id: number;
  /** i18n 键后缀（page.admin.enterprise.accounts.menus.*） */
  labelKey: string;
  /** 子菜单 */
  children?: AssignableMenuNode[];
}

/**
 * 可分配菜单树定义（与后端菜单 ID 对齐；后续若有菜单接口可替换）
 */
export const ASSIGNABLE_MENU_TREE: AssignableMenuNode[] = [
  {
    id: 2000,
    labelKey: 'enterpriseCenter',
    children: [
      { id: 2001, labelKey: 'enterpriseInfo' },
      { id: 2002, labelKey: 'enterpriseAccounts' },
      { id: 2003, labelKey: 'enterpriseStats' },
    ],
  },
  {
    id: 2100,
    labelKey: 'service',
    children: [
      { id: 2101, labelKey: 'product' },
      { id: 2102, labelKey: 'myDemand' },
      { id: 2103, labelKey: 'supply' },
    ],
  },
  {
    id: 2200,
    labelKey: 'mine',
    children: [
      { id: 2201, labelKey: 'profile' },
      { id: 2202, labelKey: 'loginLog' },
      { id: 2203, labelKey: 'feedback' },
    ],
  },
];

/**
 * 生成带文案的菜单树（供 el-tree 使用）
 * @returns 含 label 的树节点
 */
export function buildAssignableMenuTree() {
  const mapNode = (node: AssignableMenuNode): {
    children?: ReturnType<typeof mapNode>[];
    id: number;
    label: string;
  } => ({
    id: node.id,
    label: $t(`page.admin.enterprise.accounts.menus.${node.labelKey}`),
    children: node.children?.map((child) => mapNode(child)),
  });
  return ASSIGNABLE_MENU_TREE.map((node) => mapNode(node));
}

/** 手机号校验 */
export const PHONE_PATTERN = /^(?:0|86|\+86)?1[3-9]\d{9}$/;

/**
 * 密码强度：至少 8 位，含大小写、数字与特殊字符
 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * 解析状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态数字；全部时返回 undefined
 */
export function parseSubAccountStatusFilter(
  status?: null | SubAccountStatusFilter,
): SubAccountStatus | undefined {
  if (status === String(SUB_ACCOUNT_STATUS_DISABLED)) {
    return SUB_ACCOUNT_STATUS_DISABLED;
  }
  if (status === String(SUB_ACCOUNT_STATUS_ENABLED)) {
    return SUB_ACCOUNT_STATUS_ENABLED;
  }
  return undefined;
}

/**
 * 归一化分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeSubAccountPage(data?: null | SubAccountListResult): {
  current: number;
  records: SubAccountItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || SUB_ACCOUNT_PAGE_SIZE),
  };
}

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 年月日时分；无效返回空串
 */
export function formatSubAccountDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 格式化有效期日期
 * @param time 日期字符串
 * @returns 年月日；无效返回空串
 */
export function formatSubAccountExpireDate(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD');
}

/**
 * 判断有效期是否已过期（当天结束前仍有效）
 * @param expireDate 有效期 yyyy-MM-dd
 * @returns 已过期返回 true
 */
export function isSubAccountExpired(expireDate?: string): boolean {
  const text = expireDate?.trim();
  if (isEmpty(text)) {
    return false;
  }
  const formatted = formatDate(text, 'YYYY-MM-DD');
  if (isEmpty(formatted)) {
    return false;
  }
  const today = formatDate(new Date(), 'YYYY-MM-DD');
  return formatted < today;
}

/**
 * 状态文案 i18n 键后缀
 * @param status 状态码
 * @returns enabled / disabled / unknown
 */
export function getSubAccountStatusI18nKey(
  status?: null | number,
): 'disabled' | 'enabled' | 'unknown' {
  const value = Number(status);
  if (value === SUB_ACCOUNT_STATUS_ENABLED) {
    return 'enabled';
  }
  if (value === SUB_ACCOUNT_STATUS_DISABLED) {
    return 'disabled';
  }
  return 'unknown';
}

/**
 * 状态标签类型
 * @param status 状态码
 * @returns Element Plus Tag type
 */
export function getSubAccountStatusTagType(
  status?: null | number,
): 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === SUB_ACCOUNT_STATUS_ENABLED) {
    return 'success';
  }
  if (value === SUB_ACCOUNT_STATUS_DISABLED) {
    return 'warning';
  }
  return 'info';
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位文案
 * @returns 展示文本
 */
export function displaySubAccountValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 将菜单 ID 数组转为接口所需逗号分隔字符串
 * @param ids 菜单 ID 列表
 * @returns 逗号分隔字符串
 */
export function joinMenuIds(ids: Array<number | string>): string {
  return ids
    .map((id) => String(id).trim())
    .filter(Boolean)
    .join(',');
}

/**
 * 将导出接口返参解析为可下载 URL
 * @param value 接口 data.fileUrl
 * @returns 可下载地址；无法识别时 undefined
 */
export function resolveSubAccountExportDownloadUrl(
  value?: null | string,
): string | undefined {
  const text = value?.trim();
  if (!text) {
    return undefined;
  }
  if (isHttpUrl(text)) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return undefined;
}

/**
 * 状态选项（表单用）
 * @returns 启用 / 停用选项
 */
export function getSubAccountStatusOptions() {
  return [
    {
      label: $t('page.admin.enterprise.accounts.status.enabled'),
      value: SUB_ACCOUNT_STATUS_ENABLED,
    },
    {
      label: $t('page.admin.enterprise.accounts.status.disabled'),
      value: SUB_ACCOUNT_STATUS_DISABLED,
    },
  ] as const;
}
