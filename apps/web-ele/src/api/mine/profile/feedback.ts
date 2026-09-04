import type {
  FeedbackListParams,
  FeedbackListResponseBody,
  FeedbackListResult,
  FeedbackMutationResponse,
  FeedbackSubmitParams,
} from '#/types/mine/profile/feedback';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isFeedbackApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertFeedbackMutationSuccess(
  body?: FeedbackMutationResponse | null,
) {
  if (!isFeedbackApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }
}

/**
 * 从列表接口响应体解析分页结果（兼容扁平结构与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parseFeedbackListBody<T>(
  body?: FeedbackListResponseBody<T> | null,
): FeedbackListResult<T> {
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
 * 意见反馈分页列表
 * 开发态：GET /mock/feedback/list
 * 正式：GET /feedback/list
 * @param params 分页与筛选条件
 * @returns 分页结果（records / total / current / size）
 */
export async function getFeedbackListApi(params: FeedbackListParams) {
  const body = await rootRequestClient.get<FeedbackListResponseBody>(
    '/mock/feedback/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<FeedbackListResponseBody>(
  //   '/feedback/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isFeedbackApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseFeedbackListBody(body);
}

/**
 * 提交意见反馈
 * 开发态：POST /mock/feedback
 * 正式：POST /feedback
 * 入参走 query（content 必填，images 可选逗号分隔）
 * @param params 反馈内容与图片
 */
export async function submitFeedbackApi(params: FeedbackSubmitParams) {
  const body = await rootRequestClient.post<FeedbackMutationResponse>(
    '/mock/feedback',
    {},
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.post<FeedbackMutationResponse>(
  //   '/feedback',
  //   {},
  //   { params, responseReturn: 'body' },
  // );

  assertFeedbackMutationSuccess(body);
}
