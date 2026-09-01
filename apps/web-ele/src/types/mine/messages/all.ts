/**
 * 消息类型
 * 1-需求消息 2-认证消息 3-子账号消息 4-系统消息
 */
export type MessageType = 1 | 2 | 3 | 4;

/**
 * 已读状态
 * 0-未读 1-已读
 */
export type MessageReadStatus = 0 | 1;

/**
 * 消息通知条目
 * GET /message/list · message_info
 */
export interface MessageItem {
  /** 消息 ID */
  messageId?: number;
  /** 消息类型 */
  messageType?: MessageType | number;
  /** 消息标题 */
  title?: string;
  /** 消息内容 */
  content?: string;
  /** 接收用户 ID */
  userId?: number;
  /** 是否已读（0-未读 1-已读） */
  isRead?: MessageReadStatus | number;
  /** 阅读时间 */
  readTime?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 更新者 */
  updateBy?: number;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 消息列表查询参数
 * GET /message/list
 */
export interface MessageListParams {
  /** 页码（默认 1） */
  page: number;
  /** 每页条数（默认 10） */
  pageSize: number;
  /** 消息类型（可选） */
  messageType?: MessageType | number;
  /** 是否已读（可选，0-未读 1-已读） */
  isRead?: MessageReadStatus | number;
}

/**
 * 消息统计条目
 * GET /message/statistics · data[]
 */
export interface MessageStatisticsItem {
  /** 消息类型 */
  messageType?: MessageType | number;
  /** 类型描述 */
  messageTypeDesc?: string;
  /** 该类消息总数 */
  count?: number;
  /** 该类未读数 */
  unreadCount?: number;
}

/**
 * 消息列表分页结果
 */
export interface MessageListResult<T = MessageItem> {
  /** 当前页列表 */
  records: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 消息列表响应体（扁平分页 + code/msg）
 */
export interface MessageListResponseBody<T = MessageItem> {
  code?: number;
  msg?: string;
  total?: number;
  records?: T[];
  current?: number;
  size?: number;
  data?:
    | T[]
    | {
        current?: number;
        records?: T[];
        size?: number;
        total?: number;
      };
}

/**
 * 写操作 / 详情 / 统计通用响应
 */
export interface MessageMutationResponse<T = unknown> {
  code?: number;
  msg?: string;
  data?: T;
}
