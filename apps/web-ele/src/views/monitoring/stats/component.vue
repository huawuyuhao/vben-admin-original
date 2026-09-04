<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  componentFeatures,
  componentHealthPie,
  componentKpis,
  componentNodes,
  componentTrendCpu,
  componentTrendGpu,
  componentTrendHours,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsComponent' });

const trendRef = ref<EchartsUIType>();
const healthRef = ref<EchartsUIType>();
const { renderEcharts: renderTrend } = useEcharts(trendRef);
const { renderEcharts: renderHealth } = useEcharts(healthRef);

onMounted(() => {
  renderTrend({
    color: ['#409eff', '#67c23a', '#e6a23c', '#909399', '#6b4cff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 36 },
    legend: { data: ['CPU', 'GPU'] },
    series: [
      {
        areaStyle: { opacity: 0.12 },
        data: componentTrendCpu,
        name: 'CPU',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: { opacity: 0.12 },
        data: componentTrendGpu,
        name: 'GPU',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: componentTrendHours, type: 'category' },
    yAxis: { max: 100, name: '%', type: 'value' },
  });

  renderHealth({
    color: ['#67c23a', '#e6a23c', '#fa8c16', '#f56c6c', '#909399'],
    legend: { bottom: 0 },
    series: [
      {
        data: componentHealthPie.map((d) => ({ name: d.name, value: d.value })),
        label: { formatter: '{b}\n{d}%' },
        radius: ['45%', '68%'],
        type: 'pie',
      },
    ],
    title: {
      left: 'center',
      text: '节点总数\n246',
      top: '40%',
      textStyle: { fontSize: 13, lineHeight: 20 },
    },
    tooltip: { trigger: 'item' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>数据监控分析管理组件</h2>
        <p>全网算力资源运行态势感知、健康评估与节点监控清单。</p>
      </div>
      <button class="btn primary" type="button" @click="ElMessage.success('已刷新')">
        刷新
      </button>
    </header>

    <div class="stat-grid">
      <article
        v-for="k in componentKpis"
        :key="k.label"
        class="stat-card"
        :class="k.tone"
      >
        <div class="stat-label">{{ k.label }}</div>
        <div class="stat-value">
          {{ k.value }}
          <small>{{ k.unit }}</small>
        </div>
        <div class="stat-tip">{{ k.tip }}</div>
      </article>
    </div>

    <div class="chart-grid">
      <section class="card">
        <div class="card-title">全网算力资源运行趋势（近 24 小时）</div>
        <EchartsUI ref="trendRef" height="280px" />
      </section>
      <section class="card">
        <div class="card-title">资源健康状态分布</div>
        <EchartsUI ref="healthRef" height="280px" />
      </section>
    </div>

    <div class="feature-grid">
      <article v-for="f in componentFeatures" :key="f.title" class="feature card">
        <h4>{{ f.title }}</h4>
        <p>{{ f.desc }}</p>
      </article>
    </div>

    <section class="card">
      <div class="card-title">算力节点监控清单</div>
      <table>
        <thead>
          <tr>
            <th>节点名称</th>
            <th>资源类型</th>
            <th>所属区域</th>
            <th>利用率</th>
            <th>健康评分</th>
            <th>告警数</th>
            <th>采集状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in componentNodes" :key="n.name">
            <td>{{ n.name }}</td>
            <td>{{ n.type }}</td>
            <td>{{ n.region }}</td>
            <td>{{ n.util }}</td>
            <td>{{ n.health }}</td>
            <td>{{ n.alarms }}</td>
            <td>
              <span
                class="badge"
                :class="n.status === '正常采集' ? 'ok' : 'warn'"
              >
                {{ n.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

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
  border-top: 3px solid #409eff;
  border-radius: 8px;
}

.stat-card.purple {
  border-top-color: #6b4cff;
}

.stat-card.green {
  border-top-color: #67c23a;
}

.stat-card.orange {
  border-top-color: #e6a23c;
}

.stat-label {
  font-size: 13px;
  color: #909399;
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

.stat-tip {
  font-size: 12px;
  color: #909399;
}

.chart-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.feature {
  padding: 14px;
  border-left: 3px solid #409eff;
}

.feature h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.feature p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
}

.badge.warn {
  color: #e6a23c;
  background: #fdf6ec;
}

@media (max-width: 1000px) {
  .stat-grid,
  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
