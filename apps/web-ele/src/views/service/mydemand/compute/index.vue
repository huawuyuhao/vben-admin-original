<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  ComputeDemandExportParams,
  ComputeDemandItem,
} from '#/types/service/mydemand/compute';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Download, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  copyComputeDemandApi,
  deleteComputeDemandApi,
  exportComputeDemandApi,
  getComputeDemandListApi,
} from '#/api/service/mydemand/compute';
import { downloadExportFile } from '#/store/common';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildComputeFilterParams,
  canDeleteComputeDemand,
  canEditComputeDemand,
  canResubmitComputeDemand,
  COMPUTE_PAGE_SIZE,
  COMPUTE_PAGE_SIZE_OPTIONS,
  type ComputeGridFormValues,
  isComputeDemandDone,
  normalizeComputePage,
  resolveComputeDemandId,
  useComputeColumns,
  useComputeGridFormSchema,
} from './data';
import DetailDialog from './modules/detail-dialog.vue';

/**
 * 门户服务 · 我的算力需求
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'ServiceMyDemandCompute' });

const route = useRoute();
const router = useRouter();

/** 导出中 */
const exporting = ref(false);
/** 悬停导出按钮时显示提示 */
const exportHintVisible = ref(false);
/** 正在复制的需求 ID */
const copyingId = ref<null | number>(null);
/** 最近一次查询生效的筛选条件（供导出使用） */
const appliedFilterParams = ref<ComputeDemandExportParams>({});

/** 详情弹窗 */
const detailDialogRef = ref<InstanceType<typeof DetailDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useComputeGridFormSchema(),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useComputeColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: COMPUTE_PAGE_SIZE,
      pageSizes: COMPUTE_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: ComputeGridFormValues) => {
          const filters = buildComputeFilterParams(formValues);
          appliedFilterParams.value = filters;
          const data = await getComputeDemandListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeComputePage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'demandId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<ComputeDemandItem>,
});

/**
 * 跳转新建需求页
 */
function handleCreate() {
  void router.push({ path: '/service/mydemand/compute/create' });
}

/**
 * 跳转编辑需求页
 * @param row 列表行
 */
function handleEdit(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }
  void router.push({
    path: '/service/mydemand/compute/create',
    query: { id: String(id) },
  });
}

/**
 * 跳转重新提交页
 * @param row 列表行
 */
function handleResubmit(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }
  void router.push({
    path: '/service/mydemand/compute/create',
    query: { id: String(id), resubmit: '1' },
  });
}

/**
 * 打开详情弹窗
 * @param row 列表行
 */
function handleDetail(row: ComputeDemandItem) {
  void detailDialogRef.value?.open(row);
}

/**
 * 删除需求
 * @param row 列表行
 */
async function handleDelete(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }

  try {
    await deleteComputeDemandApi(id);
    ElMessage.success($t('page.service.mydemand.compute.delete.success'));
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 复制历史需求
 * @param row 列表行
 */
async function handleCopy(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }

  copyingId.value = id;
  try {
    const result = await copyComputeDemandApi(id);
    const no = result?.demandNo?.trim();
    ElMessage.success(
      no
        ? $t('page.service.mydemand.compute.copy.successWithNo', [no])
        : $t('page.service.mydemand.compute.copy.success'),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    copyingId.value = null;
  }
}

/**
 * 显示导出提示
 */
function showExportHint() {
  exportHintVisible.value = true;
}

/**
 * 隐藏导出提示
 */
function hideExportHint() {
  exportHintVisible.value = false;
}

/**
 * 按当前筛选导出需求列表
 */
async function handleExport() {
  exporting.value = true;
  try {
    const formValues = (await gridApi.formApi?.getValues()) as
      | ComputeGridFormValues
      | undefined;
    const filters =
      Object.keys(appliedFilterParams.value).length > 0
        ? appliedFilterParams.value
        : buildComputeFilterParams(formValues);

    const result = await exportComputeDemandApi(filters);
    const ok = await downloadExportFile({
      fileUrl: result?.fileUrl,
      fileName: result?.fileName,
    });
    if (!ok) {
      ElMessage.error($t('page.service.mydemand.compute.export.noUrl'));
      return;
    }
    ElMessage.success($t('page.service.mydemand.compute.export.success'));
  } catch {
    // 错误提示由接口层 / 下载工具处理
  } finally {
    exporting.value = false;
  }
}

/**
 * 兼容旧入口 query：跳转到新建/编辑页后清掉列表上的 query
 */
async function handleEntryQuery() {
  const demandId = Number(route.query.demandId ?? route.query.id);
  const needCreate =
    route.query.create === '1' || Boolean(route.query.productId);
  const resubmit =
    route.query.resubmit === '1' || route.query.resubmit === 'true';

  if (Number.isFinite(demandId) && demandId > 0) {
    await router.replace({
      path: '/service/mydemand/compute/create',
      query: {
        id: String(demandId),
        ...(resubmit ? { resubmit: '1' } : {}),
      },
    });
    return;
  }

  if (needCreate) {
    await router.replace({ path: '/service/mydemand/compute/create' });
  }
}

onMounted(() => {
  void handleEntryQuery();
});
</script>

<template>
  <PageListShell
    :desc="$t('page.service.mydemand.compute.desc')"
    :eyebrow="$t('page.service.mydemand.compute.eyebrow')"
    :title="$t('page.service.mydemand.compute.title')"
  >
    <template #actions>
      <Transition name="compute-export-tip">
        <span v-if="exportHintVisible" class="compute-page__export-tip">
          {{ $t('page.service.mydemand.compute.export.hint') }}
        </span>
      </Transition>
      <el-button
        class="mine-shell__action-btn"
        :icon="Download"
        :loading="exporting"
        @click="handleExport"
        @mouseenter="showExportHint"
        @mouseleave="hideExportHint"
        @focus="showExportHint"
        @blur="hideExportHint"
      >
        {{ $t('page.service.mydemand.compute.export.action') }}
      </el-button>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.service.mydemand.compute.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>

      <template #action="{ row }">
        <el-button link type="primary" @click="handleDetail(row)">
          {{ $t('page.service.mydemand.compute.actions.detail') }}
        </el-button>

        <el-button
          v-if="canEditComputeDemand(row.status)"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          {{ $t('page.service.mydemand.compute.actions.edit') }}
        </el-button>

        <el-button
          v-if="canResubmitComputeDemand(row.status)"
          link
          type="warning"
          @click="handleResubmit(row)"
        >
          {{ $t('page.service.mydemand.compute.actions.resubmit') }}
        </el-button>

        <el-button
          link
          type="primary"
          :loading="copyingId === row.demandId"
          @click="handleCopy(row)"
        >
          {{ $t('page.service.mydemand.compute.actions.copy') }}
        </el-button>

        <el-button
          v-if="isComputeDemandDone(row.status)"
          link
          type="success"
          @click="handleDetail(row)"
        >
          {{ $t('page.service.mydemand.compute.actions.result') }}
        </el-button>

        <el-popconfirm
          v-if="canDeleteComputeDemand(row.status)"
          width="260"
          :cancel-button-text="
            $t('page.service.mydemand.compute.delete.cancelBtn')
          "
          :confirm-button-text="
            $t('page.service.mydemand.compute.delete.confirmBtn')
          "
          :title="
            $t('page.service.mydemand.compute.delete.confirm', [
              row.demandName?.trim() ||
                row.demandNo?.trim() ||
                String(row.demandId ?? '') ||
                $t('page.service.mydemand.compute.valueEmpty'),
            ])
          "
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button link type="danger">
              {{ $t('page.service.mydemand.compute.actions.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </Grid>

    <DetailDialog ref="detailDialogRef" />
  </PageListShell>
</template>

<style lang="scss" scoped>
.compute-page {
  &__export-tip {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }
}

.compute-export-tip {
  &-enter-active,
  &-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }
}
</style>
