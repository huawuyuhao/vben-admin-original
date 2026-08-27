import { useAccessStore } from '@vben/stores';

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
  const normalized = (path ?? router.currentRoute.value.path).replace(/\/$/, '') || '/';
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
