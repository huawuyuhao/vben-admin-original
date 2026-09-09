import type { CaseListItem } from '#/types/monitoring/content/case';

import { computed, onMounted, ref, watch } from 'vue';

import { getCaseListApi } from '#/api/service/case';

import {
  CASE_PAGE_SIZE,
  type CaseDraftFilter,
  type CaseTypeFilter,
  filterCaseRecordsByType,
  normalizeCasePage,
  resolveCaseListIsDraft,
} from '../data';

/**
 * 管理端案例内容列表分页逻辑
 * 标签 / 是否草稿走接口；案例类型仅前端筛当前页
 * @returns 列表状态、筛选条件与刷新方法
 */
export function useAdminCaseList() {
  const loading = ref(false);
  /** 当前页接口原始案例 */
  const records = ref<CaseListItem[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(CASE_PAGE_SIZE);
  const syncingFromServer = ref(false);

  /** 标签名称（已生效，走接口） */
  const appliedTagName = ref('');
  /** 是否草稿（已生效，走接口 isDraft） */
  const appliedIsDraft = ref<CaseDraftFilter>('');
  /** 案例类型（已生效，仅前端筛当前页） */
  const appliedCaseType = ref<CaseTypeFilter>('');

  /** 表格展示数据：案例类型前端过滤当前页 */
  const displayRecords = computed(() =>
    filterCaseRecordsByType(records.value, appliedCaseType.value),
  );

  /**
   * 按当前分页与筛选拉取列表
   */
  async function fetchList() {
    loading.value = true;
    try {
      const data = await getCaseListApi({
        page: currentPage.value,
        pageSize: pageSize.value,
        tagName: appliedTagName.value.trim() || undefined,
        isDraft: resolveCaseListIsDraft(appliedIsDraft.value),
      });
      const page = normalizeCasePage(data);
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
   * @param tagName 标签名称
   * @param caseType 案例类型（前端筛当前页）
   * @param isDraft 是否草稿（走接口）
   */
  function applyFilters(
    tagName: string,
    caseType: CaseTypeFilter,
    isDraft: CaseDraftFilter = '',
  ) {
    appliedTagName.value = tagName.trim();
    appliedCaseType.value = caseType;
    appliedIsDraft.value = isDraft;
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
    appliedTagName.value = '';
    appliedCaseType.value = '';
    appliedIsDraft.value = '';
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void fetchList();
  }

  /**
   * 刷新当前页（保留已生效筛选）
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
    appliedCaseType,
    appliedIsDraft,
    appliedTagName,
    applyFilters,
    currentPage,
    displayRecords,
    fetchList,
    loading,
    pageSize,
    records,
    refresh,
    resetFilters,
    total,
  };
}
