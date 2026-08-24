import type { MenuRecordRaw } from '@vben/types';

import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';
import { findRootMenuByPath } from '@vben/utils';

import { useNavigation } from './use-navigation';

/**
 * 门户首页会离开业务壳（/service/home → /portal）。
 * 这类路径不能记作顶栏一级菜单的「上次子路由」，
 * 否则从首页再点「门户服务」会一直跳回首页。
 */
function isMenuResumeExcludedPath(path: string) {
  return path === '/portal' || path === '/service/home';
}

/** 取「第一个菜单的第一个子菜单」——递归到叶子页，避免停在仅有 redirect 的目录路由 */
function findFirstLeafPath(menu: MenuRecordRaw): string {
  const firstChild = menu.children?.find(
    (child) => !isMenuResumeExcludedPath(child.path),
  );
  if (!firstChild) {
    return menu.path;
  }
  if (firstChild.children && firstChild.children.length > 0) {
    return findFirstLeafPath(firstChild);
  }
  return firstChild.path;
}

function resolveAutoActivatePath(
  rootMenu: MenuRecordRaw,
  defaultSubMap: Map<string, string>,
) {
  const remembered = defaultSubMap.get(rootMenu.path);
  if (remembered && !isMenuResumeExcludedPath(remembered)) {
    return remembered;
  }
  return findFirstLeafPath(rootMenu);
}

function useMixedMenu() {
  const { navigation, willOpenedByWindow } = useNavigation();
  const accessStore = useAccessStore();
  const route = useRoute();
  const splitSideMenus = ref<MenuRecordRaw[]>([]);
  const rootMenuPath = ref<string>('');
  const mixedRootMenuPath = ref<string>('');
  const mixExtraMenus = ref<MenuRecordRaw[]>([]);
  /** 记录当前顶级菜单下哪个子菜单最后激活 */
  const defaultSubMap = new Map<string, string>();
  const { isMixedNav, isHeaderMixedNav, isMobile } = usePreferences();

  const needSplit = computed(
    () =>
      !isMobile.value &&
      ((preferences.navigation.split && isMixedNav.value) ||
        isHeaderMixedNav.value),
  );

  const sidebarVisible = computed(() => {
    const enableSidebar = preferences.sidebar.enable;
    if (needSplit.value) {
      return enableSidebar && splitSideMenus.value.length > 0;
    }
    return enableSidebar;
  });
  const menus = computed(() => accessStore.accessMenus);

  /**
   * 头部菜单
   */
  const headerMenus = computed(() => {
    if (!needSplit.value) {
      return menus.value;
    }
    return menus.value.map((item) => {
      return {
        ...item,
        children: [],
      };
    });
  });

  /**
   * 侧边菜单
   */
  const sidebarMenus = computed(() => {
    return needSplit.value ? splitSideMenus.value : menus.value;
  });

  const mixHeaderMenus = computed(() => {
    return isHeaderMixedNav.value ? sidebarMenus.value : headerMenus.value;
  });

  /**
   * 侧边菜单激活路径
   */
  const sidebarActive = computed(() => {
    return (route?.meta?.activePath as string) ?? route.path;
  });

  /**
   * 头部菜单激活路径
   */
  const headerActive = computed(() => {
    if (!needSplit.value) {
      return route.meta?.activePath ?? route.path;
    }
    return rootMenuPath.value;
  });

  /**
   * 菜单点击事件处理
   * @param key 菜单路径
   * @param mode 菜单模式
   */
  const handleMenuSelect = (key: string, mode?: string) => {
    if (!needSplit.value || mode === 'vertical') {
      navigation(key);
      return;
    }
    const rootMenu = menus.value.find((item) => item.path === key);
    const _splitSideMenus = rootMenu?.children ?? [];

    if (!willOpenedByWindow(key)) {
      rootMenuPath.value = rootMenu?.path ?? '';
      splitSideMenus.value = _splitSideMenus;
    }

    if (_splitSideMenus.length === 0) {
      navigation(key);
    } else if (rootMenu && preferences.sidebar.autoActivateChild) {
      navigation(resolveAutoActivatePath(rootMenu, defaultSubMap));
    }
  };

  /**
   * 侧边菜单展开事件
   * @param key 路由路径
   * @param parentsPath 父级路径
   */
  const handleMenuOpen = (key: string, parentsPath: string[]) => {
    // 与顶栏 autoActivateChild 拆开：侧栏展开父级时是否强制跳子页
    if (
      parentsPath.length <= 1 &&
      preferences.sidebar.autoActivateChildVertical
    ) {
      const rootMenu = menus.value.find((item) => item.path === key);
      navigation(
        rootMenu
          ? resolveAutoActivatePath(rootMenu, defaultSubMap)
          : defaultSubMap.has(key)
            ? (defaultSubMap.get(key) as string)
            : key,
      );
    }
  };

  /**
   * 计算侧边菜单
   * @param path 路由路径
   */
  function calcSideMenus(path: string = route.path) {
    let { rootMenu } = findRootMenuByPath(menus.value, path);
    if (!rootMenu) {
      rootMenu = menus.value.find((item) => item.path === path);
    }
    const result = findRootMenuByPath(rootMenu?.children || [], path, 1);
    mixedRootMenuPath.value = result.rootMenuPath ?? '';
    mixExtraMenus.value = result.rootMenu?.children ?? [];
    rootMenuPath.value = rootMenu?.path ?? '';
    splitSideMenus.value = rootMenu?.children ?? [];
  }

  watch(
    () => route.path,
    (path) => {
      const currentPath = route?.meta?.activePath ?? route?.meta?.link ?? path;
      if (willOpenedByWindow(currentPath)) {
        return;
      }
      calcSideMenus(currentPath);
      // 门户首页路径不要记成顶栏一级菜单的恢复地址
      if (rootMenuPath.value && !isMenuResumeExcludedPath(currentPath)) {
        defaultSubMap.set(rootMenuPath.value, currentPath);
      }
    },
    { immediate: true },
  );

  // 初始化计算侧边菜单
  onBeforeMount(() => {
    calcSideMenus(route.meta?.activePath || route.path);
  });

  return {
    handleMenuSelect,
    handleMenuOpen,
    headerActive,
    headerMenus,
    sidebarActive,
    sidebarMenus,
    mixHeaderMenus,
    mixExtraMenus,
    sidebarVisible,
  };
}

export { useMixedMenu };
