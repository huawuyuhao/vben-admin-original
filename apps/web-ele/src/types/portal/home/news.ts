/**
 * 门户行业资讯（portal_news）
 * GET /portal/news、GET /portal/news/{id}
 */
export interface PortalNews {
  /** 资讯 ID */
  newsId: number;
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
  status?: number;
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: number;
  /** 更新时间 */
  updateTime?: string;
  /** 租户编号 */
  tenantId?: string;
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
