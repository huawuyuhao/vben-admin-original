import { useAccessStore } from '@vben/stores';
import { downloadFileFromBlob, isHttpUrl } from '@vben/utils';

import { router } from '#/router';
import { PORTAL_LOGIN_PATH } from '#/router/routes/core';

/** 门户首页路径（登录成功 / 未登录兜底回跳） */
export const PORTAL_HOME_PATH = '/portal';

/**
 * 是否为无需登录即可访问的公开路径
 * @param path 路由 path
 */
export function isPublicPath(path: string): boolean {
  const normalized = path.replace(/\/$/, '') || '/';
  return (
    normalized === '/' ||
    normalized === PORTAL_HOME_PATH ||
    normalized === PORTAL_LOGIN_PATH ||
    normalized === '/register' ||
    normalized === '/forgot-password' ||
    normalized.startsWith('/auth/') ||
    normalized.startsWith('/portal/news/')
  );
}

/**
 * 当前是否已登录（以 accessToken 为准）
 */
export function isLoggedIn(): boolean {
  return !!useAccessStore().accessToken;
}

/**
 * 当前是否位于登录 / 注册 / 找回密码等认证页
 * @param path 路由 path，默认取当前路由
 */
export function isAuthPath(path?: string): boolean {
  const normalized =
    (path ?? router.currentRoute.value.path).replace(/\/$/, '') || '/';
  return (
    normalized === PORTAL_LOGIN_PATH ||
    normalized === '/register' ||
    normalized === '/forgot-password' ||
    normalized.startsWith('/auth/')
  );
}

/**
 * 跳转登录页（默认 push，保证浏览器返回可回到当前页）
 * @param replace 是否替换当前历史记录
 */
export function goLogin(replace = false) {
  if (replace) {
    return router.replace(PORTAL_LOGIN_PATH);
  }
  return router.push(PORTAL_LOGIN_PATH);
}

/**
 * 跳转门户首页
 * @param replace 是否替换当前历史记录
 */
export function goPortalHome(replace = false) {
  if (replace) {
    return router.replace(PORTAL_HOME_PATH);
  }
  return router.push(PORTAL_HOME_PATH);
}

/**
 * 点击业务入口前校验登录态。
 * 未登录则跳转登录页并返回 false（调用方应中止后续跳转）；
 * 已登录返回 true。
 *
 * 设计要点：从首页/公开页 push 到登录，历史为「公开页 → 登录」，
 * 浏览器返回可回到公开页；登录成功统一回门户首页。
 * 已在认证页时不再二次跳转，避免守卫把「登录→业务」打回首页。
 *
 * @param targetPath 即将前往的路径（公开路径直接放行）
 * @returns 已登录或目标为公开页时 true，否则 false
 */
export function ensureLoggedIn(targetPath?: string): boolean {
  if (targetPath && isPublicPath(targetPath)) {
    return true;
  }
  if (isLoggedIn()) {
    return true;
  }
  // 已在登录相关页：保持当前页，勿再 push 业务或登录
  if (isAuthPath()) {
    return false;
  }
  void goLogin(false);
  return false;
}

/**
 * 将导出接口返回的 fileUrl 解析为可请求的绝对地址
 * @param value 接口 data.fileUrl
 * @returns 可请求地址；无法识别时 undefined
 */
export function resolveExportDownloadUrl(
  value?: null | string,
): string | undefined {
  const text = value?.trim();
  if (!text) {
    return undefined;
  }
  if (isHttpUrl(text)) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return undefined;
}

export interface DownloadExportFileOptions {
  /** 导出接口返回的文件地址 */
  fileUrl?: null | string;
  /** 优先使用的文件名；缺省时从 URL 路径推断 */
  fileName?: null | string;
}

/**
 * 判断下载地址是否与当前站点同源
 * @param url 绝对地址
 */
function isSameOriginUrl(url: string): boolean {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * 从下载 URL 推断默认文件名
 * @param downloadUrl 绝对地址
 * @param preferred 接口返回的优先文件名
 */
function resolveDownloadFileName(
  downloadUrl: string,
  preferred?: null | string,
): string {
  if (preferred?.trim()) {
    return preferred.trim();
  }
  const urlName = downloadUrl.slice(downloadUrl.lastIndexOf('/') + 1);
  return decodeURIComponent(urlName.split('?')[0] || '') || 'download';
}

/**
 * 尝试通过 fetch + blob 本地下载（需目标允许 CORS；同源可带登录态）
 * @param downloadUrl 绝对地址
 * @param fileName 下载文件名
 * @returns 成功返回 true；CORS / 网络失败返回 false
 */
async function tryBlobDownload(
  downloadUrl: string,
  fileName: string,
): Promise<boolean> {
  const sameOrigin = isSameOriginUrl(downloadUrl);
  const headers: Record<string, string> = {};

  if (sameOrigin) {
    const accessStore = useAccessStore();
    if (accessStore.accessToken) {
      headers.Authorization = `Bearer ${accessStore.accessToken}`;
    }
    if (accessStore.clientId) {
      headers.clientid = accessStore.clientId;
    }
  }

  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers,
      credentials: sameOrigin ? 'include' : 'omit',
      mode: 'cors',
      redirect: 'follow',
    });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return false;
    }

    const blob = await response.blob();
    downloadFileFromBlob({ source: blob, fileName });
    return true;
  } catch {
    // 跨域未开 CORS 时浏览器会抛 Failed to fetch，改走 iframe 兜底
    return false;
  }
}

/**
 * 用隐藏 iframe 拉取跨域文件，避免当前页跳转。
 * 依赖服务端 Content-Disposition / 浏览器对办公文档等类型的下载策略。
 * @param downloadUrl 绝对地址
 */
function triggerIframeDownload(downloadUrl: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = downloadUrl;
  document.body.append(iframe);
  // 给浏览器一点时间发起下载后再清理
  window.setTimeout(() => {
    iframe.remove();
  }, 60_000);
}

/**
 * 按导出接口返回的 fileUrl 触发下载，尽量留在当前页：
 * 1. 优先 fetch + blob（同源或目标已开 CORS）→ 可改名、不跳转
 * 2. 失败则隐藏 iframe 拉取 → 多数 xlsx/zip 会直接下载且不跳转
 * 浏览器安全策略下：跨域且无 CORS 时无法用 JS 读文件内容，只能靠 iframe/新窗口让浏览器自行处理。
 *
 * @param options fileUrl + 可选 fileName
 * @returns 成功触发下载返回 true；无有效地址返回 false
 */
export async function downloadExportFile(
  options: DownloadExportFileOptions,
): Promise<boolean> {
  const downloadUrl = resolveExportDownloadUrl(options.fileUrl);
  if (!downloadUrl) {
    return false;
  }

  const fileName = resolveDownloadFileName(downloadUrl, options.fileName);

  const blobOk = await tryBlobDownload(downloadUrl, fileName);
  if (blobOk) {
    return true;
  }

  triggerIframeDownload(downloadUrl);
  return true;
}
