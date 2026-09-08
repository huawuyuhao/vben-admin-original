/**
 * 门户行业资讯（portal_news）
 * GET /portal/news、GET /portal/news/{id}
 */

/** 资讯主键（兼容数字与雪花字符串） */
export type PortalNewsId = number | string;

/**
 * 门户行业资讯条目
 */
export interface PortalNews {
  /** 资讯 ID（兼容数字与字符串雪花 ID） */
  newsId: PortalNewsId;
  /** 标题 */
  title: string;
  /** 摘要 */
  summary?: string;
  /** 内容（可为纯文本或 HTML） */
  content?: string;
  /** 封面图 */
  coverImage?: string;
  /** 发布时间 */
  publishTime?: string;
  /** 浏览次数 */
  viewCount?: number;
  /** 状态（0-草稿 1-已发布） */
  status?: number | string;
  /** 创建部门 */
  createDept?: number | string;
  /** 创建者 */
  createBy?: number | string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: number | string;
  /** 更新时间 */
  updateTime?: string;
  /** 租户编号 */
  tenantId?: string;
  /** 部分后端可能直接返回 id */
  id?: PortalNewsId;
}

/**
 * 行业资讯分页查询参数
 */
export interface PortalNewsPageParams {
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页大小 */
  pageSize: number;
}

/**
 * 行业资讯分页结果
 */
export interface PortalNewsPageResult {
  /** 当前页列表 */
  records: PortalNews[];
  /** 总记录数 */
  total?: number;
  /** 当前页码 */
  current?: number;
  /** 每页条数 */
  size?: number;
}
