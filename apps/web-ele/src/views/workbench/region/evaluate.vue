<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  type SchemeEvaluate,
  schemeEvaluates as seed,
} from '#/views/_shared/data/workbench-region';

defineOptions({ name: 'WorkbenchRegionEvaluate' });

const rows = ref<SchemeEvaluate[]>(
  [...seed].sort((a, b) => a.rank - b.rank).map((i) => ({ ...i })),
);
const selectedId = ref(rows.value.find((i) => i.score > 0)?.id || rows.value[0]?.id);
const radarRef = ref<EchartsUIType>();
const barRef = ref<EchartsUIType>();
const { renderEcharts: renderRadar } = useEcharts(radarRef);
const { renderEcharts: renderBar } = useEcharts(barRef);

const current = computed(
  () => rows.value.find((i) => i.id === selectedId.value) || rows.value[0],
);

const ranked = computed(() => rows.value.filter((i) => i.score > 0));

function scoreClass(s: number) {
  if (s >= 90) return 'ok';
  if (s >= 80) return 'info';
  if (s >= 70) return 'warn';
  if (s > 0) return 'danger';
  return 'mute';
}

function renderCharts() {
  const cur = current.value;
  if (!cur) return;

  renderRadar({
    backgroundColor: 'transparent',
    legend: { show: false },
    radar: {
      indicator: [
        { max: 100, name: '利用率' },
        { max: 100, name: '绿电' },
        { max: 100, name: '成本' },
        { max: 100, name: '时延' },
      ],
      radius: '62%',
    },
    series: [
      {
        areaStyle: { color: 'rgb(64 158 255 / 20%)' },
        data: [
          {
            name: cur.schemeName,
            value: [
              cur.utilScore,
              cur.greenScore,
              cur.costScore,
              cur.latencyScore,
            ],
          },
        ],
        itemStyle: { color: '#409eff' },
        type: 'radar',
      },
    ],
    tooltip: {},
  });

  renderBar({
    backgroundColor: 'transparent',
    grid: { bottom: 28, containLabel: true, left: 40, right: 12, top: 24 },
    series: [
      {
        barWidth: 22,
        data: ranked.value.map((i) => i.score),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#409eff',
        },
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#909399', fontSize: 11, rotate: 20 },
      data: ranked.value.map((i) => i.schemeName.replace('方案', '')),
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#909399' },
      max: 100,
      splitLine: { lineStyle: { type: 'dashed' } },
      type: 'value',
    },
  });
}

watch(selectedId, () => renderCharts());
onMounted(() => renderCharts());
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>调度方案评价</h2>
        <p>
          对调度方案实施效果进行评价分析：关键指标计算、方案对比与效果展示，为优化提供数据支撑。
        </p>
      </div>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('已导出评价报告（示例）')"
      >
        导出报告
      </button>
    </header>

    <div class="layout">
      <section class="panel list-panel">
        <h3>方案评分榜</h3>
        <article
          v-for="row in rows"
          :key="row.id"
          class=" rank-card"
          :class="{ active: selectedId === row.id }"
          @click="selectedId = row.id"
        >
          <div class="rank">#{{ row.rank }}</div>
          <div class="body">
            <h4>{{ row.schemeName }}</h4>
            <p>{{ row.region }} · {{ row.period }}</p>
          </div>
          <div class="score" :class="scoreClass(row.score)">
            {{ row.score || '—' }}
          </div>
        </article>
      </section>

      <section class="panel detail-panel" v-if="current">
        <div class="detail-head">
          <div>
            <h3>{{ current.schemeName }}</h3>
            <p>{{ current.summary }}</p>
          </div>
          <div class="big-score" :class="scoreClass(current.score)">
            {{ current.score || '—' }}
            <span>综合分</span>
          </div>
        </div>

        <div class="metric-row">
          <div class="metric">
            <strong>{{ current.utilScore || '—' }}</strong>
            <span>利用率得分</span>
          </div>
          <div class="metric">
            <strong>{{ current.greenScore || '—' }}</strong>
            <span>绿电得分</span>
          </div>
          <div class="metric">
            <strong>{{ current.costScore || '—' }}</strong>
            <span>成本得分</span>
          </div>
          <div class="metric">
            <strong>{{ current.latencyScore || '—' }}</strong>
            <span>时延得分</span>
          </div>
        </div>

        <div class="charts">
          <div class="chart-box">
            <h4>指标雷达</h4>
            <EchartsUI ref="radarRef" height="260px" />
          </div>
          <div class="chart-box">
            <h4>方案综合分对比</h4>
            <EchartsUI ref="barRef" height="260px" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  --primary: #409eff;

  padding-bottom: 24px;
}

.head {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.head h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.head p {
  max-width: 720px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #909399;
}

.btn {
  height: 32px;
  padding: 0 14px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn.primary {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
}

.panel {
  padding: 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.rank-card {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.rank-card.active,
.rank-card:hover {
  background: #f5f9ff;
  border-color: #b3d8ff;
}

.rank {
  font-weight: 700;
  color: #909399;
}

.body h4 {
  margin: 0 0 4px;
  font-size: 13px;
}

.body p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.score {
  min-width: 36px;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  text-align: right;
}

.score.ok {
  color: #67c23a;
}

.score.info {
  color: #409eff;
}

.score.warn {
  color: #e6a23c;
}

.score.danger {
  color: #f56c6c;
}

.score.mute {
  color: #c0c4cc;
}

.detail-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.detail-head h3 {
  margin: 0 0 6px;
}

.detail-head p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.big-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 8px;
  font-size: 28px;
  font-weight: 700;
  background: #f5f7fa;
  border-radius: 8px;
}

.big-score span {
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.metric {
  padding: 12px;
  text-align: center;
  background: #f8fafc;
  border-radius: 6px;
}

.metric strong {
  display: block;
  margin-bottom: 4px;
  font-size: 20px;
  color: var(--primary);
}

.metric span {
  font-size: 12px;
  color: #909399;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chart-box {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.chart-box h4 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

@media (max-width: 1100px) {
  .layout,
  .charts,
  .metric-row {
    grid-template-columns: 1fr;
  }
}
</style>
