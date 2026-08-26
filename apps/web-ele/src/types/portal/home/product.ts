/**
 * 门户推荐产品（product_info）
 * GET /portal/products/recommend
 */
export interface PortalProductRecommend {
  /** 产品 ID */
  productId: number;
  /** 产品名称 */
  productName: string;
  /** 产品简介 */
  description?: string;
  /** 产品图片 */
  imageUrl?: string;
  /** 绿电占比(%) */
  greenPowerRatio?: number;
  /** 价格 */
  price?: number;
  /** 推荐度 */
  recommendLevel?: number;
  /** 标签（多个用逗号分隔） */
  tags?: string;
  /** 供给企业 ID */
  enterpriseId?: number;
  /** 上下架状态（0-下架 1-上架） */
  shelfStatus?: number;
  /** 发布时间 */
  publishTime?: string;
  /** 审核状态（0-待审核 1-审核通过 2-审核不通过） */
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
