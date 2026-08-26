/**
 * 门户业务服务介绍（portal_service_intro）
 * GET /portal/services
 */
export interface PortalServiceIntro {
  /** 服务 ID */
  serviceId: number;
  /** 标题 */
  title: string;
  /** 内容 */
  content?: string;
  /** 图片 URL */
  imageUrl?: string;
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
