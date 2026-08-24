<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  taskDurationBuckets,
  taskDurationCounts,
  taskGrowth,
  taskQueueBuckets,
  taskQueueCounts,
  taskStatsKpis,
  taskTrendCurrent,
  taskTrendDays,
  taskTrendPrev,
} from '#/views/_shared/data/monitoring-stats';

defineOptions({ name: 'StatsTask' });

const compareMode = ref(true);
const granularity = ref('日');
const trendRef = ref<EchartsUIType>();
const durationRef = ref<EchartsUIType>();
const queueRef = ref<EchartsUIType>();
const { renderEcharts: renderTrend } = useEcharts(trendRef);
const { renderEcharts: renderDuration } = useEcharts(durationRef);
const { renderEcharts: renderQueue } = useEcharts(queueRef);

onMounted(() => {
  renderTrend({
    color: ['#409eff', '#909399', '#67c23a'],
    grid: { bottom: 28, containLabel: true, left: 48, right: 48, top: 40 },
    legend: { data: ['2026年3月', '2026年2月', '增长率'] },
    series: [
      {
        data: taskTrendCurrent,
        name: '2026年3月',
        smooth: true,
        type: 'line',
      },
      {
        data: taskTrendPrev,
        lineStyle: { type: 'dashed' },
        name: '2026年2月',
        smooth: true,
        type: 'line',
      },
      {
        barMaxWidth: 16,
        data: taskGrowth,
        name: '增长率',
        type: 'bar',
        yAxisIndex: 1,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: taskTrendDays, type: 'category' },
    yAxis: [
      { name: '任务量', type: 'value' },
      { name: '%', splitLine: { show: false }, type: 'value' },
    ],
  });

  const bar = (data: number[], color: string) => ({
    color: [color],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 28 },
    series: [
      {
        barMaxWidth: 28,
        data,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { axisLabel: { rotate: 30 }, type: 'category', data: [] },
    yAxis: { type: 'value' },
  });

  renderDuration({
    ...bar(taskDurationCounts, '#6b4cff'),
    xAxis: { axisLabel: { rotate: 30 }, data: taskDurationBuckets, type: 'category' },
  });
  renderQueue({
    ...bar(taskQueueCounts, '#e6a23c'),
    xAxis: { axisLabel: { rotate: 30 }, data: taskQueueBuckets, type: 'category' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>时间维度任务分析</h2>
        <p>任务数据统计 — 多周期对比分析任务量、完成率与处理/排队时长分布。</p>
      </div>
      <div class="head-actions">
        <button
          type="button"
          class="mode-btn"
          :class="{ active: !compareMode }"
          @click="compareMode = false"
        >
          单周期
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ active: compareMode }"
          @click="compareMode = true"
        >
          对比模式
        </button>
        <span v-if="compareMode" class="range-text">
          2026-03-01 至 2026-03-31 vs 2026-02-01 至 2026-02-28
        </span>
        <div class="granularity">
          <button
            v-for="g in ['小时', '日', '周', '月']"
            :key="g"
            type="button"
            :class="{ active: granularity === g }"
            @click="granularity = g"
          >
            {{ g }}
          </button>
        </div>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="k in taskStatsKpis" :key="k.label" class="kpi compare">
        <span class="kpi-label">{{ k.label }}</span>
        <strong>{{ k.current }}</strong>
        <em>{{ k.compare }}（{{ k.period }}）</em>
        <span class="chg" :class="k.up ? 'up' : 'down'">{{ k.change }}</span>
      </div>
    </div>

    <section class="card">
      <div class="card-title">
        日度任务量趋势对比
        <small>2026年3月 vs 2026年2月 · 峰值 9,300</small>
      </div>
      <EchartsUI ref="trendRef" height="300px" />
      <div class="tip">ℹ 3 月下旬任务量持续走高，月末峰值较 2 月同期提升约 10.7%。</div>
    </section>

    <div class="chart-grid">
      <section class="card">
        <div class="card-title">任务处理时长分布</div>
        <EchartsUI ref="durationRef" height="240px" />
        <div class="tip purple">💡 92% 的任务在 30 分钟内完成处理。</div>
      </section>
      <section class="card">
        <div class="card-title">任务排队等待时长分布</div>
        <EchartsUI ref="queueRef" height="240px" />
        <div class="tip orange">💡 91.2% 的任务排队等待少于 10 分钟。</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.mode-btn,
.granularity button {
  height: 30px;
  padding: 0 12px;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.mode-btn.active,
.granularity button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.range-text {
  color: #909399;
  font-size: 12px;
}

.kpi.compare {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  color: #909399;
  font-size: 12px;
}

.kpi em {
  color: #909399;
  font-size: 11px;
  font-style: normal;
}

.chg {
  font-size: 12px;
  font-weight: 600;
}

.chg.up {
  color: #67c23a;
}

.chg.down {
  color: #f56c6c;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.tip {
  margin-top: 8px;
  padding: 8px 10px;
  color: #606266;
  font-size: 12px;
  background: #ecf5ff;
  border-radius: 4px;
}

.tip.purple {
  background: #f3f0ff;
}

.tip.orange {
  background: #fdf6ec;
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
