<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import { dcForecastRows } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccDcForecast' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
const horizon = ref('次日');

onMounted(() => {
  renderEcharts({
    color: ['#409eff', '#67c23a', '#e6a23c'],
    grid: { bottom: 28, containLabel: true, left: 40, right: 16, top: 36 },
    legend: { data: ['算力指数', '电力指数', '碳排指数'] },
    series: [
      {
        data: [68, 72, 70, 76, 80, 78, 74],
        name: '算力指数',
        smooth: true,
        type: 'line',
      },
      {
        data: [55, 58, 60, 62, 66, 64, 61],
        name: '电力指数',
        smooth: true,
        type: 'line',
      },
      {
        data: [48, 46, 50, 44, 42, 45, 43],
        name: '碳排指数',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      data: ['00', '04', '08', '12', '16', '20', '24'],
      type: 'category',
    },
    yAxis: { type: 'value' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>数据中心电碳算综合预测</h2>
        <p>对数据中心算力、电力、碳排进行联合预测，支撑区域调度与容量规划。</p>
      </div>
      <div class="head-actions">
        <select v-model="horizon">
          <option>次日</option>
          <option>未来 7 日</option>
          <option>未来 30 日</option>
        </select>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success(`已按「${horizon}」重算`)"
        >
          重新预测
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>484</strong><span>预测总算力 PFLOPS</span></div>
      <div class="kpi"><strong>28.7</strong><span>预测总电量 MWh</span></div>
      <div class="kpi"><strong>11.2</strong><span>预测总碳排 tCO₂</span></div>
      <div class="kpi"><strong>¥154k</strong><span>预测综合成本</span></div>
    </div>

    <section class="card">
      <div class="card-title">综合指数曲线（归一化）</div>
      <EchartsUI ref="chartRef" height="280px" />
    </section>

    <section class="card">
      <div class="card-title">分中心预测结果</div>
      <table>
        <thead>
          <tr>
            <th>数据中心</th>
            <th>算力</th>
            <th>电力</th>
            <th>碳排</th>
            <th>成本</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in dcForecastRows" :key="r.dc">
            <td>{{ r.dc }}</td>
            <td>{{ r.compute }}</td>
            <td>{{ r.power }}</td>
            <td>{{ r.carbon }}</td>
            <td>{{ r.cost }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.head-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.head-actions select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
