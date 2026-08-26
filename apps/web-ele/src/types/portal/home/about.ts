/**
 * 门户关于我们（portal_about_us）
 * GET /portal/about-us
 */
export interface PortalAboutUs {
  /** ID */
  aboutId: number;
  /** 标题 */
  title: string;
  /** 内容 */
  content?: string;
  /** 图片 URL */
  imageUrl?: string;
  /** 排序（升序优先） */
  sortOrder?: number;
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
