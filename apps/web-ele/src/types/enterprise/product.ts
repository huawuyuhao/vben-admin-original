/**
 * 算力产品上下架状态（0-下架 1-上架）
 */
export type SupplyProductShelfStatus = 0 | 1;

/**
 * 算力产品资源状态（0-离线/不可用 1-在线/正常 2-异常/告警）
 */
export type SupplyProductResourceStatus = 0 | 1 | 2;

/**
 * 上下架操作类型
 * PUT /supply/product/{id}/shelf · action
 */
export type SupplyProductShelfAction = 'shelf' | 'unshelf';

/**
 * 算力供给产品条目
 * GET /supply/product/list · supply_product
 */
export interface SupplyProductItem {
  /** 供给产品 ID */
  supplyProductId?: number;
  /** 企业 ID */
  enterpriseId?: number;
  /** 产品名称 */
  productName?: string;
  /** 产品描述 */
  description?: string;
  /** 上下架状态（0-下架 1-上架） */
  shelfStatus?: SupplyProductShelfStatus | number;
  /** 资源状态（0-离线 1-在线 2-异常） */
  resourceStatus?: SupplyProductResourceStatus | number;
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
 * 算力产品列表查询参数
 * GET /supply/product/list
 */
export interface SupplyProductListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 产品名称（可选，模糊搜索） */
  productName?: string;
  /** 上下架状态（可选，0-下架 1-上架） */
  shelfStatus?: SupplyProductShelfStatus;
}

/**
 * 新增 / 编辑算力产品参数
 * POST /supply/product · PUT /supply/product/{id}
 */
export interface SupplyProductWriteParams {
  /** 产品名称 */
  productName: string;
  /** 产品描述（可选） */
  description?: string;
}

/**
 * 资源状态监测结果
 * GET /supply/product/{id}/resource-status · data
 */
export interface SupplyProductResourceStatusResult {
  /** 资源状态（0-离线 1-在线 2-异常） */
  resourceStatus?: SupplyProductResourceStatus | number;
}

/**
 * 算力产品列表分页结果
 * 文档返参为扁平结构：与 code/msg 同级的 records / total / current / size
 */
export interface SupplyProductListResult<T = SupplyProductItem> {
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
 * 算力产品列表响应体（扁平分页 + code/msg）
 */
export interface SupplyProductListResponseBody<T = SupplyProductItem> {
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
 * 写操作 / 监测通用响应
 */
export interface SupplyProductMutationResponse {
  code?: number;
  msg?: string;
  data?:
    | string
    | {
        key?: number | string;
        resourceStatus?: SupplyProductResourceStatus | number;
      };
}
