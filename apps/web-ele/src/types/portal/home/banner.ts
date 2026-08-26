/**
 * 门户轮播图（portal_banner）
 * GET /portal/banners
 */
export interface PortalBanner {
  /** 轮播图 ID */
  bannerId: number;
  /** 轮播图标题 */
  title?: string;
  /** 图片 URL */
  imageUrl: string;
  /** 跳转链接（站内 path 或 http(s)） */
  linkUrl?: string;
  /** 排序（升序优先） */
  sortOrder?: number;
  /** 状态（0-停用 1-启用） */
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
