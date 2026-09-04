import type {
  ModelCompareResponseBody,
  ModelEvaluation,
  ModelEvaluationListParams,
  ModelEvaluationSubmitParams,
  ModelInfo,
  ModelListParams,
  ModelListResponseBody,
  ModelListResult,
} from '#/types/service/model';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isModelApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseModelListBody<T = ModelInfo>(
  body?: ModelListResponseBody<T> | null,
): ModelListResult<T> {
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
 * 模型服务列表分页查询
 * 开发态走 Apifox Mock：GET /mock/model/list
 * 正式接口：GET /model/list
 * 文档返参为扁平结构（code/msg/total/records/current/size），故使用 responseReturn: 'body'
 * @param params 分页与搜索参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getModelListApi(params: ModelListParams) {
  const body = await rootRequestClient.get<ModelListResponseBody>(
    '/mock/model/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<ModelListResponseBody>(
  //   '/model/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseModelListBody(body);
}

/**
 * 模型详情查询
 * 开发态走 Apifox Mock：GET /mock/model/{id}
 * 正式接口：GET /model/{id}
 * @param id 模型 ID
 * @returns 模型详细信息（含 paramsJson）
 */
export async function getModelDetailApi(id: number) {
  return rootRequestClient.get<ModelInfo>(`/mock/model/${id}`);
  // return rootRequestClient.get<ModelInfo>(`/model/${id}`);
}

/**
 * 模型参数对比
 * 开发态走 Apifox Mock：POST /mock/model/compare
 * 正式接口：POST /model/compare
 * 入参走请求体：{ modelIds: number[] }（最多 5 个）
 * @param modelIds 模型 ID 列表
 * @returns 对比模型列表（含 paramsJson）
 */
export async function compareModelsApi(modelIds: number[]) {
  const ids = modelIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
    .slice(0, 5);

  const body = await rootRequestClient.post<ModelCompareResponseBody>(
    '/mock/model/compare',
    { modelIds: ids },
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<ModelCompareResponseBody>(
  //   '/model/compare',
  //   { modelIds: ids },
  //   { responseReturn: 'body' },
  // );

  if (!isModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * 提交模型评价（需登录）
 * 开发态走 Apifox Mock：POST /mock/model/evaluation
 * 正式接口：POST /model/evaluation
 * 入参走请求体：{ modelId, score, content }
 * @param params 评价参数
 * @returns 业务 data（字符串）
 */
export async function submitModelEvaluationApi(
  params: ModelEvaluationSubmitParams,
) {
  return rootRequestClient.post<string>('/mock/model/evaluation', params);
  // return rootRequestClient.post<string>('/model/evaluation', params);
}

/**
 * 模型评价列表分页查询
 * 开发态走 Apifox Mock：GET /mock/model/evaluation/list
 * 正式接口：GET /model/evaluation/list
 * @param params modelId / page / pageSize
 * @returns 评价分页结果
 */
export async function getModelEvaluationListApi(
  params: ModelEvaluationListParams,
) {
  const body = await rootRequestClient.get<
    ModelListResponseBody<ModelEvaluation>
  >('/mock/model/evaluation/list', {
    params,
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   ModelListResponseBody<ModelEvaluation>
  // >('/model/evaluation/list', {
  //   params,
  //   responseReturn: 'body',
  // });

  if (!isModelApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseModelListBody(body);
}
