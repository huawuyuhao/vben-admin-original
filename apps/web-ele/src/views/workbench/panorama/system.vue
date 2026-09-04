<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { hours, systemMetrics } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaSystem' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const summary = [
  { label: '整体可用率', value: '99.92%' },
  { label: '在线服务', value: '46' },
  { label: '今日发布', value: '3' },
  { label: '活跃连接', value: '12.4k' },
];

onMounted(() => {
  renderEcharts({
    backgroundColor: 'transparent',
    color: ['#69f0ae', '#00d8ff'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 28 },
    legend: {
      data: ['CPU', '内存'],
      textStyle: { color: '#9ec9e8' },
    },
    series: [
      {
        data: hours.map((_, i) => 40 + Math.round(18 * Math.sin(i / 3))),
        name: 'CPU',
        smooth: true,
        type: 'line',
        showSymbol: false,
      },
      {
        data: hours.map((_, i) => 55 + Math.round(12 * Math.cos(i / 4))),
        name: '内存',
        smooth: true,
        type: 'line',
        showSymbol: false,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#7eb6d9' },
      data: hours,
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#7eb6d9' },
      max: 100,
      splitLine: { lineStyle: { color: 'rgb(0 120 180 / 20%)' } },
      type: 'value',
    },
  });
});
</script>

<template>
  <div class="board">
    <header>
      <h2>系统运行看板</h2>
      <p>监控调度引擎、网关与支撑服务的健康度与资源走势。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in summary" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <div class="grid">
      <section class="panel">
        <h3>平台资源走势</h3>
        <EchartsUI ref="chartRef" height="280px" />
      </section>
      <section class="panel">
        <h3>核心服务健康</h3>
        <table class="table">
          <thead>
            <tr>
              <th>服务</th>
              <th>时延</th>
              <th>QPS</th>
              <th>健康度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in systemMetrics" :key="m.name">
              <td>{{ m.name }}</td>
              <td>{{ m.latency }}</td>
              <td>{{ m.qps }}</td>
              <td>
                <span class="badge" :class="m.health >= 99.5 ? 'ok' : 'warn'">
                  {{ m.health }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<style src="./board-shared.css"></style>
