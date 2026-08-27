/**
 * 案例类型（1-通算 2-智算）
 */
export type CaseType = 1 | 2;

/**
 * 案例列表视图对象
 * GET /case/list
 * 含 tags，不含 content 大文本，减少传输量
 */
export interface CaseListItem {
  /** 案例 ID */
  caseId: number;
  /** 标题 */
  title: string;
  /** 摘要 */
  summary?: string;
  /** 封面图 */
  coverImage?: string;
  /** 案例类型（1-通算 2-智算） */
  caseType?: CaseType | number;
  /** 浏览次数 */
  viewCount?: number;
  /** 创建时间 */
  createTime?: string;
  /** 标签名列表 */
  tags?: string[];
}

/**
 * 案例详情 / 关联推荐等完整信息
 * GET /case/{id}、GET /case/related
 */
export interface CaseInfo extends CaseListItem {
  /** 内容（可能为 HTML；详情接口返回，列表不含） */
  content?: string;
  /** 状态（0-草稿 1-已发布） */
  status?: number;
  /** 创建部门 */
  createDept?: number;
  /** 创建者 */
  createBy?: number;
  /** 更新者 */
  updateBy?: number;
  /** 更新时间 */
  updateTime?: string;
  /** 租户编号 */
  tenantId?: string;
}

/**
 * 案例列表分页查询参数
 * GET /case/list
 */
export interface CaseListParams {
  /** 当前页码（默认 1） */
  page: number;
  /** 每页大小（默认 10） */
  pageSize: number;
  /** 标签名称（可选，按标签过滤） */
  tagName?: string;
}

/**
 * 关联案例推荐查询参数
 * GET /case/related
 */
export interface CaseRelatedParams {
  /** 当前案例 ID */
  caseId: number;
  /** 标签名称（可选，不传则用 caseId 查案例标签） */
  tagName?: string;
}

/**
 * 案例列表分页结果
 * 文档返参为扁平结构：与 code/msg 同级的 records / total / current / size
 */
export interface CaseListResult<T = CaseListItem> {
  /** 当前页列表 */
  records: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
}

/**
 * 案例列表原始响应体（扁平分页 + 可选 code/msg；兼容旧版 data 包裹）
 */
export interface CaseListResponseBody<T = CaseListItem>
  extends Partial<CaseListResult<T>> {
  code?: number;
  msg?: string;
  /** 兼容旧版：分页包在 data 内，或 data 直接为数组 */
  data?: T[] | CaseListResult<T>;
}

/**
 * 案例详情接口响应体
 * GET /case/{id}
 */
export interface CaseDetailResponseBody {
  code?: number;
  msg?: string;
  data?: CaseInfo;
}

/**
 * 关联案例推荐接口响应体
 * GET /case/related
 */
export interface CaseRelatedResponseBody {
  code?: number;
  msg?: string;
  data?: CaseInfo[];
}

/**
 * 新增 / 修改案例参数（JSON body；tags 为逗号分隔）
 * POST /admin/case、PUT /admin/case/{id}
 */
export interface CaseWriteParams {
  /** 标题 */
  title: string;
  /** 摘要（可选） */
  summary?: string;
  /** 内容 */
  content: string;
  /** 封面图（可选） */
  coverImage?: string;
  /** 案例类型（1-通算 2-智算） */
  caseType: CaseType | number;
  /** 状态（0-草稿 1-已发布） */
  status: number;
  /** 标签名列表（可选，逗号分隔） */
  tags?: string;
}

/**
 * 案例写操作响应体
 */
export interface CaseMutationResponse {
  code?: number;
  msg?: string;
  /** 新增时可能含 key（caseId）；修改/删除多为字符串 */
  data?: string | { key?: number };
}
