/**
 * 判断是否为 Chrome DevTools 注入脚本的 startTime 噪声报错
 * 特征：VM**** / anonymous + reportAllChanges 读 undefined.startTime
 * @param event 全局 error 事件
 * @returns 命中噪声时返回 true
 */
function isChromeDevtoolsStartTimeNoise(event: ErrorEvent): boolean {
  const message = String(event.message || '');
  const stack = String(event.error?.stack || '');
  const filename = String(event.filename || '');

  const fromInjectedScript =
    /^VM\d+/i.test(filename) ||
    filename === '' ||
    filename === 'undefined' ||
    filename.includes('<anonymous>');

  const mentionsStartTime =
    message.includes("reading 'startTime'") ||
    message.includes('reading "startTime"') ||
    stack.includes('reportAllChanges');

  return fromInjectedScript && mentionsStartTime;
}

/**
 * 屏蔽 Chrome DevTools 注入的已知红色报错（reportAllChanges → startTime）
 * 上游为 Chromium / DevTools 内嵌 web-vitals，与业务无关；
 * 甲方验收要求控制台不出现红色错误，故仅拦截该噪声。
 */
export function suppressChromeDevtoolsStartTimeNoise() {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener(
    'error',
    (event) => {
      if (!isChromeDevtoolsStartTimeNoise(event)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}
