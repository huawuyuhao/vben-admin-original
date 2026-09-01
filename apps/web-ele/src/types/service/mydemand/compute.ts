/**
 * 算力需求状态
 * 0-待提交 1-待审核 2-审核不通过 3-已转任务 4-执行中 5-已完成
 */
export type ComputeDemandStatus = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 算力需求条目
 * GET /demand/list · demand_record
 */
export interface ComputeDemandItem {
  /** 需求 ID */
  demandId?: number;
  /** 需求编号（系统自动生成唯一） */
  demandNo?: string;
  /** 需求名称 */
  demandName?: string;
  /** 需求类型 */
  demandType?: number;
  /** 资源规格 */
  resourceSpec?: string;
  /** 用户 ID */
  userId?: number;
  /** 企业 ID */
  enterpriseId?: number;
  /** 关联应用 ID */
  applicationId?: number;
  /** 需求状态 */
  status?: ComputeDemandStatus | number;
  /** 提交时间 */
  submitTime?: string;
  /** 结果文件路径 */
  resultFile?: string;
  /** 结果生成时间 */
  resultTime?: string;
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
 * 需求台账列表查询参数
 * GET /demand/list
 */
export interface ComputeDemandListParams {
  /** 页码（默认 1） */
  page: number;
  /** 每页条数（默认 10） */
  pageSize: number;
  /** 需求编号（可选） */
  demandNo?: string;
  /** 状态（可选） */
  status?: ComputeDemandStatus;
  /** 开始时间（可选） */
  startTime?: string;
  /** 结束时间（可选） */
  endTime?: string;
}

/**
 * 提交 / 编辑算力需求参数
 * POST /demand · PUT /demand/{id}
 */
export interface ComputeDemandWriteParams {
  /** 需求名称 */
  demandName: string;
  /** 需求类型 */
  demandType: number;
  /** 资源规格 */
  resourceSpec?: string;
  /** 关联应用 ID */
  applicationId?: number;
  /** 需求状态（重新提交时传 1-待审核） */
  status?: ComputeDemandStatus | number;
}

/**
 * 提交需求成功结果
 * POST /demand · data
 */
export interface ComputeDemandCreateResult {
  /** 需求编号 */
  demandNo?: string;
  /** 需求 ID */
  demandId?: number;
}

/**
 * 复制历史需求结果
 * POST /demand/{id}/copy · data
 */
export interface ComputeDemandCopyResult {
  /** 新需求编号 */
  demandNo?: string;
  /** 新需求 ID */
  newDemandId?: number;
}

/**
 * 结果预览
 * GET /demand/{id}/result/preview · data
 */
export interface ComputeDemandPreviewResult {
  /** 结果内容或文件路径 */
  resultContent?: string;
}

/**
 * 结果下载
 * GET /demand/{id}/result/download · data
 */
export interface ComputeDemandDownloadResult {
  /** 下载链接 */
  fileUrl?: string;
}

/**
 * 导出需求列表参数
 * POST /demand/export（query）
 */
export interface ComputeDemandExportParams {
  /** 需求编号（可选） */
  demandNo?: string;
  /** 状态（可选） */
  status?: ComputeDemandStatus;
  /** 开始时间（可选） */
  startTime?: string;
  /** 结束时间（可选） */
  endTime?: string;
}

/**
 * 导出需求列表结果
 * data.fileUrl / data.fileName
 */
export interface ComputeDemandExportResult {
  /** 文件访问 URL */
  fileUrl?: string;
  /** 原始文件名 */
  fileName?: string;
}

/**
 * 需求列表分页结果
 */
export interface ComputeDemandListResult<T = ComputeDemandItem> {
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
 * 需求列表响应体（扁平分页 + code/msg）
 */
export interface ComputeDemandListResponseBody<T = ComputeDemandItem> {
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
 * 写操作 / 详情通用响应
 */
export interface ComputeDemandMutationResponse<T = unknown> {
  code?: number;
  msg?: string;
  data?: T;
}
