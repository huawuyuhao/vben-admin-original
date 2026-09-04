<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  userActive,
  userGrowthMonths,
  userNew,
  userRegionRows,
  userStatsKpis,
  userTypePie,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsUser' });

const period = ref('month');
const trendRef = ref<EchartsUIType>();
const typeRef = ref<EchartsUIType>();
const { renderEcharts: renderTrend } = useEcharts(trendRef);
const { renderEcharts: renderType } = useEcharts(typeRef);

onMounted(() => {
  renderTrend({
    color: ['#409eff', '#67c23a'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 36 },
    legend: { data: ['新增用户', '月活跃用户'] },
    series: [
      { barMaxWidth: 24, data: userNew, name: '新增用户', type: 'bar' },
      {
        data: userActive,
        name: '月活跃用户',
        smooth: true,
        type: 'line',
        yAxisIndex: 1,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: userGrowthMonths, type: 'category' },
    yAxis: [
      { name: '新增', type: 'value' },
      { name: '活跃', splitLine: { show: false }, type: 'value' },
    ],
  });

  renderType({
    color: ['#409eff', '#67c23a', '#6b4cff', '#e6a23c'],
    legend: { bottom: 0 },
    series: [
      {
        data: userTypePie.map((d) => ({ name: d.name, value: d.value })),
        radius: ['42%', '68%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>用户数据统计</h2>
        <p>统计平台注册用户、活跃度、企业客户分布与区域增长趋势。</p>
      </div>
      <div class="head-actions">
        <select v-model="period">
          <option value="month">近 6 月</option>
          <option value="year">近 1 年</option>
        </select>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已导出用户报表（示例）')"
        >
          导出报表
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="k in userStatsKpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
        <em :class="k.up ? 'up' : 'down'">{{ k.trend }}</em>
      </div>
    </div>

    <div class="chart-grid">
      <section class="card">
        <div class="card-title">用户增长与活跃趋势</div>
        <EchartsUI ref="trendRef" height="280px" />
      </section>
      <section class="card">
        <div class="card-title">用户类型分布</div>
        <EchartsUI ref="typeRef" height="280px" />
      </section>
    </div>

    <section class="card">
      <div class="card-title">分区域用户统计</div>
      <table>
        <thead>
          <tr>
            <th>区域</th>
            <th>注册用户</th>
            <th>企业客户</th>
            <th>月活跃用户</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in userRegionRows" :key="r.region">
            <td>{{ r.region }}</td>
            <td>{{ r.users.toLocaleString() }}</td>
            <td>{{ r.enterprise }}</td>
            <td>{{ r.active.toLocaleString() }}</td>
            <td>
              <button
                type="button"
                class="link"
                @click="ElMessage.info(`查看 ${r.region} 详情`)"
              >
                详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.kpi em {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  font-style: normal;
}

.kpi em.up {
  color: #67c23a;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
  margin-bottom: 12px;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
