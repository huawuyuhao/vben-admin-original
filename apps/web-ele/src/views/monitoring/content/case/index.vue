<script lang="ts" setup>
import type { CaseListItem } from '#/types/monitoring/content/case';

import type { CaseDraftFilter, CaseTypeFilter } from './data';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { deleteCaseApi } from '#/api/monitoring/content/case';

import ContentPageShell from '../home/modules/content-page-shell.vue';
import { useAdminCaseList } from './composables/use-admin-case-list';
import CaseAuditDialog from './modules/case-audit-dialog.vue';
import CaseDetailDrawer from './modules/case-detail-drawer.vue';
import CaseFormDialog from './modules/case-form-dialog.vue';
import CaseGrid from './modules/case-grid.vue';
import CasePager from './modules/case-pager.vue';
import FilterBar from './modules/filter-bar.vue';

defineOptions({ name: 'MonitoringContentCase' });

/** 标签筛选草稿 */
const tagName = ref('');
/** 案例类型筛选草稿 */
const caseTypeFilter = ref<CaseTypeFilter>('');
/** 是否草稿筛选草稿 */
const isDraftFilter = ref<CaseDraftFilter>('');
/** 详情抽屉可见 */
const detailVisible = ref(false);
/** 当前详情条目 */
const detailItem = ref<CaseListItem | null>(null);
/** 表单弹窗引用 */
const formDialogRef = ref<InstanceType<typeof CaseFormDialog>>();
/** 审核弹窗引用 */
const auditDialogRef = ref<InstanceType<typeof CaseAuditDialog>>();

const {
  applyFilters,
  currentPage,
  displayRecords,
  loading,
  pageSize,
  records,
  refresh,
  resetFilters,
  total,
} = useAdminCaseList();

/**
 * 提交筛选查询
 */
function handleSearch() {
  applyFilters(tagName.value, caseTypeFilter.value, isDraftFilter.value);
}

/**
 * 重置筛选条件
 */
function handleReset() {
  tagName.value = '';
  caseTypeFilter.value = '';
  isDraftFilter.value = '';
  resetFilters();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  refresh();
}

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
    refresh();
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
  refresh();
}
</script>

<template>
  <ContentPageShell
    :eyebrow="$t('page.monitoring.content.case.eyebrow')"
    :title="$t('page.monitoring.content.case.title')"
    :desc="$t('page.monitoring.content.case.desc')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        @click="handleAdd"
      >
        <el-icon><Plus /></el-icon>
        {{ $t('page.monitoring.content.case.add') }}
      </el-button>
    </template>

    <FilterBar
      v-model:tag-name="tagName"
      v-model:case-type="caseTypeFilter"
      v-model:is-draft="isDraftFilter"
      :refreshing="loading"
      @refresh="handleRefresh"
      @reset="handleReset"
      @search="handleSearch"
    />

    <CaseGrid
      :loading="loading"
      :cases="displayRecords"
      @detail="handleDetail"
      @edit="handleEdit"
      @remove="handleRemove"
      @submit-audit="handleSubmitAudit"
    />

    <CasePager
      v-if="records.length > 0 || loading || total > 0"
      v-model:page="currentPage"
      v-model:page-size="pageSize"
      :disabled="loading"
      :total="total"
    />

    <CaseDetailDrawer v-model:visible="detailVisible" :item="detailItem" />

    <CaseFormDialog ref="formDialogRef" @success="handleFormSuccess" />

    <CaseAuditDialog ref="auditDialogRef" @success="handleFormSuccess" />
  </ContentPageShell>
</template>
