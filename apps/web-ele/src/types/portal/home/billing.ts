/**
 * 门户计费说明（portal_billing_info）
 * GET /portal/billing
 */
export interface PortalBillingInfo {
  /** 计费 ID */
  billingId: number;
  /** 标题 */
  title: string;
  /** 内容 */
  content?: string;
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
