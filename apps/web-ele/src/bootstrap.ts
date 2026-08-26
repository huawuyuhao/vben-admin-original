import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui';
import { setBeforeNavigationHook } from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';

import { useTitle } from '@vueuse/core';
import ElementPlus from 'element-plus';
/** Element Plus 全量样式（业务页多，按需引入成本更高） */
import 'element-plus/dist/index.css';
/** 覆盖 EP 的应用层样式，须放在全量样式之后 */
import '@vben/styles/ele';

import { $t, setupI18n } from '#/locales';
import { ensureLoggedIn } from '#/store/common';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();

  const app = createApp(App);

  // 业务页大量使用 ElTable/ElCard 等，需全局注册，否则插槽 props 为 undefined 导致白屏
  // Element Plus 安装时已注册 v-loading，勿再手动 app.directive('loading')
  app.use(ElementPlus);

  // 仅注册 Vben 的 v-spinning；v-loading 已由 Element Plus 提供
  registerLoadingDirective(app, {
    loading: false,
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, {
    namespace,
    // 本门户约定：全部缓存走 sessionStorage，关闭标签页即清
    persistStorage: sessionStorage,
  });

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 配置路由及路由守卫
  app.use(router);

  // 顶栏 / 侧栏菜单点击前：未登录则去登录页，不进入业务路由（返回可回公开页）
  setBeforeNavigationHook((path) => ensureLoggedIn(path));

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
