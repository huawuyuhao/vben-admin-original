<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  monitorAlarmGeneral,
  monitorAlarmLevelDays,
  monitorAlarmSerious,
  monitorAlarmTypes,
  monitorAlarmUrgent,
  monitorResourceTotal,
  monitorResourceTrendHours,
  monitorResourceTypes,
  monitorResourceUsage,
  monitorResourceUsed,
  monitorStatsKpis,
  monitorStrategyEvents,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsMonitor' });

const dim = ref('day');
const dc = ref('全部');
const alarmTypeRef = ref<EchartsUIType>();
const resourceRef = ref<EchartsUIType>();
const levelRef = ref<EchartsUIType>();
const typeBarRef = ref<EchartsUIType>();
const { renderEcharts: r1 } = useEcharts(alarmTypeRef);
const { renderEcharts: r2 } = useEcharts(resourceRef);
const { renderEcharts: r3 } = useEcharts(levelRef);
const { renderEcharts: r4 } = useEcharts(typeBarRef);

onMounted(() => {
  r1({
    color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
    legend: { bottom: 0 },
    series: [
      {
        data: monitorAlarmTypes.map((d) => ({ name: d.name, value: d.value })),
        radius: ['40%', '62%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });

  r2({
    color: ['#36cfc9'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 28 },
    series: [
      {
        areaStyle: { opacity: 0.2 },
        data: monitorResourceUsage,
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: monitorResourceTrendHours, type: 'category' },
    yAxis: { max: 100, type: 'value' },
  });

  r3({
    color: ['#67c23a', '#e6a23c', '#f56c6c'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 36 },
    legend: { data: ['一般', '严重', '紧急'] },
    series: [
      { data: monitorAlarmGeneral, name: '一般', stack: 'a', type: 'bar' },
      { data: monitorAlarmSerious, name: '严重', stack: 'a', type: 'bar' },
      { data: monitorAlarmUrgent, name: '紧急', stack: 'a', type: 'bar' },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: monitorAlarmLevelDays, type: 'category' },
    yAxis: { type: 'value' },
  });

  r4({
    color: ['#1d39c4', '#36cfc9'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 36 },
    legend: { data: ['总量', '已用'] },
    series: [
      { barMaxWidth: 28, data: monitorResourceTotal, name: '总量', type: 'bar' },
      { barMaxWidth: 28, data: monitorResourceUsed, name: '已用', type: 'bar' },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: monitorResourceTypes, type: 'category' },
    yAxis: { type: 'value' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>监测数据统计</h2>
        <p>告警、资源使用率与策略校核事件的多维统计分析。</p>
      </div>
      <button class="btn primary" type="button" @click="ElMessage.success('已刷新')">
        刷新
      </button>
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
      <span>资源类型</span>
      <select><option>全部</option></select>
      <span>告警类型</span>
      <select><option>全部</option></select>
    </div>

    <div class="kpi-row">
      <div v-for="k in monitorStatsKpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
      </div>
    </div>

    <div class="panel-grid">
      <section class="card dark">
        <div class="card-title">告警类型维度统计</div>
        <EchartsUI ref="alarmTypeRef" height="220px" />
      </section>
      <section class="card dark">
        <div class="card-title">资源使用趋势统计</div>
        <EchartsUI ref="resourceRef" height="220px" />
        <div class="bars">
          <span>CPU平均 58.2%</span>
          <span>GPU平均 71.5%</span>
        </div>
      </section>
      <section class="card dark">
        <div class="card-title">告警等级时间分布</div>
        <EchartsUI ref="levelRef" height="220px" />
      </section>
      <section class="card dark">
        <div class="card-title">资源类型维度统计</div>
        <EchartsUI ref="typeBarRef" height="220px" />
      </section>
    </div>

    <section class="card dark wide">
      <div class="card-title">策略校核事件统计</div>
      <div class="summary">
        <span><strong>1285</strong> 校核总数</span>
        <span><strong>96.2%</strong> 成功率</span>
        <span><strong>3</strong> 高危预警</span>
        <span><strong>12</strong> 待优化</span>
      </div>
      <table class="dark-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>事件类型</th>
            <th>策略名称</th>
            <th>结果</th>
            <th>告警等级</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in monitorStrategyEvents" :key="e.time + e.name">
            <td>{{ e.time }}</td>
            <td>{{ e.type }}</td>
            <td>{{ e.name }}</td>
            <td>{{ e.result }}</td>
            <td>{{ e.level }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.card.dark,
.card.dark.wide {
  background: #1a2332;
  border-color: #2a3548;
}

.card.dark .card-title,
.card.dark.wide .card-title {
  color: #e5eaf3;
}

.bars {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #9aa4b2;
  font-size: 12px;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
  color: #9aa4b2;
  font-size: 13px;
}

.summary strong {
  margin-right: 4px;
  color: #36cfc9;
  font-size: 18px;
}

.dark-table {
  width: 100%;
  color: #c0c4cc;
  font-size: 13px;
}

.dark-table th,
.dark-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #2a3548;
}

.dark-table th {
  color: #9aa4b2;
}

@media (max-width: 900px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
