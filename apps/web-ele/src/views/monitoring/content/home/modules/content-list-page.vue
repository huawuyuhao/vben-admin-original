<script lang="ts" setup>
import type { PortalContentItem, PortalContentType } from '#/types/monitoring/content/home/common';
import type {
  PortalContentAuditStatusFilter,
  PortalContentEnableStatusFilter,
  PortalContentListFilters,
} from '../data';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';

import {
  auditPortalContentApi,
  deletePortalContentApi,
  updatePortalContentApi,
  updatePortalContentShelfApi,
} from '#/api/monitoring/content/home/common';

import { usePortalContentList } from '../composables/use-portal-content-list';
import {
  PORTAL_CONTENT_AUDIT_PENDING,
  PORTAL_CONTENT_TYPE,
  buildPortalContentSortMaps,
  filterPortalContentRecords,
  hasPortalContentActiveFilters,
  hasPortalContentSortChanges,
  pickPortalContentImageRaw,
  supportsPortalContentSort,
} from '../data';
import ContentDataTable from './content-data-table.vue';
import ContentFilterBar from './content-filter-bar.vue';
import ContentFormDialog from './content-form-dialog.vue';
import ContentPageShell from './content-page-shell.vue';
import ContentPager from './content-pager.vue';

defineOptions({ name: 'PortalContentListPage' });

const props = defineProps<{
  /** 内容类型枚举 */
  contentType: PortalContentType;
  /** 页面 i18n 键名（banner / bizService / news / billing / about） */
  pageKey: 'about' | 'banner' | 'billing' | 'bizService' | 'news';
}>();

const keyword = ref('');
const enableStatusFilter = ref<PortalContentEnableStatusFilter>('');
const auditStatusFilter = ref<PortalContentAuditStatusFilter>('');
/** 已生效的筛选条件（点击查询后应用） */
const appliedFilters = ref<PortalContentListFilters>({
  keyword: '',
  enableStatus: '',
  auditStatus: '',
});
const sortDrafts = ref<Record<number, number>>({});
const sortBaseline = ref<Record<number, number>>({});
const savingSort = ref(false);
const formDialogRef = ref<InstanceType<typeof ContentFormDialog>>();

const {
  currentPage,
  loading,
  pageSize,
  records,
  refresh,
  total,
} = usePortalContentList(props.contentType);

/** 是否处于前端筛选模式 */
const filterMode = computed(() =>
  hasPortalContentActiveFilters(appliedFilters.value),
);

/** 表格展示数据：无筛选走接口当前页；有筛选仅过滤当前页 */
const displayRecords = computed(() => {
  if (!filterMode.value) {
    return records.value;
  }
  return filterPortalContentRecords(records.value, appliedFilters.value);
});

/** 分页总条数（始终使用接口 total） */
const displayTotal = computed(() => total.value);

const i18nBase = computed(() => `page.monitoring.content.home.${props.pageKey}`);

const showSortActions = computed(() => supportsPortalContentSort(props.contentType));

const hasSortChanges = computed(() =>
  hasPortalContentSortChanges(sortDrafts.value, sortBaseline.value),
);

/** 是否展示启用 / 审核状态筛选（banner / news / service） */
const showStatusFilters = computed(
  () =>
    props.contentType === PORTAL_CONTENT_TYPE.BANNER ||
    props.contentType === PORTAL_CONTENT_TYPE.NEWS ||
    props.contentType === PORTAL_CONTENT_TYPE.SERVICE,
);

watch(
  displayRecords,
  (rows) => {
    const maps = buildPortalContentSortMaps(rows);
    sortDrafts.value = maps.draft;
    sortBaseline.value = maps.baseline;
  },
  { immediate: true },
);

/**
 * 应用筛选（仅作用于当前页已加载数据）
 */
function handleSearch() {
  appliedFilters.value = {
    keyword: keyword.value.trim(),
    enableStatus: enableStatusFilter.value,
    auditStatus: auditStatusFilter.value,
  };
}

/**
 * 重置筛选条件
 */
function handleReset() {
  keyword.value = '';
  enableStatusFilter.value = '';
  auditStatusFilter.value = '';
  appliedFilters.value = {
    keyword: '',
    enableStatus: '',
    auditStatus: '',
  };
}

/**
 * 刷新当前页列表
 */
function handleRefresh() {
  refresh();
}

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑弹窗
 * @param row 行数据
 */
function handleEdit(row: PortalContentItem) {
  formDialogRef.value?.openEdit(row);
}

/**
 * 打开查看弹窗
 * @param row 行数据
 */
function handleView(row: PortalContentItem) {
  formDialogRef.value?.openView(row);
}

/**
 * 提交审核（二次确认由表格 Popconfirm 触发）
 * @param row 行数据
 */
async function handleSubmitAudit(row: PortalContentItem) {
  const label = row.title?.trim() || String(row.contentId);

  try {
    await auditPortalContentApi(row.contentId, {
      content: props.contentType,
      auditStatus: PORTAL_CONTENT_AUDIT_PENDING,
    });
    ElMessage.success(
      $t('page.monitoring.content.home.common.submitAuditSuccess', [label]),
    );
    refresh();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 下线内容（二次确认由表格 Popconfirm 触发）
 * @param row 行数据
 */
async function handleOffline(row: PortalContentItem) {
  const label = row.title?.trim() || String(row.contentId);

  try {
    await updatePortalContentShelfApi(row.contentId, { action: 'unshelf' });
    ElMessage.success(
      $t('page.monitoring.content.home.common.offlineSuccess', [label]),
    );
    refresh();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 删除内容（二次确认由表格 Popconfirm 触发）
 * @param row 行数据
 */
async function handleRemove(row: PortalContentItem) {
  const label = row.title?.trim() || String(row.contentId);

  try {
    await deletePortalContentApi(row.contentId, {
      content: props.contentType,
    });
    ElMessage.success($t('ui.actionMessage.deleteSuccess', [label]));
    refresh();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 保存当前页已修改的排序
 */
async function handleSaveSort() {
  if (!hasSortChanges.value) {
    return;
  }

  const changedRows = displayRecords.value.filter(
    (row) => sortDrafts.value[row.contentId] !== sortBaseline.value[row.contentId],
  );

  if (!changedRows.length) {
    return;
  }

  savingSort.value = true;
  try {
    await Promise.all(
      changedRows.map((row) =>
        updatePortalContentApi(row.contentId, {
          content: props.contentType,
          title: row.title || '',
          contentText: row.content,
          imageUrl: pickPortalContentImageRaw(row, props.contentType),
          sortOrder: sortDrafts.value[row.contentId] ?? (Number(row.sortOrder) || 0),
        }),
      ),
    );
    ElMessage.success($t('page.monitoring.content.home.common.saveSortSuccess'));
    refresh();
  } finally {
    savingSort.value = false;
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  void handleRefresh();
}
</script>

<template>
  <ContentPageShell
    :eyebrow="$t(`${i18nBase}.eyebrow`)"
    :title="$t(`${i18nBase}.title`)"
    :desc="$t(`${i18nBase}.desc`)"
  >
    <template #actions>
      <span
        v-if="showSortActions && hasSortChanges"
        class="content-list-page__sort-tip"
      >
        {{ $t('page.monitoring.content.home.common.saveSortHint') }}
      </span>
      <el-button
        v-if="showSortActions"
        class="mine-shell__action-btn"
        type="primary"
        :disabled="!hasSortChanges"
        :loading="savingSort"
        @click="handleSaveSort"
      >
        {{ $t('page.monitoring.content.home.common.saveSort') }}
      </el-button>
      <el-button
        class="mine-shell__action-btn"
        :icon="Refresh"
        :loading="loading"
        @click="handleRefresh"
      >
        {{ $t('page.monitoring.content.home.common.refresh') }}
      </el-button>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t(`${i18nBase}.add`) }}
      </el-button>
    </template>

    <ContentFilterBar
      v-model:keyword="keyword"
      v-model:enable-status="enableStatusFilter"
      v-model:audit-status="auditStatusFilter"
      :keyword-placeholder-key="`${i18nBase}.keywordPlaceholder`"
      :loading="loading"
      :show-status-filters="showStatusFilters"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ContentDataTable
      v-model:sort-drafts="sortDrafts"
      :content-type="contentType"
      :loading="loading"
      :records="displayRecords"
      @edit="handleEdit"
      @view="handleView"
      @submit-audit="handleSubmitAudit"
      @offline="handleOffline"
      @remove="handleRemove"
    />

    <ContentPager
      v-if="displayRecords.length > 0 || loading || displayTotal > 0"
      v-model:page="currentPage"
      v-model:page-size="pageSize"
      :disabled="loading"
      :total="displayTotal"
    />

    <ContentFormDialog
      ref="formDialogRef"
      :content-type="contentType"
      @success="handleFormSuccess"
    />
  </ContentPageShell>
</template>

<style lang="scss" scoped>
.content-list-page {
  &__sort-tip {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
    white-space: nowrap;
  }
}
</style>
