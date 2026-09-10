<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CaseListItem } from '#/types/service/case';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import { getCaseListApi } from '#/api/service/case';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildCaseFilterParams,
  CASE_PAGE_SIZE,
  CASE_PAGE_SIZE_OPTIONS,
  type CaseGridFormValues,
  filterCaseRecordsByType,
  normalizeCasePage,
  useCaseGridFormSchema,
} from './data';
import CaseGrid from './modules/case-grid.vue';

/**
 * 门户服务 · 案例中心列表
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'ServiceCase' });

const router = useRouter();

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const cases = ref<CaseListItem[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useCaseGridFormSchema(),
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: [],
    height: 'auto',
    keepSource: true,
    layouts: [...CARD_LIST_VXE_LAYOUTS],
    minHeight: 0,
    pagerConfig: {
      pageSize: CASE_PAGE_SIZE,
      pageSizes: CASE_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: CaseGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildCaseFilterParams(formValues);
            const data = await getCaseListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              tagName: filters.tagName,
              // 门户案例中心仅展示非草稿
              isDraft: false,
            });
            const pageData = normalizeCasePage(data);
            // 案例类型仅前端作用于当前页
            const records = filterCaseRecordsByType(
              pageData.records,
              filters.caseType,
            );
            cases.value = records;
            return toVxeCardPageResult(pageData);
          } catch {
            cases.value = [];
            return toVxeCardPageResult({ total: 0 });
          } finally {
            loading.value = false;
          }
        },
      },
    },
    rowConfig: {
      keyField: 'caseId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<CaseListItem>,
});

/**
 * 进入案例详情
 * @param item 案例
 */
function goDetail(item: CaseListItem) {
  if (!item.caseId) {
    return;
  }
  void router.push(`/service/case/${item.caseId}`);
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.case.desc')"
    :eyebrow="$t('page.service.case.eyebrow')"
    :title="$t('page.service.case.title')"
  >

    <Grid>
      <template #table-title></template>
      <template #top>
        <CaseGrid
          class="case-list-cards"
          :loading="loading"
          :cases="cases"
          @detail="goDetail"
        />
      </template>
    </Grid>
  </PageListShell>
</template>

<style lang="scss" scoped>
.case-list-cards {
  width: 100%;
  text-align: left;
}
</style>
