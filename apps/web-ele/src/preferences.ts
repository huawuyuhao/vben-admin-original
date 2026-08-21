import {
  appCopyrightPreferences,
  defineOverridesPreferences,
} from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // 默认进入电碳算门户首页（公开页，无后台壳）
    defaultHomePath: '/portal',
    // 全站默认：混合垂直（顶栏一级菜单 + 侧栏二级菜单）
    layout: 'mixed-nav',
    name: import.meta.env.VITE_APP_TITLE,
    // 业务内容区统一边距（避免缓存里旧值导致上下左右缝乱）
    contentPadding: 0,
    contentPaddingBottom: 0,
    contentPaddingLeft: 0,
    contentPaddingRight: 0,
    contentPaddingTop: 0,
  },
  // 业务页显示 Vben 面包屑
  breadcrumb: {
    enable: true,
    showIcon: true,
  },
  copyright: appCopyrightPreferences,
  // 全站统一使用 Vben 顶栏（门户首页也不再叠自定义营销顶栏）
  header: {
    enable: true,
    hidden: false,
  },
  // Logo 与门户品牌一致
  logo: {
    enable: true,
    fit: 'contain',
    source: '/logo.svg',
  },
  // 混合垂直菜单修复（对齐 dcim）：
  // autoActivateChild=true → 点顶栏一级菜单自动进业务子页
  // autoActivateChildVertical=false → 展开侧栏父级时不强制跳转（避免误跳/双跳）
  sidebar: {
    fixedButton: false,
    autoActivateChild: true,
    autoActivateChildVertical: false,
  },
  // 业务页启用多标签；门户/登录由 basic.vue 动态关闭
  tabbar: {
    enable: true,
    showMaximize: false,
    showMore: false,
    showRefresh: false,
  },
  // 顶栏工具：按甲方要求去掉语言、时区、锁屏；退出放到用户下拉
  widget: {
    languageToggle: false,
    lockScreen: false,
    logoutButtonPosition: 'user-dropdown',
    timezone: false,
  },
  // 默认浅色 + 淡紫色主题（与门户首页 #6B4CFF 一致）
  theme: {
    builtinType: 'custom',
    colorPrimary: 'hsl(250 100% 65%)',
    mode: 'light',
    semiDarkHeader: false,
    semiDarkSidebar: false,
  },
});
