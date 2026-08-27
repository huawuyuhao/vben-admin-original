import type {
  PortalContentItem,
  PortalContentType,
} from '#/types/monitoring/content/home/common';

import { computed, onMounted, ref, watch } from 'vue';

import { getPortalContentListApi } from '#/api/monitoring/content/home/common';

import {
  PORTAL_CONTENT_FETCH_ALL_SIZE,
  PORTAL_CONTENT_PAGE_SIZE,
  calcPortalContentPageRange,
  normalizePortalContentPage,
} from '../data';

/**
 * 门户内容列表分页逻辑（首页管理各子页共用）
 * 翻页走接口 page / pageSize；筛选由页面层在前端完成
 * @param contentType 内容类型枚举
 * @returns 列表状态与刷新方法
 */
export function usePortalContentList(contentType: PortalContentType) {
  const loading = ref(false);
  const records = ref<PortalContentItem[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(PORTAL_CONTENT_PAGE_SIZE);
  const syncingFromServer = ref(false);
  /** 为 false 时翻页 / 改每页条数不触发接口（前端筛选模式） */
  const serverPagination = ref(true);

  const pageRange = computed(() =>
    calcPortalContentPageRange(total.value, currentPage.value, pageSize.value),
  );

  /**
   * 按接口分页参数拉取当前页
   */
  async function fetchList() {
    loading.value = true;
    try {
      const data = await getPortalContentListApi({
        content: contentType,
        page: currentPage.value,
        pageSize: pageSize.value,
      });
      const page = normalizePortalContentPage(data);
      records.value = page.records;
      total.value = page.total;

      if (page.current !== currentPage.value) {
        syncingFromServer.value = true;
        currentPage.value = page.current;
        syncingFromServer.value = false;
      }
    } catch {
      records.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 拉取全量列表（供前端筛选；接口不支持筛选参数）
   * @returns 全量 records
   */
  async function fetchAllRecords(): Promise<PortalContentItem[]> {
    loading.value = true;
    try {
      const data = await getPortalContentListApi({
        content: contentType,
        page: 1,
        pageSize: PORTAL_CONTENT_FETCH_ALL_SIZE,
      });
      return normalizePortalContentPage(data).records;
    } catch {
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 回到第一页并走接口查询
   */
  function queryFromFirstPage() {
    serverPagination.value = true;
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void fetchList();
  }

  /**
   * 刷新：接口分页模式下刷新当前页；筛选模式由页面自行处理
   */
  function refresh() {
    if (!serverPagination.value) {
      return;
    }
    void fetchList();
  }

  watch(pageSize, () => {
    if (syncingFromServer.value || !serverPagination.value) {
      return;
    }
    queryFromFirstPage();
  });

  watch(currentPage, () => {
    if (syncingFromServer.value || !serverPagination.value) {
      return;
    }
    void fetchList();
  });

  onMounted(() => {
    void fetchList();
  });

  return {
    currentPage,
    fetchAllRecords,
    fetchList,
    loading,
    pageRange,
    pageSize,
    queryFromFirstPage,
    records,
    refresh,
    serverPagination,
    total,
  };
}
