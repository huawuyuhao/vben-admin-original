<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { getModelListApi } from '#/api/service/model';

import {
  canEvaluateModel,
  exportModelInfoTemplate,
  MODEL_COMPARE_MAX,
  MODEL_PAGE_SIZE,
  normalizeModelPage,
} from './data';
import CompareDialog from './modules/compare-dialog.vue';
import EvaluateDialog from './modules/evaluate-dialog.vue';
import FilterBar from './modules/filter-bar.vue';
import ModelGrid from './modules/model-grid.vue';
import ModelPager from './modules/model-pager.vue';

/**
 * 门户服务 · 模型服务列表（对接 GET /model/list 扁平分页返参）
 */
defineOptions({ name: 'ServiceModel' });

const router = useRouter();

/** 搜索关键词 */
const keyword = ref('');
/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(MODEL_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页模型 */
const models = ref<ModelInfo[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 已选对比模型 ID */
const compareIds = ref<number[]>([]);
/** 对比弹窗 */
const compareVisible = ref(false);
/** 评价弹窗 */
const evaluateVisible = ref(false);
/** 当前评价目标 */
const evaluateTarget = ref<ModelInfo | null>(null);
/** 是否处于导出勾选模式 */
const exportSelecting = ref(false);
/** 已选导出模型 ID（仅当前页） */
const exportIds = ref<number[]>([]);
/** 导出中 */
const exporting = ref(false);

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
 * 拉取当前页模型列表
 */
async function fetchModels() {
  loading.value = true;
  try {
    const data = await getModelListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
    });
    const page = normalizeModelPage(data);
    models.value = page.records;
    total.value = page.total;
    // 翻页后仅保留仍在当前页的导出勾选
    if (exportSelecting.value) {
      const pageIdSet = new Set(page.records.map((item) => item.modelId));
      exportIds.value = exportIds.value.filter((id) => pageIdSet.has(id));
    }

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    models.value = [];
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
  void fetchModels();
}

/**
 * 提交搜索
 */
function handleSearch() {
  if (exportSelecting.value) {
    return;
  }
  queryFromFirstPage();
}

/**
 * 刷新当前条件
 */
function handleRefresh() {
  if (exportSelecting.value) {
    return;
  }
  void fetchModels();
}

/**
 * 进入模型详情
 * @param item 模型
 */
function goDetail(item: ModelInfo) {
  if (!item.modelId || exportSelecting.value) {
    return;
  }
  router.push(`/service/model/${item.modelId}`);
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
 * 打开评价弹窗（仅 canEvaluate 为 true 时）
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

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchModels();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchModels();
});

onMounted(() => {
  void fetchModels();
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
              {{ $t('page.service.model.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.model.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.model.desc') }}
            </p>
          </div>
        </header>

        <FilterBar
          v-model:keyword="keyword"
          :refreshing="loading"
          :exporting="exporting"
          :export-selecting="exportSelecting"
          :export-count="exportIds.length"
          :compare-count="compareIds.length"
          :compare-disabled="compareIds.length < 2"
          @refresh="handleRefresh"
          @search="handleSearch"
          @compare="handleCompare"
          @export="handleExport"
          @export-cancel="handleExportCancel"
          @export-select-all="handleExportSelectAll"
        />

        <ModelGrid
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

        <ModelPager
          v-if="models.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <CompareDialog v-model:visible="compareVisible" :model-ids="compareIds" />

    <EvaluateDialog
      v-model:visible="evaluateVisible"
      :model-id="evaluateTarget?.modelId"
      :model-name="evaluateTarget?.modelName"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../scss/page-shell.scss';
</style>
