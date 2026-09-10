<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  PortalContentId,
  PortalContentItem,
  PortalContentType,
} from '#/types/monitoring/content/home/common';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  auditPortalContentApi,
  deletePortalContentApi,
  getPortalContentListApi,
  updatePortalContentApi,
  updatePortalContentShelfApi,
} from '#/api/monitoring/content/home/common';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildPortalContentListFiltersFromForm,
  buildPortalContentSortMaps,
  buildPortalContentWritePayloadFromRow,
  canSubmitPortalContentAudit,
  filterPortalContentRecords,
  getPortalContentAuditLabelKey,
  getPortalContentAuditTagType,
  getPortalContentStatusLabelKey,
  getPortalContentStatusTagType,
  hasPortalContentActiveFilters,
  hasPortalContentImage,
  hasPortalContentSortChanges,
  hasPortalContentStatusValue,
  PORTAL_CONTENT_AUDIT_SUBMIT_STATUS,
  PORTAL_CONTENT_PAGE_SIZE,
  PORTAL_CONTENT_PAGE_SIZE_OPTIONS,
  PORTAL_CONTENT_STATUS_DISABLED,
  PORTAL_CONTENT_STATUS_ENABLED,
  type PortalContentGridFormValues,
  type PortalContentPageKey,
  normalizePortalContentPage,
  resolvePortalContentRowImageUrl,
  supportsPortalContentSort,
  usePortalContentColumns,
  usePortalContentGridFormSchema,
} from '../data';
import ContentFormDialog from './content-form-dialog.vue';

/**
 * 监控 · 首页内容管理共用列表
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'PortalContentListPage' });

const props = defineProps<{
  /** 内容类型枚举 */
  contentType: PortalContentType;
  /** 页面 i18n 键名（banner / bizService / news / billing / about） */
  pageKey: PortalContentPageKey;
}>();

/** 排序草稿（contentId -> sortOrder） */
const sortDrafts = ref<Record<string, number>>({});
/** 排序基线（用于判断是否有变更） */
const sortBaseline = ref<Record<string, number>>({});
/** 保存排序中 */
const savingSort = ref(false);
/** 当前页展示数据（供排序保存与图片预览） */
const displayRecords = ref<PortalContentItem[]>([]);
/** 表单弹窗 */
const formDialogRef = ref<InstanceType<typeof ContentFormDialog>>();

const i18nBase = computed(
  () => `page.monitoring.content.home.${props.pageKey}`,
);

const showSortActions = computed(() =>
  supportsPortalContentSort(props.contentType),
);

const hasSortChanges = computed(() =>
  hasPortalContentSortChanges(sortDrafts.value, sortBaseline.value),
);

/** 表格内可预览的图片列表（已归一化 URL） */
const previewImageList = computed(() =>
  displayRecords.value
    .map((row) => resolvePortalContentRowImageUrl(row, props.contentType))
    .filter((url) => hasPortalContentImage(url)),
);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: usePortalContentGridFormSchema(props.contentType, props.pageKey),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: usePortalContentColumns(props.contentType),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: PORTAL_CONTENT_PAGE_SIZE,
      pageSizes: PORTAL_CONTENT_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        /**
         * 列表查询：接口仅支持 content / page / pageSize，
         * 关键词与状态筛选在拿到当前页 records 后做本地 filter；
         * total 仍使用接口 total（与旧行为一致）。
         */
        query: async ({ page }, formValues?: PortalContentGridFormValues) => {
          const data = await getPortalContentListApi({
            content: props.contentType,
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          const pageResult = normalizePortalContentPage(data);
          const filters = buildPortalContentListFiltersFromForm(formValues);
          const records = hasPortalContentActiveFilters(filters)
            ? filterPortalContentRecords(pageResult.records, filters)
            : pageResult.records;

          displayRecords.value = records;
          const maps = buildPortalContentSortMaps(records);
          sortDrafts.value = maps.draft;
          sortBaseline.value = maps.baseline;

          return toVxePageResult({
            records,
            total: pageResult.total,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'contentId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<PortalContentItem>,
});

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
      auditStatus: PORTAL_CONTENT_AUDIT_SUBMIT_STATUS,
    });
    ElMessage.success(
      $t('page.monitoring.content.home.common.submitAuditSuccess', [label]),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 上线内容（启用，二次确认由表格 Popconfirm 触发）
 * @param row 行数据
 */
async function handleOnline(row: PortalContentItem) {
  const label = row.title?.trim() || String(row.contentId);

  try {
    await updatePortalContentShelfApi(row.contentId, {
      content: props.contentType,
      action: 'shelf',
    });
    ElMessage.success(
      $t('page.monitoring.content.home.common.onlineSuccess', [label]),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 下线内容（停用，二次确认由表格 Popconfirm 触发）
 * @param row 行数据
 */
async function handleOffline(row: PortalContentItem) {
  const label = row.title?.trim() || String(row.contentId);

  try {
    await updatePortalContentShelfApi(row.contentId, {
      content: props.contentType,
      action: 'unshelf',
    });
    ElMessage.success(
      $t('page.monitoring.content.home.common.offlineSuccess', [label]),
    );
    gridApi.query();
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
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 更新单行排序草稿
 * @param contentId 内容 ID
 * @param value 排序值
 */
function updateSortDraft(contentId: PortalContentId, value?: number) {
  sortDrafts.value = {
    ...sortDrafts.value,
    [String(contentId)]: Number(value) || 0,
  };
}

/**
 * 保存当前页已修改的排序
 */
async function handleSaveSort() {
  if (!hasSortChanges.value) {
    return;
  }

  const changedRows = displayRecords.value.filter(
    (row) =>
      sortDrafts.value[String(row.contentId)] !==
      sortBaseline.value[String(row.contentId)],
  );

  if (!changedRows.length) {
    return;
  }

  savingSort.value = true;
  try {
    await Promise.all(
      changedRows.map((row) =>
        updatePortalContentApi(
          row.contentId,
          buildPortalContentWritePayloadFromRow(
            row,
            props.contentType,
            sortDrafts.value[String(row.contentId)] ??
              (Number(row.sortOrder) || 0),
          ),
        ),
      ),
    );
    ElMessage.success($t('page.monitoring.content.home.common.saveSortSuccess'));
    gridApi.query();
  } finally {
    savingSort.value = false;
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  gridApi.query();
}

/**
 * 获取行图片地址
 * @param row 行数据
 */
function rowImageUrl(row: PortalContentItem): string {
  return resolvePortalContentRowImageUrl(row, props.contentType);
}

/**
 * 获取预览图在列表中的索引
 * @param url 图片地址
 */
function previewIndex(url: string) {
  if (!hasPortalContentImage(url)) {
    return 0;
  }
  const index = previewImageList.value.indexOf(url);
  return index >= 0 ? index : 0;
}

/**
 * 解析启用状态文案
 * @param status 状态码
 */
function statusLabel(status?: null | number) {
  const key = getPortalContentStatusLabelKey(status);
  return $t(`page.monitoring.content.home.common.status.${key}`);
}

/**
 * 解析审核状态文案
 * @param auditStatus 审核状态码
 */
function auditLabel(auditStatus?: null | number) {
  const key = getPortalContentAuditLabelKey(auditStatus);
  return $t(`page.monitoring.content.home.common.audit.${key}`);
}

/**
 * 提交审核确认文案
 * @param row 行数据
 */
function submitAuditConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('page.monitoring.content.home.common.submitAuditConfirm', [label]);
}

/**
 * 上线确认文案
 * @param row 行数据
 */
function onlineConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('page.monitoring.content.home.common.onlineConfirm', [label]);
}

/**
 * 下线确认文案
 * @param row 行数据
 */
function offlineConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('page.monitoring.content.home.common.offlineConfirm', [label]);
}

/**
 * 删除确认文案
 * @param row 行数据
 */
function deleteConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('ui.actionMessage.deleteConfirm', [label]);
}
</script>

<template>
  <PageListShell
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
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t(`${i18nBase}.add`) }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>

      <template #image="{ row }">
        <el-image
          v-if="hasPortalContentImage(rowImageUrl(row))"
          class="content-list-page__thumb"
          fit="cover"
          lazy
          preview-teleported
          :src="rowImageUrl(row)"
          :preview-src-list="previewImageList"
          :initial-index="previewIndex(rowImageUrl(row))"
        />
        <span v-else class="content-list-page__placeholder">—</span>
      </template>

      <template #status="{ row }">
        <el-tag
          :type="getPortalContentStatusTagType(row.status)"
          effect="light"
          size="small"
        >
          {{ statusLabel(row.status) }}
        </el-tag>
      </template>

      <template #auditStatus="{ row }">
        <el-tag
          v-if="row.auditStatus !== null && row.auditStatus !== undefined"
          :type="getPortalContentAuditTagType(row.auditStatus)"
          effect="light"
          size="small"
        >
          {{ auditLabel(row.auditStatus) }}
        </el-tag>
        <span v-else class="content-list-page__placeholder">—</span>
      </template>

      <template #sortEdit="{ row }">
        <el-input-number
          class="content-list-page__sort-input"
          :min="0"
          :model-value="sortDrafts[String(row.contentId)]"
          controls-position="right"
          size="small"
          @update:model-value="
            (v: number | undefined) => updateSortDraft(row.contentId, v)
          "
        />
      </template>

      <template #action="{ row }">
        <div class="content-list-page__ops">
          <el-button link type="primary" @click="handleEdit(row)">
            {{ $t('page.monitoring.content.home.common.actions.edit') }}
          </el-button>
          <el-button link type="primary" @click="handleView(row)">
            {{ $t('page.monitoring.content.home.common.actions.view') }}
          </el-button>
          <el-popconfirm
            v-if="canSubmitPortalContentAudit(row.auditStatus)"
            :title="submitAuditConfirmTitle(row)"
            width="220"
            :confirm-button-text="$t('common.confirm')"
            :cancel-button-text="$t('common.cancel')"
            @confirm="handleSubmitAudit(row)"
          >
            <template #reference>
              <el-button link type="primary">
                {{
                  $t('page.monitoring.content.home.common.actions.submitAudit')
                }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-button v-else link type="primary" disabled>
            {{ $t('page.monitoring.content.home.common.actions.submitAudit') }}
          </el-button>
          <el-popconfirm
            v-if="
              hasPortalContentStatusValue(row.status) &&
              Number(row.status) === PORTAL_CONTENT_STATUS_DISABLED
            "
            :title="onlineConfirmTitle(row)"
            width="220"
            :confirm-button-text="$t('common.confirm')"
            :cancel-button-text="$t('common.cancel')"
            @confirm="handleOnline(row)"
          >
            <template #reference>
              <el-button link type="success">
                {{ $t('page.monitoring.content.home.common.actions.online') }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            v-else-if="
              hasPortalContentStatusValue(row.status) &&
              Number(row.status) === PORTAL_CONTENT_STATUS_ENABLED
            "
            :title="offlineConfirmTitle(row)"
            width="220"
            :confirm-button-text="$t('common.confirm')"
            :cancel-button-text="$t('common.cancel')"
            confirm-button-type="warning"
            @confirm="handleOffline(row)"
          >
            <template #reference>
              <el-button link type="warning">
                {{ $t('page.monitoring.content.home.common.actions.offline') }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            :title="deleteConfirmTitle(row)"
            width="220"
            :confirm-button-text="$t('common.confirm')"
            :cancel-button-text="$t('common.cancel')"
            confirm-button-type="danger"
            @confirm="handleRemove(row)"
          >
            <template #reference>
              <el-button link type="danger">
                {{ $t('page.monitoring.content.home.common.actions.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </Grid>

    <ContentFormDialog
      ref="formDialogRef"
      :content-type="contentType"
      @success="handleFormSuccess"
    />
  </PageListShell>
</template>

<style lang="scss" scoped>
.content-list-page {
  &__sort-tip {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }

  &__thumb {
    display: block;
    width: 120px;
    height: 68px;
    margin: 0 auto;
    cursor: zoom-in;
    border-radius: 6px;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
    }
  }

  &__sort-input {
    width: 120px;
  }

  &__ops {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 0 2px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    :deep(.el-button.is-link) {
      flex-shrink: 0;
      padding-right: 4px;
      padding-left: 4px;
    }
  }

  &__placeholder {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
