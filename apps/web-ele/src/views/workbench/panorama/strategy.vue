<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { strategyStates } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaStrategy' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const summary = [
  { label: '生效策略', value: '4' },
  { label: '告警策略', value: '1' },
  { label: '待启用', value: '1' },
  { label: '平均通过率', value: '95.1%' },
];

function statusClass(s: string) {
  if (s === '生效') return 'ok';
  if (s === '告警') return 'warn';
  return 'mute';
}

onMounted(() => {
  const active = strategyStates.filter((s) => s.passRate > 0);
  renderEcharts({
    backgroundColor: 'transparent',
    grid: { bottom: 28, containLabel: true, left: 8, right: 28, top: 12 },
    series: [
      {
        data: active.map((s) => s.passRate),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: '#00d8ff',
        },
        type: 'bar',
        barWidth: 14,
      },
    ],
    tooltip: { trigger: 'axis', valueFormatter: (v) => `${v}%` },
    xAxis: {
      axisLabel: { color: '#7eb6d9' },
      max: 100,
      type: 'value',
    },
    yAxis: {
      axisLabel: { color: '#a8d4f0', fontSize: 11 },
      data: active.map((s) => s.name),
      type: 'category',
    },
  });
});
</script>

<template>
  <div class="board">
    <header>
      <h2>校核策略状态视图</h2>
      <p>展示各区域调度策略生效状态、最近校核时间与通过率。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in summary" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <div class="grid">
      <section class="panel">
        <h3>策略通过率</h3>
        <EchartsUI ref="chartRef" height="280px" />
      </section>
      <section class="panel">
        <h3>策略状态明细</h3>
        <table class="table">
          <thead>
            <tr>
              <th>策略</th>
              <th>区域</th>
              <th>状态</th>
              <th>通过率</th>
              <th>最近校核</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in strategyStates" :key="s.name">
              <td>{{ s.name }}</td>
              <td>{{ s.region }}</td>
              <td>
                <span class="badge" :class="statusClass(s.status)">{{ s.status }}</span>
              </td>
              <td>{{ s.passRate ? `${s.passRate}%` : '-' }}</td>
              <td>{{ s.lastCheck }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<style src="./board-shared.css"></style>
