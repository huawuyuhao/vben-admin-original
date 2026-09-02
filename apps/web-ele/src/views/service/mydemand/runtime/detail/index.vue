<script lang="ts" setup>
import type {
  RunningTaskDetail,
  RunningTaskHistoryDimension,
} from '#/types/service/mydemand/runtime';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  closeRunningTaskApi,
  getRunningTaskCarbonDataApi,
  getRunningTaskDetailApi,
  getRunningTaskHistoryTrendApi,
  getRunningTaskPowerDataApi,
  getRunningTaskResourceDataApi,
} from '#/api/service/mydemand/runtime';

import {
  buildCarbonChartSeries,
  buildHistoryChartSeries,
  buildPowerChartSeries,
  buildResourceChartSeries,
  buildRuntimeRangeByKey,
  canCloseRunningTask,
  displayRuntimeStatusName,
  formatRuntimeDateTime,
  formatRuntimeDuration,
  formatRuntimeMetric,
  formatRuntimePercent,
  getRuntimeStepsActive,
  parseRunningTaskIdParam,
  RUNTIME_HISTORY_DIMENSIONS,
  RUNTIME_RANGE_1H,
  RUNTIME_RANGE_24H,
  RUNTIME_RANGE_6H,
  RUNTIME_STEP_KEYS,
  type RuntimeChartPoint,
  type RuntimeRangeKey,
  type RuntimeTimeRange,
} from '../data';
import LineChart from '../modules/line-chart.vue';

/**
 * 门户服务 · 应用运行详情
 * 串联详情、电力、碳排、资源监控、历史趋势与关闭任务接口
 */
defineOptions({ name: 'ServiceMyDemandRuntimeDetail' });

const route = useRoute();
const router = useRouter();

/** 当前任务 ID */
const taskId = computed(() => parseRunningTaskIdParam(route.query.id));

/** 详情加载中 */
const loading = ref(false);
/** 图表加载中 */
const chartLoading = ref(false);
/** 关闭中 */
const closing = ref(false);
/** 详情 */
const detail = ref<RunningTaskDetail | null>(null);
/** 当前 Tab */
const activeTab = ref('power');
/** 快捷时间范围 */
const rangeKey = ref<RuntimeRangeKey>(RUNTIME_RANGE_1H);
/** 自定义时间范围 */
const customRange = ref<RuntimeTimeRange>(null);
/** 历史趋势维度 */
const historyDimension = ref<RunningTaskHistoryDimension>('power');

/** 电力图表数据 */
const powerSeries = ref<RuntimeChartPoint[]>([]);
/** 碳排图表数据 */
const carbonSeries = ref<RuntimeChartPoint[]>([]);
/** 资源图表数据 */
const resourceSeries = ref<RuntimeChartPoint[]>([]);
/** 历史趋势图表数据 */
const historySeries = ref<RuntimeChartPoint[]>([]);

/** 当前生效查询时间范围 */
const queryRange = computed(() => {
  if (customRange.value?.[0] && customRange.value?.[1]) {
    return {
      startTime: customRange.value[0],
      endTime: customRange.value[1],
    };
  }
  const [startTime, endTime] = buildRuntimeRangeByKey(rangeKey.value);
  return { startTime, endTime };
});

/** 是否可关闭 */
const closable = computed(() => canCloseRunningTask(detail.value?.runStatus));

/** 步骤条当前激活下标 */
const stepsActive = computed(() =>
  getRuntimeStepsActive(detail.value?.runStatus),
);

/**
 * 展示空值占位
 * @param value 原始值
 * @returns 展示文案
 */
function displayValue(value?: null | number | string): string {
  if (value == null) {
    return $t('page.service.mydemand.runtime.valueEmpty');
  }
  const text = String(value).trim();
  return text || $t('page.service.mydemand.runtime.valueEmpty');
}

/**
 * 拉取任务详情
 */
async function fetchDetail() {
  if (taskId.value == null) {
    return;
  }
  loading.value = true;
  try {
    const data = await getRunningTaskDetailApi(taskId.value);
    detail.value = data ?? null;
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

/**
 * 并行拉取电力 / 碳排 / 资源 / 历史趋势全部序列
 */
async function fetchAllCharts() {
  if (taskId.value == null) {
    return;
  }
  chartLoading.value = true;

  const id = taskId.value;
  const range = queryRange.value;
  const dimension = historyDimension.value;

  try {
    const [powerList, carbonList, resourceList, historyList] =
      await Promise.all([
        getRunningTaskPowerDataApi(id, range).catch(() => []),
        getRunningTaskCarbonDataApi(id, range).catch(() => []),
        getRunningTaskResourceDataApi(id, range).catch(() => []),
        getRunningTaskHistoryTrendApi(id, {
          ...range,
          dimension,
        }).catch(() => []),
      ]);

    powerSeries.value = buildPowerChartSeries(
      powerList,
      $t('page.service.mydemand.runtime.chart.series.powerConsumption'),
      $t('page.service.mydemand.runtime.chart.series.powerPrice'),
    );
    carbonSeries.value = buildCarbonChartSeries(
      carbonList,
      $t('page.service.mydemand.runtime.chart.series.carbonEmission'),
    );
    resourceSeries.value = buildResourceChartSeries(resourceList, {
      cpu: $t('page.service.mydemand.runtime.chart.series.cpu'),
      gpu: $t('page.service.mydemand.runtime.chart.series.gpu'),
      memory: $t('page.service.mydemand.runtime.chart.series.memory'),
      disk: $t('page.service.mydemand.runtime.chart.series.disk'),
      network: $t('page.service.mydemand.runtime.chart.series.network'),
    });
    historySeries.value = buildHistoryChartSeries(
      historyList,
      $t(`page.service.mydemand.runtime.history.dimension.${dimension}`),
    );
  } finally {
    chartLoading.value = false;
  }
}

/**
 * 加载详情 + 全部图表
 */
async function loadAll() {
  if (taskId.value == null) {
    detail.value = null;
    powerSeries.value = [];
    carbonSeries.value = [];
    resourceSeries.value = [];
    historySeries.value = [];
    return;
  }
  await Promise.all([fetchDetail(), fetchAllCharts()]);
}

/**
 * 返回列表页
 */
function handleBack() {
  void router.push('/service/mydemand/runtime');
}

/**
 * 手动刷新
 */
function handleRefresh() {
  void loadAll();
}

/**
 * 切换快捷时间范围
 * @param key 快捷键
 */
function handleRangeKeyChange(key: RuntimeRangeKey | string) {
  rangeKey.value = key as RuntimeRangeKey;
  customRange.value = null;
  void fetchAllCharts();
}

/**
 * 自定义时间变更
 * @param value 时间范围
 */
function handleCustomRange(value: RuntimeTimeRange) {
  customRange.value = value;
  if (value?.[0] && value?.[1]) {
    void fetchAllCharts();
  }
}

/**
 * 关闭任务
 */
async function handleCloseTask() {
  if (taskId.value == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }

  closing.value = true;
  try {
    const result = await closeRunningTaskApi(taskId.value);
    const tip = typeof result === 'string' ? result.trim() : '';
    ElMessage.success(
      tip || $t('page.service.mydemand.runtime.close.success'),
    );
    handleBack();
  } catch {
    // 错误提示由接口层处理
  } finally {
    closing.value = false;
  }
}

watch(taskId, (id) => {
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }
  void loadAll();
});

watch(historyDimension, () => {
  void fetchAllCharts();
});

onMounted(() => {
  if (taskId.value == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }
  void loadAll();
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
              {{ $t('page.service.mydemand.runtime.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.mydemand.runtime.detail.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.mydemand.runtime.detail.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="ArrowLeft"
              @click="handleBack"
            >
              {{ $t('page.service.mydemand.runtime.detail.back') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading || chartLoading"
              @click="handleRefresh"
            >
              {{ $t('page.service.mydemand.runtime.refresh') }}
            </el-button>
            <el-popconfirm
              v-if="closable"
              :cancel-button-text="
                $t('page.service.mydemand.runtime.close.cancelBtn')
              "
              :confirm-button-text="
                $t('page.service.mydemand.runtime.close.confirmBtn')
              "
              :title="
                $t('page.service.mydemand.runtime.close.confirm', [
                  detail?.taskName?.trim() ||
                    $t('page.service.mydemand.runtime.valueEmpty'),
                ])
              "
              @confirm="handleCloseTask"
            >
              <template #reference>
                <el-button
                  class="mine-shell__action-btn"
                  :loading="closing"
                  type="danger"
                >
                  {{ $t('page.service.mydemand.runtime.actions.close') }}
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </header>

        <div v-loading="loading" class="runtime-detail">
          <template v-if="detail">
            <el-card class="runtime-detail__summary" shadow="never">
              <div class="runtime-detail__toolbar">
                <div>
                  <h3 class="runtime-detail__name">
                    {{ displayValue(detail.taskName) }}
                  </h3>
                  <p class="runtime-detail__meta">
                    {{ $t('page.service.mydemand.runtime.fields.taskId') }}：
                    {{ displayValue(detail.taskId ?? taskId) }}
                    <span class="runtime-detail__status-name">
                      {{
                        displayRuntimeStatusName(
                          detail,
                          $t('page.service.mydemand.runtime.valueEmpty'),
                        )
                      }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="runtime-detail__steps">
                <p class="runtime-detail__steps-label">
                  {{ $t('page.service.mydemand.runtime.fields.runStatus') }}
                </p>
                <el-steps
                  :active="stepsActive"
                  align-center
                  finish-status="success"
                  process-status="process"
                >
                  <el-step
                    v-for="key in RUNTIME_STEP_KEYS"
                    :key="key"
                    :title="
                      $t(`page.service.mydemand.runtime.steps.${key}`)
                    "
                  />
                </el-steps>
              </div>

              <el-descriptions :column="2" border>
                <el-descriptions-item
                  :label="$t('page.service.mydemand.runtime.fields.runTime')"
                >
                  {{
                    formatRuntimeDuration(detail.runTime) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                </el-descriptions-item>
                <el-descriptions-item
                  :label="
                    $t('page.service.mydemand.runtime.fields.completePercent')
                  "
                >
                  <div class="runtime-detail__progress">
                    <el-progress
                      :percentage="
                        Math.min(
                          100,
                          Math.max(0, Number(detail.completePercent) || 0),
                        )
                      "
                      :stroke-width="12"
                    />
                  </div>
                </el-descriptions-item>
                <el-descriptions-item
                  :label="$t('page.service.mydemand.runtime.fields.collectTime')"
                  :span="2"
                >
                  {{
                    formatRuntimeDateTime(detail.collectTime) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <div class="runtime-detail__kpis">
              <el-card class="runtime-detail__kpi" shadow="hover">
                <p class="runtime-detail__kpi-label">
                  {{ $t('page.service.mydemand.runtime.kpi.power') }}
                </p>
                <p class="runtime-detail__kpi-value">
                  {{
                    formatRuntimeMetric(detail.powerConsumption) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                  <span>{{ $t('page.service.mydemand.runtime.unit.kwh') }}</span>
                </p>
              </el-card>
              <el-card class="runtime-detail__kpi" shadow="hover">
                <p class="runtime-detail__kpi-label">
                  {{ $t('page.service.mydemand.runtime.kpi.carbon') }}
                </p>
                <p class="runtime-detail__kpi-value">
                  {{
                    formatRuntimeMetric(detail.carbonEmission) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                  <span>{{ $t('page.service.mydemand.runtime.unit.kg') }}</span>
                </p>
              </el-card>
              <el-card class="runtime-detail__kpi" shadow="hover">
                <p class="runtime-detail__kpi-label">
                  {{ $t('page.service.mydemand.runtime.kpi.cpu') }}
                </p>
                <p class="runtime-detail__kpi-value">
                  {{
                    formatRuntimePercent(detail.cpuUsage) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                </p>
              </el-card>
              <el-card class="runtime-detail__kpi" shadow="hover">
                <p class="runtime-detail__kpi-label">
                  {{ $t('page.service.mydemand.runtime.kpi.gpu') }}
                </p>
                <p class="runtime-detail__kpi-value">
                  {{
                    formatRuntimePercent(detail.gpuUsage) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                </p>
              </el-card>
              <el-card class="runtime-detail__kpi" shadow="hover">
                <p class="runtime-detail__kpi-label">
                  {{ $t('page.service.mydemand.runtime.kpi.memory') }}
                </p>
                <p class="runtime-detail__kpi-value">
                  {{
                    formatRuntimePercent(detail.memoryUsage) ||
                    $t('page.service.mydemand.runtime.valueEmpty')
                  }}
                </p>
              </el-card>
            </div>

            <el-card class="runtime-detail__charts" shadow="never">
              <div class="runtime-detail__filters">
                <el-radio-group
                  v-model="rangeKey"
                  size="small"
                  @change="handleRangeKeyChange"
                >
                  <el-radio-button :value="RUNTIME_RANGE_1H">
                    {{ $t('page.service.mydemand.runtime.range.h1') }}
                  </el-radio-button>
                  <el-radio-button :value="RUNTIME_RANGE_6H">
                    {{ $t('page.service.mydemand.runtime.range.h6') }}
                  </el-radio-button>
                  <el-radio-button :value="RUNTIME_RANGE_24H">
                    {{ $t('page.service.mydemand.runtime.range.h24') }}
                  </el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-model="customRange"
                  class="runtime-detail__daterange"
                  :end-placeholder="
                    $t('page.service.mydemand.runtime.range.end')
                  "
                  format="YYYY-MM-DD HH:mm:ss"
                  :start-placeholder="
                    $t('page.service.mydemand.runtime.range.start')
                  "
                  type="datetimerange"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  @change="handleCustomRange"
                />
              </div>

              <el-tabs v-model="activeTab">
                <el-tab-pane
                  lazy
                  :label="$t('page.service.mydemand.runtime.tabs.power')"
                  name="power"
                >
                  <LineChart
                    :data="powerSeries"
                    :hint="$t('page.service.mydemand.runtime.chart.powerHint')"
                    :loading="chartLoading"
                    :title="
                      $t('page.service.mydemand.runtime.chart.powerTitle')
                    "
                  />
                </el-tab-pane>
                <el-tab-pane
                  lazy
                  :label="$t('page.service.mydemand.runtime.tabs.carbon')"
                  name="carbon"
                >
                  <LineChart
                    :data="carbonSeries"
                    :hint="$t('page.service.mydemand.runtime.chart.carbonHint')"
                    :loading="chartLoading"
                    :title="
                      $t('page.service.mydemand.runtime.chart.carbonTitle')
                    "
                  />
                </el-tab-pane>
                <el-tab-pane
                  lazy
                  :label="$t('page.service.mydemand.runtime.tabs.resource')"
                  name="resource"
                >
                  <LineChart
                    :data="resourceSeries"
                    :hint="
                      $t('page.service.mydemand.runtime.chart.resourceHint')
                    "
                    :loading="chartLoading"
                    percent-axis
                    :title="
                      $t('page.service.mydemand.runtime.chart.resourceTitle')
                    "
                  />
                </el-tab-pane>
                <el-tab-pane
                  lazy
                  :label="$t('page.service.mydemand.runtime.tabs.history')"
                  name="history"
                >
                  <div class="runtime-detail__history-bar">
                    <span>{{
                      $t('page.service.mydemand.runtime.history.dimensionLabel')
                    }}</span>
                    <el-select
                      v-model="historyDimension"
                      class="runtime-detail__dimension"
                      size="small"
                    >
                      <el-option
                        v-for="item in RUNTIME_HISTORY_DIMENSIONS"
                        :key="item"
                        :label="
                          $t(
                            `page.service.mydemand.runtime.history.dimension.${item}`,
                          )
                        "
                        :value="item"
                      />
                    </el-select>
                  </div>
                  <LineChart
                    :data="historySeries"
                    :hint="
                      $t('page.service.mydemand.runtime.chart.historyHint')
                    "
                    :loading="chartLoading"
                    :title="
                      $t('page.service.mydemand.runtime.chart.historyTitle')
                    "
                  />
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </template>

          <el-empty
            v-else-if="!loading"
            :description="$t('page.service.mydemand.runtime.detail.empty')"
          >
            <el-button type="primary" @click="handleBack">
              {{ $t('page.service.mydemand.runtime.detail.back') }}
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../../scss/page-shell.scss';

.runtime-detail {
  min-height: 240px;

  &__summary {
    margin-bottom: 16px;
    border-radius: 16px;
  }

  &__toolbar {
    margin-bottom: 16px;
  }

  &__name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  &__meta {
    margin: 0;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__status-name {
    margin-left: 12px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__steps {
    margin-bottom: 20px;
    padding: 16px 8px 8px;
    border-radius: 12px;
    background: hsl(var(--muted) / 0.35);
  }

  &__steps-label {
    margin: 0 0 12px 8px;
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__progress {
    max-width: 220px;
  }

  &__kpis {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  &__kpi {
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 14px;
    }
  }

  &__kpi-label {
    margin: 0 0 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__kpi-value {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: hsl(var(--foreground));

    span {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
    }
  }

  &__charts {
    border-radius: 16px;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  &__daterange {
    width: min(100%, 360px);
  }

  &__history-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__dimension {
    width: 160px;
  }
}

@media (max-width: 1100px) {
  .runtime-detail {
    &__kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
