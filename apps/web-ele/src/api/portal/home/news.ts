import type {
  PortalNews,
  PortalNewsId,
  PortalNewsPageParams,
  PortalNewsPageResult,
} from '#/types/portal/home/news';

import { ElMessage } from 'element-plus';

import { rootRequestClient } from '#/api/request';

/**
 * 资讯列表响应体（扁平分页 + code/msg；兼容 data 包裹）
 */
interface PortalNewsListResponseBody {
  code?: number;
  msg?: string;
  total?: number;
  current?: number;
  size?: number;
  pageNum?: number;
  pageSize?: number;
  records?: PortalNews[];
  rows?: PortalNews[];
  list?: PortalNews[];
  data?: PortalNews[] | PortalNewsPageResult;
}

/**
 * 判断业务码是否成功（与全局拦截器一致：0 / 200）
 * @param code 业务码
 * @returns 成功返回 true
 */
function isPortalNewsApiSuccess(code?: number): boolean {
  return code === undefined || code === 0 || code === 200;
}

/**
 * 从任意分页对象中取出列表数组（兼容 records / rows / list）
 * @param source 分页对象
 * @returns 列表数组；无则空数组
 */
function pickNewsRecordsFromSource(
  source?: null | Record<string, unknown>,
): PortalNews[] {
  if (!source) {
    return [];
  }
  if (Array.isArray(source.records)) {
    return source.records as PortalNews[];
  }
  if (Array.isArray(source.rows)) {
    return source.rows as PortalNews[];
  }
  if (Array.isArray(source.list)) {
    return source.list as PortalNews[];
  }
  return [];
}

/**
 * 从响应体解析资讯列表（兼容扁平 records 与 data 包裹）
 * @param body 响应体
 * @returns 标准化分页结果
 */
function parsePortalNewsListBody(
  body?: null | PortalNewsListResponseBody,
): PortalNewsPageResult {
  if (!body) {
    return { records: [], total: 0, current: 1, size: 10 };
  }

  const flatRecords = pickNewsRecordsFromSource(
    body as unknown as Record<string, unknown>,
  );
  if (flatRecords.length > 0 || Array.isArray(body.records) || Array.isArray(body.rows) || Array.isArray(body.list)) {
    return {
      records: flatRecords,
      total: Number(body.total) || flatRecords.length,
      current: Number(body.current) || Number(body.pageNum) || 1,
      size:
        Number(body.size) ||
        Number(body.pageSize) ||
        flatRecords.length ||
        10,
    };
  }

  const nested = body.data;
  if (Array.isArray(nested)) {
    return {
      records: nested,
      total: nested.length,
      current: 1,
      size: nested.length || 10,
    };
  }

  if (nested && typeof nested === 'object') {
    const nestedSource = nested as unknown as Record<string, unknown>;
    const records = pickNewsRecordsFromSource(nestedSource);
    return {
      records,
      total: Number(nested.total) || records.length,
      current: Number(nested.current) || 1,
      size: Number(nested.size) || records.length || 10,
    };
  }

  return { records: [], total: 0, current: 1, size: 10 };
}

/**
 * 获取门户行业资讯分页列表
 * 正式：GET /portal/news
 * 响应为扁平分页（code/msg/records/total 同级），须用 body 解析
 * @param params 分页参数
 * @returns 分页结果（records / total / current / size）
 */
export async function getPortalNewsPageApi(params: PortalNewsPageParams) {
  const body = await rootRequestClient.get<PortalNewsListResponseBody>(
    '/pwq-mock/portal/news',
    {
      params,
      responseReturn: 'body',
    },
  );
  // const body = await rootRequestClient.get<PortalNewsListResponseBody>(
  //   '/mock/portal/news',
  //   {
  //     params,
  //     responseReturn: 'body',
  //   },
  // );
  // const body = await rootRequestClient.get<PortalNewsListResponseBody>(
  //   '/portal/news',
  //   { params, responseReturn: 'body' },
  // );

  if (!isPortalNewsApiSuccess(body?.code)) {
    const message = String(body?.msg || 'Request failed');
    ElMessage.error(message);
    throw new Error(message);
  }

  return parsePortalNewsListBody(body);
}

/**
 * 获取门户行业资讯详情
 * 正式：GET /portal/news/{id}
 * @param id 资讯 ID
 * @returns 资讯详情（业务 data）
 */
export async function getPortalNewsDetailApi(id: PortalNewsId) {
  return rootRequestClient.get<PortalNews>(`/pwq-mock/portal/news/${id}`);
  // return rootRequestClient.get<PortalNews>(`/mock/portal/news/${id}`);
  // return rootRequestClient.get<PortalNews>(`/portal/news/${id}`);
}
