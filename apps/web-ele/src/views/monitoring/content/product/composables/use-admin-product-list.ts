import type { AdminProductShelfStatus } from '#/types/monitoring/content/product';
import type { ProductInfo } from '#/types/service/product';

import { onMounted, ref, watch } from 'vue';

import { getAdminProductListApi } from '#/api/monitoring/content/product';

import {
  ADMIN_PRODUCT_PAGE_SIZE,
  normalizeAdminProductPage,
} from '../data';

/**
 * 算力产品管理列表分页逻辑（筛选参数走服务端）
 * @returns 列表状态、筛选条件与刷新方法
 */
export function useAdminProductList() {
  const loading = ref(false);
  const records = ref<ProductInfo[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(ADMIN_PRODUCT_PAGE_SIZE);
  const syncingFromServer = ref(false);

  /** 产品名称（已生效的筛选） */
  const appliedProductName = ref('');
  /** 上下架状态（已生效的筛选；空串表示全部） */
  const appliedShelfStatus = ref<'' | AdminProductShelfStatus>('');

  /**
   * 按当前分页与筛选条件拉取列表
   */
  async function fetchList() {
    loading.value = true;
    try {
      const data = await getAdminProductListApi({
        page: currentPage.value,
        pageSize: pageSize.value,
        productName: appliedProductName.value.trim() || undefined,
        shelfStatus: appliedShelfStatus.value === ''
          ? undefined
          : appliedShelfStatus.value,
      });
      const page = normalizeAdminProductPage(data);
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
   * 应用筛选并回到第一页查询
   * @param productName 产品名称
   * @param shelfStatus 上下架状态
   */
  function applyFilters(
    productName: string,
    shelfStatus: '' | AdminProductShelfStatus,
  ) {
    appliedProductName.value = productName.trim();
    appliedShelfStatus.value = shelfStatus;
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void fetchList();
  }

  /**
   * 重置筛选并回到第一页
   */
  function resetFilters() {
    appliedProductName.value = '';
    appliedShelfStatus.value = '';
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void fetchList();
  }

  /**
   * 刷新当前页
   */
  function refresh() {
    void fetchList();
  }

  watch(pageSize, () => {
    if (syncingFromServer.value) {
      return;
    }
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void fetchList();
  });

  watch(currentPage, () => {
    if (syncingFromServer.value) {
      return;
    }
    void fetchList();
  });

  onMounted(() => {
    void fetchList();
  });

  return {
    appliedProductName,
    appliedShelfStatus,
    applyFilters,
    currentPage,
    fetchList,
    loading,
    pageSize,
    records,
    refresh,
    resetFilters,
    total,
  };
}
