import type {
  DemandConfigDetail,
  DemandConfigPayload,
  DemandConfigSaveResult,
  DemandFeeParams,
  DemandFeeResult,
  ModelMarketListParams,
  ModelMarketListResponseBody,
  ModelMarketListResult,
  ProductImageItem,
  SpecFilterOptions,
  SpecListParams,
  SpecListResponseBody,
  SpecListResult,
} from '#/types/service/product/order';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isOrderApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从扁平 / data 包裹分页响应中解析列表
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseFlatPageBody<T>(
  body?: null | {
    code?: number;
    current?: number;
    data?: T[] | { current?: number; records?: T[]; size?: number; total?: number };
    records?: T[];
    size?: number;
    total?: number;
  },
): { current: number; records: T[]; size: number; total: number } {
  if (!body) {
    return { records: [], total: 0, current: 1, size: 10 };
  }

  if (Array.isArray(body.records)) {
    return {
      records: body.records,
      total: Number(body.total) || 0,
      current: Number(body.current) || 1,
      size: Number(body.size) || 10,
    };
  }

  const nested = body.data;
  if (nested && !Array.isArray(nested) && Array.isArray(nested.records)) {
    return {
      records: nested.records,
      total: Number(nested.total) || 0,
      current: Number(nested.current) || 1,
      size: Number(nested.size) || 10,
    };
  }

  if (Array.isArray(nested)) {
    return {
      records: nested,
      total: nested.length,
      current: 1,
      size: nested.length || 10,
    };
  }

  return { records: [], total: 0, current: 1, size: 10 };
}

/**
 * ① 基础配置 - 规格筛选项
 * 开发态走 Apifox Mock：GET /mock/product/spec/filter-options
 * 正式接口：GET /product/spec/filter-options
 * @returns 架构 / 类型 / 实例族 / GPU 型号可选值
 */
export async function getSpecFilterOptionsApi() {
  return rootRequestClient.get<SpecFilterOptions>(
    '/mock/product/spec/filter-options',
  );
  // return rootRequestClient.get<SpecFilterOptions>(
  //   '/product/spec/filter-options',
  // );
}

/**
 * ① 基础配置 - 规格列表查询
 * 开发态走 Apifox Mock：GET /mock/product/spec/list
 * 正式接口：GET /product/spec/list
 * @param params 分页与筛选
 * @returns 规格分页结果
 */
export async function getSpecListApi(params: SpecListParams) {
  const body = await rootRequestClient.get<SpecListResponseBody>(
    '/mock/product/spec/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<SpecListResponseBody>(
  //   '/product/spec/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isOrderApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseFlatPageBody<SpecListResult['records'][number]>(
    body,
  ) as SpecListResult;
}

/**
 * ② 镜像列表查询
 * 开发态走 Apifox Mock：GET /mock/product/image/list
 * 正式接口：GET /product/image/list
 * @param imageType 镜像类型（可选）
 * @returns 镜像列表
 */
export async function getProductImageListApi(imageType?: number) {
  return rootRequestClient.get<ProductImageItem[]>(
    '/mock/product/image/list',
    {
      params: imageType == null ? undefined : { imageType },
    },
  );
  // return rootRequestClient.get<ProductImageItem[]>('/product/image/list', {
  //   params: imageType == null ? undefined : { imageType },
  // });
}

/**
 * ③ 高级配置 - 模型市场列表
 * 开发态走 Apifox Mock：GET /mock/model/market/list
 * 正式接口：GET /model/market/list
 * @param params 分页与筛选
 * @returns 模型分页结果
 */
export async function getModelMarketListApi(params: ModelMarketListParams) {
  const body = await rootRequestClient.get<ModelMarketListResponseBody>(
    '/mock/model/market/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<ModelMarketListResponseBody>(
  //   '/model/market/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isOrderApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseFlatPageBody<ModelMarketListResult['records'][number]>(
    body,
  ) as ModelMarketListResult;
}

/**
 * ④ 确认配置 - 费用试算
 * 开发态走 Apifox Mock：POST /mock/demand/config/fee
 * 正式接口：POST /demand/config/fee
 * @param params 规格 / 数量 / 带宽 / 磁盘
 * @returns 费用结果
 */
export async function calcDemandConfigFeeApi(params: DemandFeeParams) {
  return rootRequestClient.post<DemandFeeResult>(
    '/mock/demand/config/fee',
    params,
  );
  // return rootRequestClient.post<DemandFeeResult>('/demand/config/fee', params);
}

/**
 * ④ 确认配置 - 保存需求配置草稿
 * 开发态走 Apifox Mock：POST /mock/demand/config/draft
 * 正式接口：POST /demand/config/draft
 * @param params 四步向导汇总
 * @returns 含 demandId
 */
export async function saveDemandConfigDraftApi(params: DemandConfigPayload) {
  return rootRequestClient.post<DemandConfigSaveResult>(
    '/mock/demand/config/draft',
    params,
  );
  // return rootRequestClient.post<DemandConfigSaveResult>(
  //   '/demand/config/draft',
  //   params,
  // );
}

/**
 * ④ 确认配置 - 提交需求配置
 * 开发态走 Apifox Mock：POST /mock/demand/config/submit
 * 正式接口：POST /demand/config/submit
 * @param params 四步向导汇总
 * @returns 含 demandId
 */
export async function submitDemandConfigApi(params: DemandConfigPayload) {
  return rootRequestClient.post<DemandConfigSaveResult>(
    '/mock/demand/config/submit',
    params,
  );
  // return rootRequestClient.post<DemandConfigSaveResult>(
  //   '/demand/config/submit',
  //   params,
  // );
}

/**
 * 需求配置回显（编辑草稿 / 查看已提交）
 * 开发态走 Apifox Mock：GET /mock/demand/config/{demandId}
 * 正式接口：GET /demand/config/{demandId}
 * @param demandId 需求 ID
 * @returns 主记录 + 配置 + 磁盘 + 应用
 */
export async function getDemandConfigDetailApi(demandId: number) {
  return rootRequestClient.get<DemandConfigDetail>(
    `/mock/demand/config/${demandId}`,
  );
  // return rootRequestClient.get<DemandConfigDetail>(
  //   `/demand/config/${demandId}`,
  // );
}
