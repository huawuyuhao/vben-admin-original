<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  buildSeries,
  formatElapsed,
  runtimeKpis,
  runtimeMaterials,
  runtimeModels,
  runtimeSteps,
  runtimeTasks,
} from '#/views/_shared/data/runtime';

const router = useRouter();

const taskId = ref(runtimeTasks[0]!.id);
const toast = ref('');
const elapsed = ref(runtimeTasks[0]!.elapsedSec);
const chartRange = ref<'1h' | 'today' | 'custom'>('1h');

let timer: number | undefined;

const task = computed(
  () => runtimeTasks.find((t) => t.id === taskId.value) || runtimeTasks[0]!,
);

const elapsedText = computed(() => formatElapsed(elapsed.value));

const cpuRef = ref<EchartsUIType>();
const gpuRef = ref<EchartsUIType>();
const memRef = ref<EchartsUIType>();
const netRef = ref<EchartsUIType>();

const { renderEcharts: renderCpu } = useEcharts(cpuRef);
const { renderEcharts: renderGpu } = useEcharts(gpuRef);
const { renderEcharts: renderMem } = useEcharts(memRef);
const { renderEcharts: renderNet } = useEcharts(netRef);

function tip(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function goBack() {
  router.push('/service/mydemand/compute');
}

function lineOption(name: string, data: number[], color: string) {
  return {
    color: [color],
    grid: { bottom: 28, containLabel: true, left: 36, right: 16, top: 28 },
    series: [
      {
        areaStyle: { color: `${color}22` },
        data,
        name,
        smooth: true,
        type: 'line' as const,
      },
    ],
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      axisLabel: { color: '#9e9e9e', fontSize: 10 },
      boundaryGap: false,
      data: data.map((_, i) => `${String(i).padStart(2, '0')}:00`),
      type: 'category' as const,
    },
    yAxis: {
      axisLabel: { color: '#9e9e9e', formatter: '{value}%' },
      max: 100,
      min: 0,
      splitLine: { lineStyle: { type: 'dashed' as const } },
      type: 'value' as const,
    },
  };
}

function renderCharts() {
  const seed = taskId.value.length + (chartRange.value === '1h' ? 1 : 3);
  renderCpu(lineOption('CPU', buildSeries(seed, 24), '#42a5f5'));
  renderGpu(lineOption('GPU', buildSeries(seed + 2, 24), '#66bb6a'));
  renderMem(lineOption('内存', buildSeries(seed + 4, 24), '#ab47bc'));
  renderNet(lineOption('网络', buildSeries(seed + 6, 24), '#ffa726'));
}

function refreshCharts() {
  renderCharts();
  tip('监控数据已刷新（示例）');
}

function exportCharts() {
  tip('已导出资源使用报表（示例）');
}

watch([taskId, chartRange], () => {
  const t = task.value;
  elapsed.value = t.elapsedSec;
  renderCharts();
});

onMounted(() => {
  renderCharts();
  timer = window.setInterval(() => {
    if (task.value.stepIndex < 3) elapsed.value += 1;
  }, 1000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <div class="portal-inner-page runtime-page">
    <div class="top-bar">
      <div class="crumb">我的需求 / 应用运行管理</div>
      <div class="top-actions">
        <select v-model="taskId" class="task-select">
          <option v-for="t in runtimeTasks" :key="t.id" :value="t.id">
            {{ t.taskName }}（{{ t.taskId }}）
          </option>
        </select>
        <button type="button" @click="goBack">返回</button>
      </div>
    </div>

    <!-- 汇总指标 -->
    <div class="kpi-bar">
      <div v-for="k in runtimeKpis" :key="k.label" class="kpi">
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-value">
          {{ k.value }}
          <span>{{ k.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 基本信息 + 步骤 -->
    <section class="card">
      <h3>基本信息</h3>
      <div class="stepper">
        <div
          v-for="(s, i) in runtimeSteps"
          :key="s"
          class="step"
          :class="{
            done: i < task.stepIndex,
            on: i === task.stepIndex,
          }"
        >
          <div class="dot">
            <template v-if="i < task.stepIndex">✓</template>
            <template v-else>{{ i + 1 }}</template>
          </div>
          <div class="s-text">
            <div>{{ s }}</div>
            <div
              v-if="i === task.stepIndex && task.stepIndex === 2"
              class="prog"
            >
              {{ task.progressDone }}/{{ task.progressTotal }}
            </div>
          </div>
          <div v-if="i < runtimeSteps.length - 1" class="line" />
        </div>
      </div>

      <div class="info-grid">
        <div class="field">
          <label>任务ID</label>
          <div class="ro">{{ task.taskId }}</div>
        </div>
        <div class="field">
          <label>任务名称</label>
          <div class="ro">{{ task.taskName }}</div>
        </div>
        <div class="field">
          <label>任务类型</label>
          <div class="ro">{{ task.taskType }}</div>
        </div>
        <div class="field">
          <label>偏好设置</label>
          <div class="ro">{{ task.prefer }}</div>
        </div>
        <div class="field">
          <label>开始时间</label>
          <div class="ro">{{ task.startTime }}</div>
        </div>
        <div class="field">
          <label>实时时长</label>
          <div class="ro timer">{{ elapsedText }}</div>
        </div>
      </div>
    </section>

    <!-- 应用基本信息 -->
    <section class="card">
      <h3>应用基本信息</h3>
      <div class="info-grid">
        <div class="field">
          <label>应用名称</label>
          <div class="ro">{{ task.appName }}</div>
        </div>
        <div class="field">
          <label>应用版本</label>
          <div class="ro">{{ task.appVersion }}</div>
        </div>
        <div class="field">
          <label>应用类型</label>
          <div class="ro">{{ task.appType }}</div>
        </div>
        <div class="field full">
          <label>应用描述</label>
          <div class="ro area">{{ task.appDesc }}</div>
        </div>
      </div>
    </section>

    <!-- 应用模型信息 -->
    <section class="card">
      <h3>应用模型信息</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>实例名称</th>
              <th>应用类型</th>
              <th>应用附件</th>
              <th>上传时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in runtimeModels" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.fileName }}</td>
              <td>{{ row.uploadedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="note">
        注：上传文件支持 zip、xml、excel 等格式；单文件大小建议不超过 2GB。
      </p>
    </section>

    <!-- 应用素材信息 -->
    <section class="card">
      <h3>应用素材信息</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>素材名称</th>
              <th>素材类型</th>
              <th>素材附件</th>
              <th>上传时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in runtimeMaterials" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.fileName }}</td>
              <td>{{ row.uploadedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="note">
        注：上传文件支持 zip、xml、excel 等格式；单文件大小建议不超过 2GB。
      </p>
    </section>

    <!-- 资源使用情况 -->
    <section class="card">
      <div class="chart-head">
        <h3>资源使用情况</h3>
        <div class="chart-tools">
          <div class="range">
            <button
              type="button"
              :class="{ on: chartRange === '1h' }"
              @click="chartRange = '1h'"
            >
              近一小时
            </button>
            <button
              type="button"
              :class="{ on: chartRange === 'today' }"
              @click="chartRange = 'today'"
            >
              今日
            </button>
            <button
              type="button"
              :class="{ on: chartRange === 'custom' }"
              @click="chartRange = 'custom'"
            >
              选择日期
            </button>
          </div>
          <button type="button" @click="exportCharts">导出</button>
          <button type="button" class="primary" @click="refreshCharts">
            刷新
          </button>
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-card">
          <div class="ct">CPU资源使用情况</div>
          <EchartsUI ref="cpuRef" height="220px" />
        </div>
        <div class="chart-card">
          <div class="ct">GPU资源使用情况</div>
          <EchartsUI ref="gpuRef" height="220px" />
        </div>
        <div class="chart-card">
          <div class="ct">内存使用情况</div>
          <EchartsUI ref="memRef" height="220px" />
        </div>
        <div class="chart-card">
          <div class="ct">网络资源使用情况</div>
          <EchartsUI ref="netRef" height="220px" />
          <div class="net-stats">
            <div>
              <span>发送比特率</span>
              <b>Max 82 / Min 12 / Avg 45</b>
            </div>
            <div>
              <span>接收比特率</span>
              <b>Max 76 / Min 8 / Avg 38</b>
            </div>
            <div>
              <span>发送数据包</span>
              <b>Max 1200 / Min 200 / Avg 680</b>
            </div>
            <div>
              <span>接收数据包</span>
              <b>Max 1100 / Min 180 / Avg 620</b>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.crumb {
  font-size: 13px;
  color: #9e9e9e;
}

.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.task-select {
  height: 32px;
  min-width: 220px;
  padding: 0 10px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.top-actions button,
.chart-tools button,
.range button {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: #616161;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

button.primary {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.kpi-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
  margin-bottom: 14px;
  background: linear-gradient(90deg, #e3f2fd, #e8f5e9);
  border-radius: 10px;
}

@media (max-width: 960px) {
  .kpi-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi {
  padding: 10px 12px;
  background: rgb(255 255 255 / 75%);
  border-radius: 8px;
}

.kpi-label {
  margin-bottom: 4px;
  font-size: 12px;
  color: #757575;
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: #1565c0;
}

.kpi-value span {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #9e9e9e;
}

.card {
  padding: 16px 18px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
}

.card h3 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
}

.stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  align-items: flex-start;
  margin-bottom: 18px;
}

.step {
  position: relative;
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: flex-start;
  min-width: 120px;
}

.dot {
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 13px;
  font-weight: 700;
  color: #9e9e9e;
  background: #eee;
  border-radius: 50%;
}

.step.done .dot {
  color: #fff;
  background: #409eff;
}

.step.on .dot {
  color: #fff;
  background: #1976d2;
  box-shadow: 0 0 0 4px #bbdefb;
}

.s-text {
  font-size: 13px;
  color: #757575;
}

.step.on .s-text,
.step.done .s-text {
  font-weight: 600;
  color: #1976d2;
}

.prog {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #409eff;
}

.step .line {
  position: absolute;
  top: 14px;
  left: 36px;
  right: 8px;
  height: 2px;
  background: #e0e0e0;
}

.step.done .line {
  background: #90caf9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
}

@media (max-width: 900px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #9e9e9e;
}

.ro {
  min-height: 34px;
  padding: 8px 10px;
  font-size: 13px;
  color: #424242;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 6px;
}

.ro.area {
  min-height: 72px;
  line-height: 1.5;
}

.ro.timer {
  font-size: 22px;
  font-weight: 700;
  color: #e91e63;
  letter-spacing: 1px;
}

.table-wrap {
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 12px;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 600;
  color: #616161;
  background: #fafafa;
}

.note {
  margin: 10px 0 0;
  font-size: 12px;
  color: #9e9e9e;
}

.chart-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-head h3 {
  margin: 0;
}

.chart-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.range {
  display: flex;
  gap: 0;
}

.range button {
  border-radius: 0;
}

.range button:first-child {
  border-radius: 6px 0 0 6px;
}

.range button:last-child {
  border-radius: 0 6px 6px 0;
}

.range button.on {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 960px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  padding: 10px 12px 8px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 10px;
}

.ct {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #616161;
}

.net-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #757575;
}

.net-stats b {
  display: block;
  margin-top: 2px;
  font-weight: 600;
  color: #424242;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 4000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
