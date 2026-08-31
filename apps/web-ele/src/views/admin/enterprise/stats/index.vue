<script lang="ts" setup>
import type {
  EnterpriseAlertStatItem,
  EnterpriseDeviceCountStatItem,
  EnterpriseOnlineTimeStatItem,
  EnterprisePowerUsageStatItem,
  EnterpriseStatOverview,
  EnterpriseStatType,
} from '#/types/admin/enterprise/stats';

import { computed, onMounted, ref } from 'vue';

import { Download, Refresh } from '@element-plus/icons-vue';
import { $t, useI18n } from '@vben/locales';
import { downloadFileFromUrl } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  exportEnterpriseStatApi,
  getEnterpriseAlertStatApi,
  getEnterpriseDeviceCountStatApi,
  getEnterpriseOnlineTimeStatApi,
  getEnterprisePowerUsageStatApi,
  getEnterpriseStatOverviewApi,
} from '#/api/admin/enterprise/stats';

import {
  getCurrentStatYear,
  getStatExportTypeOptions,
  resolveStatExportDownloadUrl,
} from './data';
import AlertChart from './modules/alert-chart.vue';
import DeviceCountChart from './modules/device-count-chart.vue';
import FilterBar from './modules/filter-bar.vue';
import OnlineTimeChart from './modules/online-time-chart.vue';
import OverviewCards from './modules/overview-cards.vue';
import PowerUsageChart from './modules/power-usage-chart.vue';

/**
 * 管理 · 服务数据统计
 * 对接 overview / device-count / online-time / power-usage / alert / export
 * 图表使用 VisActor VChart
 */
defineOptions({ name: 'AdminEnterpriseStats' });

const { locale } = useI18n();

/** 筛选草稿 */
const filterYear = ref<null | number>(getCurrentStatYear());
const filterMonth = ref<null | number>(null);
const filterDay = ref<null | number>(null);

/** 已生效筛选 */
const appliedYear = ref<null | number>(getCurrentStatYear());
const appliedMonth = ref<null | number>(null);
const appliedDay = ref<null | number>(null);

/** 加载态 */
const overviewLoading = ref(false);
const chartsLoading = ref(false);
const exporting = ref(false);

/** 数据 */
const overview = ref<null | EnterpriseStatOverview>(null);
const deviceCountData = ref<EnterpriseDeviceCountStatItem[]>([]);
const onlineTimeData = ref<EnterpriseOnlineTimeStatItem[]>([]);
const powerUsageData = ref<EnterprisePowerUsageStatItem[]>([]);
const alertData = ref<EnterpriseAlertStatItem[]>([]);

/** 顶部导出类型 */
const exportType = ref<EnterpriseStatType>('overview');
/** 导出类型选项（随语言切换） */
const exportTypeOptions = computed(() => {
  void locale.value;
  return getStatExportTypeOptions();
});

/**
 * 构建年/月公共查询参数
 */
function buildPeriodParams() {
  return {
    year: appliedYear.value ?? undefined,
    month: appliedMonth.value ?? undefined,
  };
}

/**
 * 拉取概览
 */
async function fetchOverview() {
  overviewLoading.value = true;
  try {
    overview.value =
      (await getEnterpriseStatOverviewApi(buildPeriodParams())) ?? null;
  } catch {
    overview.value = null;
  } finally {
    overviewLoading.value = false;
  }
}

/**
 * 拉取四类趋势/告警数据
 */
async function fetchCharts() {
  chartsLoading.value = true;
  const period = buildPeriodParams();
  try {
    const [deviceCount, onlineTime, powerUsage, alert] = await Promise.all([
      getEnterpriseDeviceCountStatApi(period),
      getEnterpriseOnlineTimeStatApi(period),
      getEnterprisePowerUsageStatApi(period),
      getEnterpriseAlertStatApi({
        ...period,
        day: appliedDay.value ?? undefined,
      }),
    ]);
    deviceCountData.value = Array.isArray(deviceCount) ? deviceCount : [];
    onlineTimeData.value = Array.isArray(onlineTime) ? onlineTime : [];
    powerUsageData.value = Array.isArray(powerUsage) ? powerUsage : [];
    alertData.value = Array.isArray(alert) ? alert : [];
  } catch {
    deviceCountData.value = [];
    onlineTimeData.value = [];
    powerUsageData.value = [];
    alertData.value = [];
  } finally {
    chartsLoading.value = false;
  }
}

/**
 * 刷新全部数据
 */
async function fetchAll() {
  await Promise.all([fetchOverview(), fetchCharts()]);
}

/**
 * 查询
 */
function handleSearch() {
  appliedYear.value = filterYear.value;
  appliedMonth.value = filterMonth.value;
  appliedDay.value = filterDay.value;
  void fetchAll();
}

/**
 * 重置为当年
 */
function handleReset() {
  filterYear.value = getCurrentStatYear();
  filterMonth.value = null;
  filterDay.value = null;
  appliedYear.value = getCurrentStatYear();
  appliedMonth.value = null;
  appliedDay.value = null;
  void fetchAll();
}

/**
 * 刷新
 */
function handleRefresh() {
  void fetchAll();
}

/**
 * 导出指定类型统计
 * @param statType 统计类型
 */
async function handleExport(statType: EnterpriseStatType) {
  exporting.value = true;
  try {
    const result = await exportEnterpriseStatApi({
      ...buildPeriodParams(),
      statType,
    });
    const downloadUrl = resolveStatExportDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.warning($t('page.admin.enterprise.stats.export.invalidUrl'));
      return;
    }
    await downloadFileFromUrl({
      source: downloadUrl,
      fileName: result?.fileName || `enterprise-stat-${statType}.xlsx`,
    });
    ElMessage.success($t('page.admin.enterprise.stats.export.success'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    exporting.value = false;
  }
}

/**
 * 顶部导出
 */
function handleHeaderExport() {
  void handleExport(exportType.value);
}

onMounted(() => {
  void fetchAll();
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
              {{ $t('page.admin.enterprise.stats.eyebrow') }}
            </p>
            <h2>{{ $t('page.admin.enterprise.stats.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.admin.enterprise.stats.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions stats-head-actions">
            <el-select
              v-model="exportType"
              class="stats-head-actions__select"
              :disabled="exporting"
            >
              <el-option
                v-for="opt in exportTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-button
              class="mine-shell__action-btn"
              :icon="Download"
              :loading="exporting"
              @click="handleHeaderExport"
            >
              {{ $t('page.admin.enterprise.stats.export.btn') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="overviewLoading || chartsLoading"
              @click="handleRefresh"
            >
              {{ $t('page.admin.enterprise.stats.refresh') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:year="filterYear"
          v-model:month="filterMonth"
          v-model:day="filterDay"
          @search="handleSearch"
          @reset="handleReset"
        />

        <div class="stats-grid">
          <OverviewCards
            :loading="overviewLoading"
            :overview="overview"
            @export="handleExport('overview')"
          />
          <DeviceCountChart
            :data="deviceCountData"
            :loading="chartsLoading"
            @export="handleExport('device-count')"
          />
          <OnlineTimeChart
            :data="onlineTimeData"
            :loading="chartsLoading"
            @export="handleExport('online-time')"
          />
          <PowerUsageChart
            :data="powerUsageData"
            :loading="chartsLoading"
            @export="handleExport('power-usage')"
          />
        </div>

        <AlertChart
          class="stats-alert"
          :data="alertData"
          :loading="chartsLoading"
          @export="handleExport('alert')"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.stats-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;

  &__select {
    width: 160px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stats-alert {
  margin-bottom: 8px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
