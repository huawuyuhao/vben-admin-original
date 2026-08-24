<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  deviceCountMonths,
  deviceOnlineCurrent,
  deviceOnlineLast,
  deviceOnlineRegions,
  deviceOwn,
  deviceStatsKpis,
  deviceStatusPie,
  deviceSupply,
  deviceTypePie,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsDevice' });

const dim = ref<'day' | 'month'>('day');
const dc = ref('全部');
const countRef = ref<EchartsUIType>();
const onlineRef = ref<EchartsUIType>();
const typeRef = ref<EchartsUIType>();
const statusRef = ref<EchartsUIType>();
const { renderEcharts: renderCount } = useEcharts(countRef);
const { renderEcharts: renderOnline } = useEcharts(onlineRef);
const { renderEcharts: renderType } = useEcharts(typeRef);
const { renderEcharts: renderStatus } = useEcharts(statusRef);

function donutOption(data: typeof deviceTypePie, center: string) {
  return {
    color: ['#409eff', '#67c23a', '#6b4cff', '#e6a23c', '#f56c6c'],
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        data: data.map((d) => ({
          name: `${d.name} ${d.pct}`,
          value: d.value,
        })),
        label: { formatter: '{b}' },
        radius: ['48%', '68%'],
        type: 'pie',
      },
    ],
    title: {
      left: 'center',
      text: center,
      top: '42%',
      textStyle: { fontSize: 13, fontWeight: 600 },
    },
    tooltip: { trigger: 'item' },
  };
}

onMounted(() => {
  renderType(donutOption(deviceTypePie, '12,458\n总设备数'));
  renderStatus(donutOption(deviceStatusPie, '94.2%\n设备健康度'));

  renderCount({
    color: ['#36cfc9', '#1890ff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 36 },
    legend: { data: ['供给用户设备', '自有设备'] },
    series: [
      { data: deviceSupply, name: '供给用户设备', stack: 'total', type: 'bar' },
      { data: deviceOwn, name: '自有设备', stack: 'total', type: 'bar' },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: deviceCountMonths, type: 'category' },
    yAxis: { type: 'value' },
  });

  renderOnline({
    color: ['#1d39c4', '#36cfc9'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 36 },
    legend: { data: ['上月', '本月'] },
    series: [
      { barMaxWidth: 24, data: deviceOnlineLast, name: '上月', type: 'bar' },
      { barMaxWidth: 24, data: deviceOnlineCurrent, name: '本月', type: 'bar' },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: deviceOnlineRegions, type: 'category' },
    yAxis: { max: 100, type: 'value' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>设备数据统计</h2>
        <p>多维度统计分析设备资产与运行状态数据，为运营决策提供数据支撑。</p>
      </div>
      <div class="head-actions">
        <select v-model="dc">
          <option>全部</option>
          <option>贵阳核心</option>
          <option>遵义节点</option>
        </select>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">↻</button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已导出报表（示例）')"
        >
          导出报表
        </button>
      </div>
    </header>

    <div class="filter card">
      <span>统计维度</span>
      <label><input v-model="dim" type="radio" value="day" /> 按日</label>
      <label><input v-model="dim" type="radio" value="month" /> 按月</label>
      <input type="date" value="2026-06-14" />
      <span>—</span>
      <input type="date" value="2026-06-14" />
      <span>数据中心</span>
      <select v-model="dc"><option>全部</option></select>
    </div>

    <div class="stat-grid">
      <article
        v-for="k in deviceStatsKpis"
        :key="k.label"
        class="stat-card"
        :class="k.tone"
      >
        <div>
          <div class="stat-label">{{ k.label }}</div>
          <div class="stat-value">
            {{ k.value }}
            <small v-if="k.unit">{{ k.unit }}</small>
          </div>
          <div v-if="k.trend" class="stat-trend" :class="k.up ? 'up' : 'down'">
            {{ k.trend }}
          </div>
        </div>
      </article>
    </div>

    <section class="card">
      <div class="card-title">设备数量统计</div>
      <div class="donut-grid">
        <EchartsUI ref="typeRef" height="280px" />
        <EchartsUI ref="statusRef" height="280px" />
      </div>
    </section>

    <div class="chart-grid dark">
      <section class="card dark-panel">
        <div class="card-title light">设备数量统计（按月）</div>
        <EchartsUI ref="countRef" height="260px" />
      </section>
      <section class="card dark-panel">
        <div class="card-title light">设备在线时间统计</div>
        <EchartsUI ref="onlineRef" height="260px" />
      </section>
    </div>

    <div class="mini-kpis">
      <div class="mini"><strong>123</strong><span>总设备数</span></div>
      <div class="mini"><strong>82.54%</strong><span>供给用户设备占比</span></div>
      <div class="mini"><strong>268</strong><span>总用电量</span></div>
      <div class="mini"><strong>128</strong><span>自有设备</span></div>
      <div class="mini"><strong>98.7%</strong><span>平均在线率</span></div>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  font-size: 13px;
  color: #606266;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  border-left-width: 4px;
}

.stat-card.blue {
  border-left-color: #409eff;
}

.stat-card.green {
  border-left-color: #67c23a;
}

.stat-card.purple {
  border-left-color: #6b4cff;
}

.stat-card.orange {
  border-left-color: #e6a23c;
}

.stat-label {
  color: #909399;
  font-size: 13px;
}

.stat-value {
  margin: 6px 0;
  font-size: 24px;
  font-weight: 700;
}

.stat-value small {
  font-size: 12px;
  font-weight: 400;
}

.stat-trend.up {
  color: #67c23a;
  font-size: 12px;
}

.stat-trend.down {
  color: #f56c6c;
  font-size: 12px;
}

.donut-grid,
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dark-panel {
  background: #1a2332;
  border-color: #2a3548;
}

.card-title.light {
  color: #e5eaf3;
}

.mini-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.mini {
  padding: 12px;
  text-align: center;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.mini strong {
  display: block;
  font-size: 20px;
}

.mini span {
  color: #909399;
  font-size: 12px;
}

@media (max-width: 1000px) {
  .stat-grid,
  .donut-grid,
  .chart-grid,
  .mini-kpis {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
