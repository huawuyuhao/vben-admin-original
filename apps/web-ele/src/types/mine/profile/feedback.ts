/**
 * 意见反馈处理状态（0-待处理 1-处理中 2-已处理）
 */
export type FeedbackStatus = 0 | 1 | 2;

/**
 * 意见反馈条目
 * GET /feedback/list · records[]
 */
export interface FeedbackItem {
  /** 反馈 ID */
  feedbackId?: number;
  /** 用户 ID */
  userId?: number;
  /** 反馈内容 */
  content?: string;
  /** 图片 URL（多个用逗号分隔） */
  images?: string;
  /** 处理状态（0-待处理 1-处理中 2-已处理） */
  status?: FeedbackStatus | number;
  /** 回复内容 */
  replyContent?: string;
  /** 回复时间 */
  replyTime?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建者 */
  createBy?: number;
  /** 更新者 */
  updateBy?: number;
  /** 创建部门 */
  createDept?: number;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 意见反馈列表查询参数
 * GET /feedback/list
 */
export interface FeedbackListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 处理状态（可选） */
  status?: FeedbackStatus;
}

/**
 * 提交意见反馈参数
 * POST /feedback（query）
 */
export interface FeedbackSubmitParams {
  /** 反馈内容 */
  content: string;
  /** 图片 URL 列表（多个用逗号分隔） */
  images?: string;
}

/**
 * 意见反馈分页结果
 */
export interface FeedbackListResult<T = FeedbackItem> {
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
 * 意见反馈列表响应体（扁平分页 + code/msg，兼容 data 包裹）
 */
export interface FeedbackListResponseBody<T = FeedbackItem> {
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
 * 提交意见反馈响应
 */
export interface FeedbackMutationResponse {
  code?: number;
  msg?: string;
  data?: string;
}
