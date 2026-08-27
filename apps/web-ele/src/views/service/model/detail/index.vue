<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { getModelDetailApi } from '#/api/service/model';

import { exportModelInfoTemplate, parseModelRouteId } from '../data';
import EvaluateDialog from '../modules/evaluate-dialog.vue';
import EvaluationList from './modules/evaluation-list.vue';
import InfoCard from './modules/info-card.vue';
import OverviewCard from './modules/overview-card.vue';
import ParamsCard from './modules/params-card.vue';

/**
 * 门户服务 · 模型详情（对接 GET /model/{id}）
 */
defineOptions({ name: 'ServiceModelDetail' });

const route = useRoute();
const router = useRouter();

/** 详情加载中 */
const loading = ref(false);
/** 加载失败 / 无数据 */
const loadError = ref(false);
/** 模型详情 */
const model = ref<null | ModelInfo>(null);
/** 评价弹窗 */
const evaluateVisible = ref(false);
/** 评价列表刷新令牌 */
const evalRefreshToken = ref(0);
/** 导出中 */
const exporting = ref(false);

/** 路由中的模型 ID */
const modelId = computed(() => parseModelRouteId(route.params.id));

/**
 * 返回模型列表
 */
function goBack() {
  router.push('/service/model');
}

/**
 * 拉取模型详情
 */
async function fetchDetail() {
  if (Number.isNaN(modelId.value)) {
    model.value = null;
    loadError.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = false;
  try {
    const data = await getModelDetailApi(modelId.value);
    model.value = data ?? null;
    if (!data?.modelId) {
      loadError.value = true;
    }
  } catch {
    model.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

/**
 * 打开评价弹窗
 */
function openEvaluate() {
  evaluateVisible.value = true;
}

/**
 * 导出当前模型信息
 */
function handleExport() {
  if (!model.value?.modelId) {
    ElMessage.warning($t('page.service.model.export.noData'));
    return;
  }
  exporting.value = true;
  try {
    exportModelInfoTemplate([model.value]);
    ElMessage.success($t('page.service.model.export.success'));
  } catch {
    ElMessage.error($t('page.service.model.export.failed'));
  } finally {
    exporting.value = false;
  }
}

/**
 * 评价提交成功后刷新列表
 */
function onEvaluateSuccess() {
  evalRefreshToken.value += 1;
}

onMounted(() => {
  void fetchDetail();
});

watch(modelId, () => {
  void fetchDetail();
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
              {{ $t('page.service.model.detail.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.model.detail.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.model.detail.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button class="mine-shell__action-btn" @click="goBack">
              {{ $t('page.service.model.detail.back') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              :loading="exporting"
              :disabled="!model"
              @click="handleExport"
            >
              {{ $t('page.service.model.export.action') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :loading="loading"
              @click="fetchDetail"
            >
              {{ $t('page.service.model.refresh') }}
            </el-button>
          </div>
        </header>

        <div v-loading="loading">
          <el-card
            v-if="loading && !model"
            shadow="never"
            class="model-detail__state"
          >
            <el-skeleton animated :rows="6" />
          </el-card>

          <el-card
            v-else-if="loadError || !model"
            shadow="never"
            class="model-detail__state"
          >
            <el-empty :description="$t('page.service.model.detail.empty')">
              <el-button type="primary" @click="goBack">
                {{ $t('page.service.model.detail.back') }}
              </el-button>
            </el-empty>
          </el-card>

          <template v-else>
            <OverviewCard
              :model="model"
              :exporting="exporting"
              @evaluate="openEvaluate"
              @export="handleExport"
            />
            <InfoCard :model="model" />
            <ParamsCard :model="model" />
            <EvaluationList
              :model-id="model.modelId"
              :refresh-token="evalRefreshToken"
            />
          </template>
        </div>
      </div>
    </div>

    <EvaluateDialog
      v-model:visible="evaluateVisible"
      :model-id="model?.modelId"
      :model-name="model?.modelName"
      @success="onEvaluateSuccess"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.model-detail {
  &__state {
    min-height: 240px;

    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }
}
</style>
