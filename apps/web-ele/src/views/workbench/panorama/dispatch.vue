<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { dispatchTimeline, hours, taskLoadSeries } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaDispatch' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const summary = [
  { label: '今日已执行调度', value: '326' },
  { label: '执行成功率', value: '97.8%' },
  { label: '跨区借用次数', value: '18' },
  { label: '平均响应时延', value: '1.2s' },
];

onMounted(() => {
  renderEcharts({
    backgroundColor: 'transparent',
    color: ['#00d8ff'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 28 },
    series: [
      {
        areaStyle: { color: 'rgb(0 216 255 / 18%)' },
        data: taskLoadSeries,
        name: '调度负荷',
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
      splitLine: { lineStyle: { color: 'rgb(0 120 180 / 20%)' } },
      type: 'value',
    },
  });
});
</script>

<template>
  <div class="board">
    <header>
      <h2>调度执行看板</h2>
      <p>跟踪日前/日内调度计划执行进度、跨区借用与实时负荷。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in summary" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <div class="grid">
      <section class="panel">
        <h3>今日调度负荷曲线</h3>
        <EchartsUI ref="chartRef" height="280px" />
      </section>
      <section class="panel">
        <h3>执行时间线</h3>
        <ol class="timeline">
          <li v-for="item in dispatchTimeline" :key="item.time">
            <time>{{ item.time }}</time>
            <div>
              <strong>{{ item.title }}</strong>
              <em :data-s="item.status">{{ item.status }}</em>
              <p>{{ item.detail }}</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style src="./board-shared.css"></style>
