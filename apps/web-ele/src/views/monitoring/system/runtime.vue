<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  healthChecks,
  runtimeCpu,
  runtimeHours,
  runtimeMem,
  runtimeMetrics,
} from '#/views/_shared/data/monitoring-system';

defineOptions({ name: 'SysRuntime' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    color: ['#409eff', '#6b4cff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 36 },
    legend: { data: ['CPU', 'MEMORY'] },
    series: [
      {
        areaStyle: { opacity: 0.12 },
        data: runtimeCpu,
        name: 'CPU',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: { opacity: 0.12 },
        data: runtimeMem,
        name: 'MEMORY',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: runtimeHours, type: 'category' },
    yAxis: { max: 100, name: '%', type: 'value' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>系统运行状态监控</h2>
        <p>实时感知主机资源与核心服务健康状态。</p>
      </div>
      <div class="head-actions">
        <span class="run-pill">● 系统运行中</span>
        <span class="uptime">运行时长：128天 14小时 22分</span>
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('已刷新')"
        >
          ↻
        </button>
      </div>
    </header>

    <div class="metric-grid">
      <article
        v-for="m in runtimeMetrics"
        :key="m.label"
        class="metric-card card"
      >
        <div class="metric-label">{{ m.label }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="bar">
          <i
            :class="m.tone"
            :style="{ width: `${m.pct}%` }"
          />
        </div>
        <div class="metric-status">负载状态 <em>正常</em></div>
      </article>
    </div>

    <div class="main-grid">
      <section class="card">
        <div class="card-title">服务器性能趋势（近 24 小时）</div>
        <EchartsUI ref="chartRef" height="300px" />
      </section>

      <aside class="card health">
        <div class="card-title">系统健康度检测</div>
        <div class="health-score">
          <span class="shield">🛡</span>
          <strong>100% 可用</strong>
        </div>
        <ul>
          <li v-for="h in healthChecks" :key="h.name">
            <div class="health-top">
              <strong>{{ h.name }}</strong>
              <span :class="h.ok ? 'ok' : 'warn'">{{ h.status }}</span>
            </div>
            <div class="health-detail">{{ h.detail }}</div>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.run-pill {
  padding: 4px 10px;
  color: #67c23a;
  font-size: 13px;
  background: #f0f9eb;
  border-radius: 12px;
}

.uptime {
  color: #909399;
  font-size: 13px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.metric-card {
  padding: 14px;
}

.metric-label {
  color: #909399;
  font-size: 13px;
}

.metric-value {
  margin: 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.bar {
  height: 8px;
  margin-bottom: 8px;
  background: #ebeef5;
  border-radius: 4px;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
}

.bar i.blue {
  background: #409eff;
}

.bar i.orange {
  background: #e6a23c;
}

.bar i.green {
  background: #67c23a;
}

.metric-status {
  color: #909399;
  font-size: 12px;
}

.metric-status em {
  color: #67c23a;
  font-style: normal;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
}

.health-score {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 12px;
  color: #67c23a;
  background: #f0f9eb;
  border-radius: 8px;
}

.health ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.health li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.health li:last-child {
  border-bottom: none;
}

.health-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.health-top strong {
  font-size: 13px;
}

.health-top .ok {
  color: #67c23a;
  font-size: 12px;
}

.health-top .warn {
  padding: 2px 8px;
  color: #e6a23c;
  font-size: 12px;
  background: #fdf6ec;
  border-radius: 10px;
}

.health-detail {
  color: #909399;
  font-size: 12px;
}

@media (max-width: 1000px) {
  .metric-grid,
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .metric-grid,
  .main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
