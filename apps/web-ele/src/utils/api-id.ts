/**
 * 接口路径 / 查询中的业务主键。
 * 后端文档常标 integer，实际可能是雪花字符串；禁止一律 Number() 以免精度丢失。
 */
export type ApiId = number | string;

/**
 * 判断业务主键是否有效（非空）。
 * @param id 业务主键
 * @returns 有效返回 true
 */
export function hasApiId(id?: ApiId | null): boolean {
  if (id === null || id === undefined) {
    return false;
  }
  if (typeof id === 'number') {
    return Number.isFinite(id);
  }
  return String(id).trim() !== '';
}

/**
 * 规范化业务主键：保留 number / string 原形态，禁止 Number() 强制转换。
 * 数字 `0`、字符串 `'0'` 视为无效（与历史「id > 0」语义对齐）。
 * @param id 原始主键
 * @returns 有效主键；无效返回 undefined
 */
export function normalizeApiId(id?: ApiId | null): ApiId | undefined {
  if (!hasApiId(id)) {
    return undefined;
  }
  if (typeof id === 'number') {
    return id === 0 ? undefined : id;
  }
  const text = String(id).trim();
  if (!text || text === '0') {
    return undefined;
  }
  return text;
}

/**
 * 比较两个业务主键是否相同（按去空白后的字符串比较，兼容 number / string）。
 * @param a 主键 A
 * @param b 主键 B
 * @returns 相同返回 true
 */
export function sameApiId(a?: ApiId | null, b?: ApiId | null): boolean {
  const left = normalizeApiId(a);
  const right = normalizeApiId(b);
  if (left === undefined || right === undefined) {
    return false;
  }
  return String(left) === String(right);
}

/**
 * 从路由 query / 任意原始值解析业务主键（兼容数组 query）。
 * @param value 路由 query 值或其它原始值
 * @returns 有效主键；无效返回 undefined
 */
export function parseRouteApiId(value?: unknown): ApiId | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === 'number' || typeof raw === 'string') {
    return normalizeApiId(raw);
  }
  if (typeof raw === 'boolean') {
    return undefined;
  }
  return normalizeApiId(String(raw));
}

/**
 * 将业务 ID 转为可拼进 URL 路径的字符串（保留原字符串形态）。
 * @param id 业务主键
 * @returns 编码后的路径片段；空值返回空串
 */
export function toApiPathId(id?: ApiId | null): string {
  const normalized = normalizeApiId(id);
  if (normalized === undefined) {
    return '';
  }
  return encodeURIComponent(String(normalized));
}
