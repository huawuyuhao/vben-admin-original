<script lang="ts" setup>
import type { ComputeDemandItem } from '#/types/service/mydemand/compute';

import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Download, Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { downloadFileFromUrl } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  copyComputeDemandApi,
  deleteComputeDemandApi,
  exportComputeDemandApi,
  getComputeDemandListApi,
} from '#/api/service/mydemand/compute';

import {
  COMPUTE_PAGE_SIZE,
  type ComputeStatusFilter,
  type ComputeTimeRange,
  normalizeComputePage,
  parseComputeStatusFilter,
  resolveComputeDemandId,
  resolveComputeDownloadUrl,
} from './data';
import DemandPager from './modules/demand-pager.vue';
import DemandTable from './modules/demand-table.vue';
import DetailDialog from './modules/detail-dialog.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';

/**
 * 门户服务 · 我的算力需求
 * 对接 /demand 列表、增删改、复制、导出、结果预览与下载
 */
defineOptions({ name: 'ServiceMyDemandCompute' });

const route = useRoute();
const router = useRouter();

/** 筛选草稿：需求编号 */
const filterDemandNo = ref('');
/** 筛选草稿：状态 */
const filterStatus = ref<ComputeStatusFilter>('');
/** 筛选草稿：时间范围 */
const filterTimeRange = ref<ComputeTimeRange>(null);

/** 已生效筛选 */
const appliedDemandNo = ref('');
const appliedStatus = ref<ComputeStatusFilter>('');
const appliedTimeRange = ref<ComputeTimeRange>(null);

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(COMPUTE_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 导出中 */
const exporting = ref(false);
/** 悬停导出按钮时显示提示 */
const exportHintVisible = ref(false);
/** 当前页需求列表 */
const demands = ref<ComputeDemandItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 正在复制的需求 ID */
const copyingId = ref<null | number>(null);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** 详情弹窗 */
const detailDialogRef = ref<InstanceType<typeof DetailDialog>>();

/**
 * 组装当前已生效的筛选参数（不含分页）
 */
function buildFilterParams() {
  const range = appliedTimeRange.value;
  return {
    demandNo: appliedDemandNo.value.trim() || undefined,
    status: parseComputeStatusFilter(appliedStatus.value),
    startTime: range?.[0] || undefined,
    endTime: range?.[1] || undefined,
  };
}

/**
 * 拉取当前页需求台账
 */
async function fetchDemands() {
  loading.value = true;
  try {
    const data = await getComputeDemandListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...buildFilterParams(),
    });
    const page = normalizeComputePage(data);
    demands.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    demands.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchDemands();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedDemandNo.value = filterDemandNo.value;
  appliedStatus.value = filterStatus.value;
  appliedTimeRange.value = filterTimeRange.value
    ? [...filterTimeRange.value]
    : null;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterDemandNo.value = '';
  filterStatus.value = '';
  filterTimeRange.value = null;
  appliedDemandNo.value = '';
  appliedStatus.value = '';
  appliedTimeRange.value = null;
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchDemands();
}

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
function handleEdit(row: ComputeDemandItem) {
  void formDialogRef.value?.openEdit(row);
}

/**
 * 打开重新提交弹窗
 * @param row 列表行
 */
function handleResubmit(row: ComputeDemandItem) {
  void formDialogRef.value?.openResubmit(row);
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
    void fetchDemands();
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
    void fetchDemands();
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
    const result = await exportComputeDemandApi(buildFilterParams());
    const downloadUrl = resolveComputeDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.error($t('page.service.mydemand.compute.export.noUrl'));
      return;
    }
    await downloadFileFromUrl({
      source: downloadUrl,
      fileName: result?.fileName?.trim() || undefined,
    });
    ElMessage.success($t('page.service.mydemand.compute.export.success'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    exporting.value = false;
  }
}

/**
 * 表单提交成功后刷新列表
 */
function handleFormSuccess() {
  void fetchDemands();
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchDemands();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchDemands();
});

/**
 * 处理产品「立即使用」等入口携带的 query（demandId / create）
 */
async function handleEntryQuery() {
  const demandId = Number(route.query.demandId);
  const needCreate =
    route.query.create === '1' || Boolean(route.query.productId);

  if (Number.isFinite(demandId) && demandId > 0) {
    await nextTick();
    void formDialogRef.value?.openEdit({ demandId });
    await router.replace({ path: route.path });
    return;
  }

  if (needCreate) {
    await nextTick();
    formDialogRef.value?.openCreate();
    await router.replace({ path: route.path });
  }
}

onMounted(() => {
  void fetchDemands();
  void handleEntryQuery();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.mydemand.compute.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.mydemand.compute.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.mydemand.compute.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
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
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.mydemand.compute.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.service.mydemand.compute.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:demand-no="filterDemandNo"
          v-model:status="filterStatus"
          v-model:time-range="filterTimeRange"
          @search="handleSearch"
          @reset="handleReset"
        />

        <DemandTable
          :copying-id="copyingId"
          :demands="demands"
          :loading="loading"
          @copy="handleCopy"
          @delete="handleDelete"
          @detail="handleDetail"
          @edit="handleEdit"
          @resubmit="handleResubmit"
        />

        <DemandPager
          v-if="demands.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
    <DetailDialog ref="detailDialogRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.compute-page {
  &__export-tip {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
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
