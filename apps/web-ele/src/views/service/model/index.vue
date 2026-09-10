<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ModelInfo } from '#/types/service/model';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Download, Switch } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import { getModelListApi } from '#/api/service/model';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildModelFilterParams,
  canEvaluateModel,
  exportModelInfoTemplate,
  MODEL_COMPARE_MAX,
  MODEL_PAGE_SIZE,
  MODEL_PAGE_SIZE_OPTIONS,
  type ModelGridFormValues,
  normalizeModelPage,
  useModelGridFormSchema,
} from './data';
import CompareDialog from './modules/compare-dialog.vue';
import EvaluateDialog from './modules/evaluate-dialog.vue';
import ModelGrid from './modules/model-grid.vue';

/**
 * 门户服务 · 模型服务列表
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'ServiceModel' });

const router = useRouter();

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const models = ref<ModelInfo[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);
/** 对比弹窗 */
const compareVisible = ref(false);
/** 评价弹窗 */
const evaluateVisible = ref(false);
/** 当前评价目标 */
const evaluateTarget = ref<ModelInfo | null>(null);
/** 已选对比模型 ID（跨页保留） */
const compareIds = ref<number[]>([]);
/** 是否处于导出勾选模式 */
const exportSelecting = ref(false);
/** 已选导出模型 ID（仅当前页） */
const exportIds = ref<number[]>([]);
/** 导出中 */
const exporting = ref(false);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useModelGridFormSchema(),
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
      pageSize: MODEL_PAGE_SIZE,
      pageSizes: MODEL_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: ModelGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildModelFilterParams(formValues);
            const data = await getModelListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...filters,
            });
            const normalized = normalizeModelPage(data);
            models.value = normalized.records;
            // 翻页后仅保留仍在当前页的导出勾选
            if (exportSelecting.value) {
              const pageIdSet = new Set(
                normalized.records.map((item) => item.modelId),
              );
              exportIds.value = exportIds.value.filter((id) =>
                pageIdSet.has(id),
              );
            }
            return toVxeCardPageResult(normalized);
          } catch {
            models.value = [];
            return toVxeCardPageResult({ total: 0 });
          } finally {
            loading.value = false;
          }
        },
      },
    },
    rowConfig: {
      keyField: 'modelId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<ModelInfo>,
});

/**
 * 清空导出勾选
 */
function clearExportSelection() {
  exportIds.value = [];
}

/**
 * 退出导出勾选模式
 */
function exitExportMode() {
  exportSelecting.value = false;
  clearExportSelection();
}

/**
 * 进入模型详情
 * @param item 模型
 */
function goDetail(item: ModelInfo) {
  if (!item.modelId || exportSelecting.value) {
    return;
  }
  void router.push(`/service/model/${item.modelId}`);
}

/**
 * 切换对比勾选
 * @param payload 勾选结果
 */
function handleCompareChange(payload: { checked: boolean; modelId: number }) {
  const { checked, modelId } = payload;
  if (!modelId) {
    return;
  }
  if (checked) {
    if (compareIds.value.includes(modelId)) {
      return;
    }
    if (compareIds.value.length >= MODEL_COMPARE_MAX) {
      ElMessage.warning(
        $t('page.service.model.compare.maxTip', [String(MODEL_COMPARE_MAX)]),
      );
      return;
    }
    compareIds.value = [...compareIds.value, modelId];
    return;
  }
  compareIds.value = compareIds.value.filter((id) => id !== modelId);
}

/**
 * 切换导出勾选
 * @param payload 勾选结果
 */
function handleExportChange(payload: { checked: boolean; modelId: number }) {
  const { checked, modelId } = payload;
  if (!modelId) {
    return;
  }
  if (checked) {
    if (!exportIds.value.includes(modelId)) {
      exportIds.value = [...exportIds.value, modelId];
    }
    return;
  }
  exportIds.value = exportIds.value.filter((id) => id !== modelId);
}

/**
 * 本页全选导出
 */
function handleExportSelectAll() {
  exportIds.value = models.value
    .map((item) => item.modelId)
    .filter((id) => !!id);
}

/**
 * 打开对比弹窗
 */
function handleCompare() {
  if (compareIds.value.length < 2) {
    ElMessage.warning($t('page.service.model.compare.minTip'));
    return;
  }
  compareVisible.value = true;
}

/**
 * 打开评价弹窗
 * @param item 模型
 */
function handleEvaluate(item: ModelInfo) {
  if (exportSelecting.value || !canEvaluateModel(item)) {
    return;
  }
  evaluateTarget.value = item;
  evaluateVisible.value = true;
}

/**
 * 进入导出勾选，或确认导出已选模型
 */
function handleExport() {
  if (!exportSelecting.value) {
    if (!models.value.length) {
      ElMessage.warning($t('page.service.model.export.noData'));
      return;
    }
    exportSelecting.value = true;
    clearExportSelection();
    return;
  }

  const selected = models.value.filter((item) =>
    exportIds.value.includes(item.modelId),
  );
  if (!selected.length) {
    ElMessage.warning($t('page.service.model.export.empty'));
    return;
  }

  exporting.value = true;
  try {
    exportModelInfoTemplate(selected);
    ElMessage.success($t('page.service.model.export.success'));
    exitExportMode();
  } catch {
    ElMessage.error($t('page.service.model.export.failed'));
  } finally {
    exporting.value = false;
  }
}

/**
 * 取消导出勾选模式
 */
function handleExportCancel() {
  exitExportMode();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.model.desc')"
    :eyebrow="$t('page.service.model.eyebrow')"
    :title="$t('page.service.model.title')"
  >
    <template #actions>
      <template v-if="exportSelecting">
        <el-button
          class="mine-shell__action-btn"
          @click="handleExportSelectAll"
        >
          {{ $t('page.service.model.export.selectAll') }}
        </el-button>
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          :icon="Download"
          :loading="exporting"
          :disabled="!exportIds.length"
          @click="handleExport"
        >
          {{
            $t('page.service.model.export.confirm', [
              String(exportIds.length),
            ])
          }}
        </el-button>
        <el-button
          class="mine-shell__action-btn"
          @click="handleExportCancel"
        >
          {{ $t('page.service.model.export.cancel') }}
        </el-button>
      </template>
      <template v-else>
        <el-button
          class="mine-shell__action-btn"
          :disabled="compareIds.length < 2"
          :icon="Switch"
          @click="handleCompare"
        >
          {{
            $t('page.service.model.compare.action', [
              String(compareIds.length),
            ])
          }}
        </el-button>
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          :icon="Download"
          @click="handleExport"
        >
          {{ $t('page.service.model.export.action') }}
        </el-button>
      </template>
    </template>

    <Grid>
      <template #table-title></template>
      <template #top>
        <ModelGrid
          class="model-list-cards"
          :loading="loading"
          :models="models"
          :compare-ids="compareIds"
          :compare-max="MODEL_COMPARE_MAX"
          :export-selecting="exportSelecting"
          :export-ids="exportIds"
          @detail="goDetail"
          @evaluate="handleEvaluate"
          @compare-change="handleCompareChange"
          @export-change="handleExportChange"
        />
      </template>
    </Grid>

    <CompareDialog v-model:visible="compareVisible" :model-ids="compareIds" />

    <EvaluateDialog
      v-model:visible="evaluateVisible"
      :model-id="evaluateTarget?.modelId"
      :model-name="evaluateTarget?.modelName"
    />
  </PageListShell>
</template>

<style lang="scss" scoped>
.model-list-cards {
  width: 100%;
  text-align: left;
}
</style>
