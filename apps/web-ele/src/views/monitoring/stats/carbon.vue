<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  carbonGreen,
  carbonStatsKpis,
  carbonStrategyBars,
  carbonTaskTypePie,
  carbonTotal,
  carbonTrendWeeks,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsCarbon' });

const trendRef = ref<EchartsUIType>();
const strategyRef = ref<EchartsUIType>();
const typeRef = ref<EchartsUIType>();
const radarRef = ref<EchartsUIType>();
const { renderEcharts: r1 } = useEcharts(trendRef);
const { renderEcharts: r2 } = useEcharts(strategyRef);
const { renderEcharts: r3 } = useEcharts(typeRef);
const { renderEcharts: r4 } = useEcharts(radarRef);

onMounted(() => {
  r1({
    color: ['#409eff', '#67c23a'],
    grid: { bottom: 28, containLabel: true, left: 48, right: 16, top: 36 },
    legend: { data: ['总碳排放(kg)', '绿电碳排放(kg)'] },
    series: [
      {
        areaStyle: { opacity: 0.1 },
        data: carbonTotal,
        name: '总碳排放(kg)',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: { opacity: 0.1 },
        data: carbonGreen,
        name: '绿电碳排放(kg)',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: carbonTrendWeeks, type: 'category' },
    yAxis: { max: 1400, type: 'value' },
  });

  r2({
    color: ['#409eff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 28 },
    series: [
      {
        barMaxWidth: 36,
        data: carbonStrategyBars.map((d) => d.value),
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      data: carbonStrategyBars.map((d) => d.name),
      type: 'category',
    },
    yAxis: { max: 100, type: 'value' },
  });

  r3({
    color: ['#409eff', '#67c23a', '#e6a23c', '#909399'],
    legend: { bottom: 0 },
    series: [
      {
        data: carbonTaskTypePie.map((d) => ({ name: d.name, value: d.value })),
        label: { formatter: '{b}\n{d}%' },
        radius: ['42%', '68%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });

  r4({
    color: ['#f56c6c', '#e6a23c', '#67c23a'],
    legend: { bottom: 0, data: ['时间优先', '低价优先', '绿电优先'] },
    radar: {
      indicator: [
        { max: 100, name: '碳排' },
        { max: 100, name: '成本' },
        { max: 100, name: '时延' },
        { max: 100, name: '利用率' },
        { max: 100, name: '绿电比' },
      ],
    },
    series: [
      {
        data: [
          { name: '时间优先', value: [72, 65, 92, 78, 48] },
          { name: '低价优先', value: [68, 88, 70, 82, 52] },
          { name: '绿电优先', value: [55, 72, 75, 80, 92] },
        ],
        type: 'radar',
      },
    ],
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>碳排放统计</h2>
        <p>统计智算任务碳排放、绿电使用比例与调度策略碳排对比。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('已导出数据（示例）')"
        >
          导出数据
        </button>
        <button class="btn primary" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <section class="filter card">
      <label>时间范围<input type="date" /><span>—</span><input type="date" /></label>
      <label>调度策略类型<select><option>全部</option></select></label>
      <label>算力任务类型<select><option>全部</option></select></label>
      <div class="filter-actions">
        <button class="btn" type="button">重置</button>
        <button class="btn primary" type="button">查询</button>
      </div>
    </section>

    <div class="kpi-row">
      <div
        v-for="k in carbonStatsKpis"
        :key="k.label"
        class="kpi carbon"
      >
        <span class="lbl">{{ k.label }}</span>
        <strong>{{ k.value }}</strong>
        <em :class="k.warn ? 'warn' : k.up ? 'up' : 'down'">{{ k.yoy }}</em>
      </div>
    </div>

    <div class="chart-grid">
      <section class="card span2">
        <div class="card-title">
          碳排放量趋势图
          <span class="right tabs">
            <button type="button">日</button>
            <button type="button" class="active">周</button>
            <button type="button">月</button>
            <button type="button">季</button>
            <button type="button">年</button>
          </span>
        </div>
        <EchartsUI ref="trendRef" height="280px" />
      </section>
      <section class="card">
        <div class="card-title">调度策略碳排放对比</div>
        <EchartsUI ref="strategyRef" height="240px" />
      </section>
      <section class="card">
        <div class="card-title">算力类型碳排放占比</div>
        <EchartsUI ref="typeRef" height="240px" />
      </section>
      <section class="card span2">
        <div class="card-title">调度策略多维度指标对比</div>
        <EchartsUI ref="radarRef" height="260px" />
      </section>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.filter {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
  padding: 14px;
}

.filter label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.kpi.carbon {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi .lbl {
  color: #909399;
  font-size: 12px;
}

.kpi em {
  font-size: 12px;
  font-style: normal;
}

.kpi em.up {
  color: #67c23a;
}

.kpi em.warn {
  color: #f56c6c;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.span2 {
  grid-column: span 2;
}

.tabs button {
  height: 26px;
  padding: 0 10px;
  margin-left: 4px;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.tabs button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

@media (max-width: 900px) {
  .filter,
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .span2 {
    grid-column: span 1;
  }
}
</style>
