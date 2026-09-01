import type {
  MessageItem,
  MessageListResult,
  MessageReadStatus,
  MessageStatisticsItem,
  MessageType,
} from '#/types/mine/messages/all';

import { formatDate, isEmpty } from '@vben/utils';

/** 消息列表默认每页条数 */
export const MESSAGE_PAGE_SIZE = 10;

/** 可选每页条数（供 el-pagination） */
export const MESSAGE_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 需求消息 */
export const MESSAGE_TYPE_DEMAND = 1 as MessageType;

/** 认证消息 */
export const MESSAGE_TYPE_AUTH = 2 as MessageType;

/** 子账号消息 */
export const MESSAGE_TYPE_SUBACCOUNT = 3 as MessageType;

/** 系统消息 */
export const MESSAGE_TYPE_SYSTEM = 4 as MessageType;

/** 全部消息类型（固定顺序） */
export const MESSAGE_TYPE_OPTIONS = [
  MESSAGE_TYPE_DEMAND,
  MESSAGE_TYPE_AUTH,
  MESSAGE_TYPE_SUBACCOUNT,
  MESSAGE_TYPE_SYSTEM,
] as const;

/** 未读 */
export const MESSAGE_READ_UNREAD = 0 as MessageReadStatus;

/** 已读 */
export const MESSAGE_READ_READ = 1 as MessageReadStatus;

/** 分类 Tab：空串表示全部 */
export type MessageTypeFilter = '' | `${MessageType}`;

/** 已读筛选：空串表示全部 */
export type MessageReadFilter =
  | ''
  | `${typeof MESSAGE_READ_READ}`
  | `${typeof MESSAGE_READ_UNREAD}`;

/** 分类 Tab 展示项 */
export interface MessageCategoryTab {
  /** Tab 键：空串为全部，否则为消息类型数字串 */
  key: MessageTypeFilter;
  /** 消息类型；全部时为 undefined */
  messageType?: MessageType;
  /** 总数 */
  count: number;
  /** 未读数 */
  unreadCount: number;
}

/**
 * 解析消息类型筛选值为接口参数
 * @param type 筛选值
 * @returns 合法类型数字；全部时返回 undefined
 */
export function parseMessageTypeFilter(
  type: MessageTypeFilter,
): MessageType | undefined {
  if (isEmpty(type)) {
    return undefined;
  }
  const num = Number(type);
  if (
    num === MESSAGE_TYPE_DEMAND ||
    num === MESSAGE_TYPE_AUTH ||
    num === MESSAGE_TYPE_SUBACCOUNT ||
    num === MESSAGE_TYPE_SYSTEM
  ) {
    return num;
  }
  return undefined;
}

/**
 * 解析已读筛选值为接口参数
 * @param status 筛选值
 * @returns 0/1；全部时返回 undefined
 */
export function parseMessageReadFilter(
  status: MessageReadFilter,
): MessageReadStatus | undefined {
  if (isEmpty(status)) {
    return undefined;
  }
  const num = Number(status);
  if (num === MESSAGE_READ_UNREAD || num === MESSAGE_READ_READ) {
    return num;
  }
  return undefined;
}

/**
 * 获取消息类型对应的 i18n 键
 * @param type 消息类型
 * @returns 语言包键
 */
export function getMessageTypeI18nKey(type?: number): string {
  switch (type) {
    case MESSAGE_TYPE_DEMAND: {
      return 'page.mine.messages.all.types.demand';
    }
    case MESSAGE_TYPE_AUTH: {
      return 'page.mine.messages.all.types.auth';
    }
    case MESSAGE_TYPE_SUBACCOUNT: {
      return 'page.mine.messages.all.types.subaccount';
    }
    case MESSAGE_TYPE_SYSTEM: {
      return 'page.mine.messages.all.types.system';
    }
    default: {
      return 'page.mine.messages.all.types.unknown';
    }
  }
}

/**
 * 获取消息类型标签颜色
 * @param type 消息类型
 * @returns Element Plus Tag type
 */
export function getMessageTypeTagType(
  type?: number,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' {
  switch (type) {
    case MESSAGE_TYPE_DEMAND: {
      return 'success';
    }
    case MESSAGE_TYPE_AUTH: {
      return 'warning';
    }
    case MESSAGE_TYPE_SUBACCOUNT: {
      return 'primary';
    }
    case MESSAGE_TYPE_SYSTEM: {
      return 'info';
    }
    default: {
      return 'info';
    }
  }
}

/**
 * 是否未读
 * @param isRead 已读标记
 * @returns 未读返回 true
 */
export function isMessageUnread(isRead?: number): boolean {
  return Number(isRead) !== MESSAGE_READ_READ;
}

/**
 * 解析消息 ID
 * @param item 消息条目
 * @returns 合法 ID；无效返回 null
 */
export function resolveMessageId(item?: null | MessageItem): null | number {
  const id = Number(item?.messageId);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return id;
}

/**
 * 格式化时间展示
 * @param value 原始时间
 * @returns 格式化字符串；无效返回空串
 */
export function formatMessageDateTime(value?: string): string {
  if (isEmpty(value?.trim())) {
    return '';
  }
  try {
    return formatDate(value!, 'YYYY-MM-DD HH:mm:ss') || value!.trim();
  } catch {
    return value!.trim();
  }
}

/**
 * 展示字段值；空则回退占位
 * @param value 原始值
 * @param emptyText 占位文案
 * @returns 展示字符串
 */
export function displayMessageValue(
  value: null | number | string | undefined,
  emptyText: string,
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return isEmpty(text) ? emptyText : text;
}

/**
 * 归一化消息列表分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeMessagePage(data?: null | MessageListResult): {
  current: number;
  records: MessageItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || MESSAGE_PAGE_SIZE),
  };
}

/**
 * 根据统计接口构建分类 Tab（含「全部」）
 * @param stats 统计列表
 * @returns Tab 列表
 */
export function buildMessageCategoryTabs(
  stats?: null | MessageStatisticsItem[],
): MessageCategoryTab[] {
  const map = new Map<number, MessageStatisticsItem>();
  for (const item of stats ?? []) {
    const type = Number(item.messageType);
    if (Number.isFinite(type)) {
      map.set(type, item);
    }
  }

  let totalCount = 0;
  let totalUnread = 0;
  const typeTabs: MessageCategoryTab[] = MESSAGE_TYPE_OPTIONS.map((type) => {
    const hit = map.get(type);
    const count = Math.max(0, Number(hit?.count) || 0);
    const unreadCount = Math.max(0, Number(hit?.unreadCount) || 0);
    totalCount += count;
    totalUnread += unreadCount;
    return {
      key: String(type) as MessageTypeFilter,
      messageType: type,
      count,
      unreadCount,
    };
  });

  return [
    {
      key: '',
      count: totalCount,
      unreadCount: totalUnread,
    },
    ...typeTabs,
  ];
}
