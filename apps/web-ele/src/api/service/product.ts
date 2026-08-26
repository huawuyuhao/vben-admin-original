import type {
  ProductCollectInfo,
  ProductCollectListParams,
  ProductInfo,
  ProductListParams,
  ProductListResponseBody,
  ProductListResult,
} from '#/types/service/product';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isProductApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseProductListBody<T extends ProductInfo = ProductInfo>(
  body?: null | ProductListResponseBody<T>,
): ProductListResult<T> {
  if (!body) {
    return { records: [], total: 0, current: 1, size: 10 };
  }

  // 新文档：records / total / current / size 与 code 同级
  if (Array.isArray(body.records)) {
    return {
      records: body.records,
      total: Number(body.total) || 0,
      current: Number(body.current) || 1,
      size: Number(body.size) || 10,
    };
  }

  // 兼容：data 为分页对象
  const nested = body.data;
  if (nested && !Array.isArray(nested) && Array.isArray(nested.records)) {
    return {
      records: nested.records,
      total: Number(nested.total) || 0,
      current: Number(nested.current) || 1,
      size: Number(nested.size) || 10,
    };
  }

  // 兼容：data 为数组（旧 Mock）
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
 * 产品列表分页查询
 * 开发态走 Apifox Mock：GET /mock/product/list
 * 正式接口：GET /product/list
 * 文档返参为扁平结构（code/msg/total/records/current/size），故使用 responseReturn: 'body'
 * @param params 分页与筛选参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getProductListApi(params: ProductListParams) {
  const body = await rootRequestClient.get<ProductListResponseBody>(
    '/mock/product/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<ProductListResponseBody>(
  //   '/product/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseProductListBody(body);
}

/**
 * 我的收藏列表分页查询
 * 开发态走 Apifox Mock：GET /mock/product/collect/list
 * 正式接口：GET /product/collect/list
 * @param params page / pageSize
 * @returns 扁平分页结果（records 含 collectId / collectTime 等）
 */
export async function getProductCollectListApi(
  params: ProductCollectListParams,
) {
  const body = await rootRequestClient.get<
    ProductListResponseBody<ProductCollectInfo>
  >('/mock/product/collect/list', {
    params,
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   ProductListResponseBody<ProductCollectInfo>
  // >('/product/collect/list', {
  //   params,
  //   responseReturn: 'body',
  // });

  if (!isProductApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseProductListBody(body);
}

/**
 * 产品详情查询
 * 开发态走 Apifox Mock：GET /mock/product/{id}
 * 正式接口：GET /product/{id}
 * @param id 产品 ID
 * @returns 算力产品信息（业务 data）
 */
export async function getProductDetailApi(id: number) {
  return rootRequestClient.get<ProductInfo>(`/mock/product/${id}`);
  // return rootRequestClient.get<ProductInfo>(`/product/${id}`);
}

/**
 * 产品收藏 / 取消收藏
 * 开发态走 Apifox Mock：POST /mock/product/collect
 * 正式接口：POST /product/collect
 * @param productId 产品 ID
 * @param action collect 收藏 / uncollect 取消收藏
 * @returns 业务 data（字符串）
 */
export async function toggleProductCollectApi(
  productId: number,
  action: 'collect' | 'uncollect',
) {
  return rootRequestClient.post<string>('/mock/product/collect', {
    productId,
    action,
  });
  // return rootRequestClient.post<string>('/product/collect', {
  //   productId,
  //   action,
  // });
}

/**
 * 生成算力需求意向
 * 开发态走 Apifox Mock：POST /mock/product/demand-intent
 * 正式接口：POST /product/demand-intent
 * @param params productId / demandName / demandDesc
 * @returns 含 key（demandId）
 */
export async function createProductDemandIntentApi(params: {
  demandDesc?: string;
  demandName: string;
  productId: number;
}) {
  return rootRequestClient.post<{ key: number }>(
    '/mock/product/demand-intent',
    params,
  );
  // return rootRequestClient.post<{ key: number }>(
  //   '/product/demand-intent',
  //   params,
  // );
}
