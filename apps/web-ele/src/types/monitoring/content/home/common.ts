/**
 * 门户内容类型（GET /admin/content/portal 入参 content）
 */
export type PortalContentType =
  | 'about'
  | 'banner'
  | 'billing'
  | 'news'
  | 'service';

/**
 * 门户内容统一视图对象
 * 包含 banner / news / service / billing / about 全部字段，按 contentType 与非空字段渲染
 */
export interface PortalContentItem {
  /** 内容 ID（统一主键） */
  contentId: number;
  /** 内容类型 */
  contentType?: PortalContentType | string;
  /** 标题 */
  title?: string;
  /** 内容（富文本/大文本） */
  content?: string;
  /** 图片 URL（banner / service / about） */
  imageUrl?: string;
  /** 跳转链接（banner） */
  linkUrl?: string;
  /** 排序（banner / service / billing / about） */
  sortOrder?: number;
  /** 状态（banner / news / service：0-停用 1-启用） */
  status?: number;
  /** 审核状态（0-待审核 1-已通过 2-已驳回；billing/about 可能为 null） */
  auditStatus?: null | number;
  /** 摘要（news） */
  summary?: string;
  /** 封面图（news） */
  coverImage?: string;
  /** 发布时间（news） */
  publishTime?: string;
  /** 浏览次数（news） */
  viewCount?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 门户内容列表分页查询参数
 * GET /admin/content/portal
 */
export interface PortalContentListParams {
  /** 内容类型枚举 */
  content: PortalContentType;
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
}

/**
 * 门户内容列表分页结果
 */
export interface PortalContentListResult {
  /** 当前页列表 */
  records: PortalContentItem[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 门户内容列表原始响应体（扁平分页 + code/msg；兼容 data 包裹）
 */
export interface PortalContentListResponseBody
  extends Partial<PortalContentListResult> {
  code?: number;
  msg?: string;
  /** 兼容旧版：分页包在 data 内，或 data 直接为数组 */
  data?: PortalContentItem[] | PortalContentListResult;
}

/**
 * 门户内容新增/修改共用请求体
 * POST /admin/content/portal · PUT /admin/content/portal/{id}
 */
export interface PortalContentWriteParams {
  /** 内容类型枚举 */
  content: PortalContentType;
  /** 标题 */
  title: string;
  /** 内容（大文本） */
  contentText?: string;
  /** 图片 URL */
  imageUrl?: string;
  /** 排序（默认 0，值越小越靠前） */
  sortOrder: number;
}

/**
 * 新增门户内容请求体
 * POST /admin/content/portal
 */
export type PortalContentCreateParams = PortalContentWriteParams;

/**
 * 删除门户内容参数
 * DELETE /admin/content/portal/{id}
 */
export interface PortalContentDeleteParams {
  /** 内容类型枚举 */
  content: PortalContentType;
}

/**
 * 门户内容上下架操作类型
 * PUT /admin/content/product/{id}/shelf
 */
export type PortalContentShelfAction = 'shelf' | 'unshelf';

/**
 * 门户内容上下架请求体
 * PUT /admin/content/product/{id}/shelf
 */
export interface PortalContentShelfParams {
  /** 操作类型：shelf 上架 / unshelf 下架 */
  action: PortalContentShelfAction;
}

/**
 * 门户内容审核状态（0-待审核 1-已通过 2-已驳回）
 * PUT /admin/content/portal/{id}/audit
 */
export type PortalContentAuditStatus = 0 | 1 | 2;

/**
 * 门户内容审核请求体
 * PUT /admin/content/portal/{id}/audit
 */
export interface PortalContentAuditParams {
  /** 内容类型枚举 */
  content: PortalContentType;
  /** 审核状态 */
  auditStatus: PortalContentAuditStatus;
}

/**
 * 修改门户内容请求体
 * PUT /admin/content/portal/{id}
 */
export type PortalContentUpdateParams = PortalContentWriteParams;

/**
 * 新增门户内容响应 data
 */
export interface PortalContentCreateResult {
  /** 新建内容 ID */
  key: number;
}

/**
 * 写操作通用响应体
 */
export interface PortalContentMutationResponse {
  code?: number;
  msg?: string;
  data?: PortalContentCreateResult | string;
}
