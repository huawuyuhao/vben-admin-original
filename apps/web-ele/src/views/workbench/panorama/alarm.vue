<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { alarms } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaAlarm' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const summary = computed(() => [
  { label: '未确认', value: String(alarms.filter((a) => a.status === '未确认').length) },
  { label: '处理中', value: String(alarms.filter((a) => a.status === '处理中').length) },
  { label: '紧急', value: String(alarms.filter((a) => a.level === '紧急').length) },
  { label: '今日告警', value: String(alarms.length) },
]);

function levelClass(level: string) {
  if (level === '紧急') return 'danger';
  if (level === '重要') return 'warn';
  if (level === '一般') return 'mute';
  return 'mute';
}

onMounted(() => {
  renderEcharts({
    backgroundColor: 'transparent',
    grid: { bottom: 28, containLabel: true, left: 36, right: 12, top: 20 },
    series: [
      {
        data: [2, 5, 8, 4, 6, 3, 7],
        itemStyle: {
          color: {
            colorStops: [
              { color: '#ff5252', offset: 0 },
              { color: '#ffb74d', offset: 1 },
            ],
            type: 'linear',
            x: 0,
            x2: 0,
            y: 0,
            y2: 1,
          },
        },
        type: 'bar',
        barWidth: 22,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#7eb6d9' },
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      type: 'category',
    },
    yAxis: {
      axisLabel: { color: '#7eb6d9' },
      splitLine: { lineStyle: { color: 'rgba(0,120,180,0.2)' } },
      type: 'value',
    },
  });
});
</script>

<template>
  <div class="board">
    <header>
      <h2>告警看板</h2>
      <p>汇聚节点、调度与平台告警，支持按级别与处理状态快速排查。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in summary" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <div class="grid">
      <section class="panel">
        <h3>近 7 日告警量</h3>
        <EchartsUI ref="chartRef" height="260px" />
      </section>
      <section class="panel">
        <h3>实时告警列表</h3>
        <table class="table">
          <thead>
            <tr>
              <th>级别</th>
              <th>标题</th>
              <th>节点</th>
              <th>时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in alarms" :key="i">
              <td>
                <span class="badge" :class="levelClass(a.level)">{{ a.level }}</span>
              </td>
              <td>{{ a.title }}</td>
              <td>{{ a.node }}</td>
              <td>{{ a.time }}</td>
              <td>{{ a.status }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<style src="./board-shared.css"></style>
