import type {
  MessageItem,
  MessageListParams,
  MessageListResponseBody,
  MessageListResult,
  MessageMutationResponse,
  MessageStatisticsItem,
} from '#/types/mine/messages/all';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isMessageApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 校验写操作响应并抛出错误
 * @param body 响应体
 */
function assertMessageMutationSuccess(
  body?: MessageMutationResponse | null,
) {
  if (!isMessageApiSuccess(body?.code)) {
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
function parseMessageListBody<T>(
  body?: MessageListResponseBody<T> | null,
): MessageListResult<T> {
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
 * 消息列表分页查询
 * 开发态：GET /mock/message/list
 * 正式：GET /message/list
 * @param params 分页与筛选条件
 * @returns 分页结果
 */
export async function getMessageListApi(params: MessageListParams) {
  const body = await rootRequestClient.get<MessageListResponseBody>(
    '/mock/message/list',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<MessageListResponseBody>(
  //   '/message/list',
  //   { params, responseReturn: 'body' },
  // );

  if (!isMessageApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parseMessageListBody(body);
}

/**
 * 消息详情
 * 开发态：GET /mock/message/{id}
 * 正式：GET /message/{id}
 * @param id 消息 ID
 * @returns 消息详情
 */
export async function getMessageDetailApi(id: number) {
  const body = await rootRequestClient.get<
    MessageMutationResponse<MessageItem>
  >(`/mock/message/${id}`, {
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   MessageMutationResponse<MessageItem>
  // >(`/message/${id}`, {
  //   responseReturn: 'body',
  // });

  assertMessageMutationSuccess(body);
  return body?.data ?? null;
}

/**
 * 标记已读（传空数组则全部标记当前用户消息为已读）
 * 开发态：POST /mock/message/read
 * 正式：POST /message/read
 * @param messageIds 消息 ID 列表
 */
export async function markMessageReadApi(messageIds: number[]) {
  const body = await rootRequestClient.post<MessageMutationResponse<string>>(
    '/mock/message/read',
    messageIds,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MessageMutationResponse<string>>(
  //   '/message/read',
  //   messageIds,
  //   { responseReturn: 'body' },
  // );

  assertMessageMutationSuccess(body);
  return body?.data;
}

/**
 * 删除消息
 * 开发态：POST /mock/message/delete
 * 正式：POST /message/delete
 * @param messageIds 消息 ID 列表
 */
export async function deleteMessageApi(messageIds: number[]) {
  const body = await rootRequestClient.post<MessageMutationResponse<string>>(
    '/mock/message/delete',
    messageIds,
    { responseReturn: 'body' },
  );
  // const body = await rootRequestClient.post<MessageMutationResponse<string>>(
  //   '/message/delete',
  //   messageIds,
  //   { responseReturn: 'body' },
  // );

  assertMessageMutationSuccess(body);
  return body?.data;
}

/**
 * 消息分类统计
 * 开发态：GET /mock/message/statistics
 * 正式：GET /message/statistics
 * @returns 各类型数量与未读数
 */
export async function getMessageStatisticsApi() {
  const body = await rootRequestClient.get<
    MessageMutationResponse<MessageStatisticsItem[]>
  >('/mock/message/statistics', {
    responseReturn: 'body',
  });
  // const body = await rootRequestClient.get<
  //   MessageMutationResponse<MessageStatisticsItem[]>
  // >('/message/statistics', {
  //   responseReturn: 'body',
  // });

  assertMessageMutationSuccess(body);
  return Array.isArray(body?.data) ? body.data : [];
}
