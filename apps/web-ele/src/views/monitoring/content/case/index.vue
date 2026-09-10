<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CaseListItem } from '#/types/monitoring/content/case';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import { deleteCaseApi } from '#/api/monitoring/content/case';
import { getCaseListApi } from '#/api/service/case';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  type AdminCaseGridFormValues,
  buildAdminCaseFilterParams,
  CASE_PAGE_SIZE,
  CASE_PAGE_SIZE_OPTIONS,
  filterCaseRecordsByType,
  normalizeCasePage,
  useAdminCaseGridFormSchema,
} from './data';
import CaseAuditDialog from './modules/case-audit-dialog.vue';
import CaseDetailDrawer from './modules/case-detail-drawer.vue';
import CaseFormDialog from './modules/case-form-dialog.vue';
import CaseGrid from './modules/case-grid.vue';

/**
 * 内容管理 · 案例内容管理
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'MonitoringContentCase' });

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const cases = ref<CaseListItem[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);
/** 详情抽屉可见 */
const detailVisible = ref(false);
/** 当前详情条目 */
const detailItem = ref<CaseListItem | null>(null);
/** 表单弹窗引用 */
const formDialogRef = ref<InstanceType<typeof CaseFormDialog>>();
/** 审核弹窗引用 */
const auditDialogRef = ref<InstanceType<typeof CaseAuditDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAdminCaseGridFormSchema(),
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
        query: async ({ page }, formValues?: AdminCaseGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildAdminCaseFilterParams(formValues);
            const data = await getCaseListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              tagName: filters.tagName,
              isDraft: filters.isDraft,
            });
            const pageData = normalizeCasePage(data);
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
 * 打开案例详情抽屉
 * @param item 案例条目
 */
function handleDetail(item: CaseListItem) {
  detailItem.value = item;
  detailVisible.value = true;
}

/**
 * 打开新增案例弹窗
 */
function handleAdd() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑案例弹窗
 * @param item 案例条目
 */
function handleEdit(item: CaseListItem) {
  formDialogRef.value?.openEdit(item);
}

/**
 * 删除案例
 * @param item 案例条目
 */
async function handleRemove(item: CaseListItem) {
  if (!item.caseId) {
    return;
  }
  const label = item.title?.trim() || String(item.caseId);

  try {
    await deleteCaseApi(item.caseId);
    ElMessage.success(
      $t('page.monitoring.content.case.deleteSuccess', [label]),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 打开提交审核弹窗
 * @param item 案例条目
 */
function handleSubmitAudit(item: CaseListItem) {
  auditDialogRef.value?.open(item);
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  gridApi.query();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.monitoring.content.case.desc')"
    :eyebrow="$t('page.monitoring.content.case.eyebrow')"
    :title="$t('page.monitoring.content.case.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        {{ $t('page.monitoring.content.case.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
      <template #top>
        <CaseGrid
          class="admin-case-list-cards"
          :loading="loading"
          :cases="cases"
          @detail="handleDetail"
          @edit="handleEdit"
          @remove="handleRemove"
          @submit-audit="handleSubmitAudit"
        />
      </template>
    </Grid>

    <CaseDetailDrawer v-model:visible="detailVisible" :item="detailItem" />

    <CaseFormDialog ref="formDialogRef" @success="handleFormSuccess" />

    <CaseAuditDialog ref="auditDialogRef" @success="handleFormSuccess" />
  </PageListShell>
</template>

<style lang="scss" scoped>
.admin-case-list-cards {
  width: 100%;
  text-align: left;
}
</style>
