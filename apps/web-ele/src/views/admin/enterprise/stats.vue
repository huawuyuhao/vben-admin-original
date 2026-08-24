<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  type DeviceRunStatus,
  alarmBarData,
  deviceCountTrend,
  deviceStatRows,
  months,
  onlineHoursTrend,
  powerPieData,
  statsKpis,
} from '#/views/_shared/data/enterprise-center';

const timeDim = ref<'year' | 'month' | 'day'>('year');
const year = ref('2023');
const deviceType = ref('all');
const currentPage = ref(1);
const pageSize = 5;
const toast = ref('');

const deviceTrendRef = ref<EchartsUIType>();
const onlineTrendRef = ref<EchartsUIType>();
const powerPieRef = ref<EchartsUIType>();
const alarmBarRef = ref<EchartsUIType>();

const { renderEcharts: renderDeviceTrend } = useEcharts(deviceTrendRef);
const { renderEcharts: renderOnlineTrend } = useEcharts(onlineTrendRef);
const { renderEcharts: renderPowerPie } = useEcharts(powerPieRef);
const { renderEcharts: renderAlarmBar } = useEcharts(alarmBarRef);

const filteredDevices = computed(() => {
  if (deviceType.value === 'all') return [...deviceStatRows];
  return deviceStatRows.filter((r) => r.type === deviceType.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredDevices.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredDevices.value.slice(start, start + pageSize);
});

watch(deviceType, () => {
  currentPage.value = 1;
});

function statusClass(s: DeviceRunStatus) {
  if (s === '运行中') return 'portal-badge-success';
  if (s === '待修') return 'portal-badge-warning';
  return 'portal-badge-gray';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function renderCharts() {
  renderDeviceTrend({
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 24 },
    series: [
      {
        areaStyle: { color: 'rgba(64, 158, 255, 0.12)' },
        data: deviceCountTrend,
        itemStyle: { color: '#409eff' },
        name: '设备数量',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#909399' },
      boundaryGap: false,
      data: months,
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed' } },
      type: 'value',
    },
  });

  renderOnlineTrend({
    grid: { bottom: 28, containLabel: true, left: 48, right: 16, top: 24 },
    series: [
      {
        barMaxWidth: 28,
        data: onlineHoursTrend,
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#67c23a' },
        name: '在线小时',
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#909399' },
      data: months,
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed' } },
      type: 'value',
    },
  });

  renderPowerPie({
    color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b6a2de'],
    legend: {
      bottom: 0,
      itemWidth: 10,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        center: ['50%', '42%'],
        data: powerPieData,
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
        name: '用电量',
        radius: ['35%', '58%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });

  renderAlarmBar({
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 24 },
    series: [
      {
        barMaxWidth: 36,
        data: alarmBarData.map((d) => d.value),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#e6a23c' },
        name: '告警数',
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#909399' },
      data: alarmBarData.map((d) => d.name),
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed' } },
      type: 'value',
    },
  });
}

function refresh() {
  renderCharts();
  showToast('数据已刷新（示例）');
}

onMounted(() => {
  renderCharts();
});
</script>

<template>
  <div class="portal-inner-page enterprise-stats-page">
    <div class="portal-page-title">
      <h2>服务数据统计</h2>
      <p>汇总供给设备、在线时长、用电量与告警等运营指标，支持按时间维度查看。</p>
    </div>

    <div class="portal-filter-bar stats-filter">
      <span class="filter-label">时间维度</span>
      <div class="dim-group">
        <button
          type="button"
          class="dim-btn"
          :class="{ active: timeDim === 'year' }"
          @click="timeDim = 'year'"
        >
          年
        </button>
        <button
          type="button"
          class="dim-btn"
          :class="{ active: timeDim === 'month' }"
          @click="timeDim = 'month'"
        >
          月
        </button>
        <button
          type="button"
          class="dim-btn"
          :class="{ active: timeDim === 'day' }"
          @click="timeDim = 'day'"
        >
          日
        </button>
      </div>
      <select v-model="year">
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
      <select v-model="deviceType">
        <option value="all">全部设备</option>
        <option value="GPU服务器">GPU服务器</option>
        <option value="CPU服务器">CPU服务器</option>
        <option value="存储设备">存储设备</option>
        <option value="网络设备">网络设备</option>
        <option value="空调系统">空调系统</option>
      </select>
      <div class="filter-spacer" />
      <button
        class="portal-btn portal-btn-outline portal-btn-sm"
        type="button"
        title="刷新"
        @click="refresh"
      >
        ↻ 刷新
      </button>
    </div>

    <div class="kpi-grid">
      <div v-for="kpi in statsKpis" :key="kpi.key" class="kpi-card">
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-value">
          {{ kpi.value }}
          <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
        </div>
        <div class="kpi-change" :class="kpi.up ? 'up' : 'down'">
          {{ kpi.up ? '↑' : '↓' }} {{ kpi.change }}% 较去年同期
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="portal-card chart-card">
        <h4>供给设备数量趋势</h4>
        <EchartsUI ref="deviceTrendRef" height="260px" />
      </div>
      <div class="portal-card chart-card">
        <h4>设备在线时间趋势</h4>
        <EchartsUI ref="onlineTrendRef" height="260px" />
      </div>
      <div class="portal-card chart-card">
        <h4>设备用电量统计</h4>
        <EchartsUI ref="powerPieRef" height="260px" />
      </div>
      <div class="portal-card chart-card">
        <h4>设备告警统计</h4>
        <EchartsUI ref="alarmBarRef" height="260px" />
      </div>
    </div>

    <div class="portal-card table-section">
      <h4 class="table-title">设备详细数据</h4>
      <div class="table-wrap">
        <table class="portal-data-table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>设备类型</th>
              <th>累计在线时间(小时)</th>
              <th>累计用电量(kWh)</th>
              <th>告警数量</th>
              <th>运行状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paged" :key="row.id">
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.onlineHours.toLocaleString() }}</td>
              <td>{{ row.powerKwh.toLocaleString() }}</td>
              <td>{{ row.alarms }}</td>
              <td>
                <span class="portal-badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td>
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast(`查看详情：${row.name}`)"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="portal-pagination">
        <span class="portal-page-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到
          {{ Math.min(currentPage * pageSize, filteredDevices.length) }} 条，共
          {{ filteredDevices.length }} 条记录
        </span>
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          :class="{ active: p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.stats-filter {
  align-items: center;
}

.filter-label {
  margin-right: 6px;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
  white-space: nowrap;
}

.dim-group {
  display: flex;
  gap: 0;
  align-items: center;
}

.dim-btn {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--portal-gray-300, #e0e0e0);
}

.dim-btn:first-of-type {
  border-radius: 8px 0 0 8px;
}

.dim-btn:last-of-type {
  border-radius: 0 8px 8px 0;
}

.dim-btn + .dim-btn {
  margin-left: -1px;
}

.dim-btn.active {
  z-index: 1;
  color: #fff;
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}

.filter-spacer {
  flex: 1;
  min-width: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.kpi-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
}

.kpi-value {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--portal-gray-900, #212121);
}

.kpi-unit {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--portal-gray-500, #9e9e9e);
}

.kpi-change {
  font-size: 12px;
}

.kpi-change.up,
.kpi-change.down {
  color: #67c23a;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

@media (max-width: 960px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  padding: 14px 16px 8px;
}

.chart-card h4,
.table-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--portal-gray-900, #212121);
}

.table-section {
  padding: 16px;
}

.table-wrap {
  overflow: hidden;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 8px;
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
