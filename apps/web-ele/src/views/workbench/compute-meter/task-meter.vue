<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, nextTick, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  computeMeterTasks,
  meterSeries,
  type ComputeMeterTask,
} from '#/views/_shared/data/compute-meter';

defineOptions({ name: 'ComputeTaskMeter' });

const keyword = ref('');
const status = ref('');
const type = ref('');
const selected = ref<ComputeMeterTask | null>(null);

const metricsRef = ref<EchartsUIType>();
const cumRef = ref<EchartsUIType>();
const { renderEcharts: renderMetrics } = useEcharts(metricsRef);
const { renderEcharts: renderCum } = useEcharts(cumRef);

const filtered = computed(() => {
  let list = [...computeMeterTasks];
  if (keyword.value.trim()) {
    const kw = keyword.value.trim();
    list = list.filter((i) => i.name.includes(kw) || i.id.includes(kw));
  }
  if (status.value) list = list.filter((i) => i.status === status.value);
  if (type.value) list = list.filter((i) => i.type === type.value);
  return list;
});

const summary = computed(() => {
  const running = computeMeterTasks.filter((t) => t.status === '计量中').length;
  return {
    total: computeMeterTasks.length,
    running,
    cum: '1,530.6',
    avgGpu: '72%',
  };
});

function statusClass(s: string) {
  if (s === '计量中') return 'run';
  if (s === '已完成') return 'ok';
  return 'mute';
}

async function openDetail(row: ComputeMeterTask) {
  selected.value = row;
  await nextTick();
  paintCharts();
}

function paintCharts() {
  renderMetrics({
    color: ['#409eff', '#67c23a', '#e6a23c', '#909399'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 20, top: 40 },
    legend: {
      data: ['GPU利用率%', '算力吞吐 PFLOPS', '显存占用%', 'IO GB/s'],
    },
    series: [
      {
        data: meterSeries.gpuUtil,
        name: 'GPU利用率%',
        smooth: true,
        type: 'line',
      },
      {
        data: meterSeries.throughput,
        name: '算力吞吐 PFLOPS',
        smooth: true,
        type: 'line',
      },
      {
        data: meterSeries.vramUtil,
        name: '显存占用%',
        smooth: true,
        type: 'line',
      },
      {
        data: meterSeries.io,
        name: 'IO GB/s',
        smooth: true,
        type: 'line',
        yAxisIndex: 1,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: meterSeries.times, type: 'category' },
    yAxis: [
      { name: '% / PFLOPS', type: 'value' },
      { name: 'GB/s', splitLine: { show: false }, type: 'value' },
    ],
  });

  renderCum({
    color: ['#409eff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 16, top: 28 },
    series: [
      {
        areaStyle: { opacity: 0.12 },
        data: meterSeries.cumulative,
        name: '累计算力消耗',
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v) => `${v} PFLOPS·h`,
    },
    xAxis: { data: meterSeries.times, type: 'category' },
    yAxis: { name: 'PFLOPS·h', type: 'value' },
  });
}

watch(selected, async (v) => {
  if (!v) return;
  await nextTick();
  paintCharts();
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>智算任务算力计量</h2>
        <p>
          根据 GPU 利用率、算力吞吐量、显存占用率、IO
          吞吐量等基础指标，计量智算任务执行过程中的累计算力消耗。
        </p>
      </div>
      <div class="head-actions">
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('计量数据已刷新')"
        >
          刷新
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已导出计量报表（示例）')"
        >
          导出报表
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi">
        <strong>{{ summary.total }}</strong>
        <span>计量任务</span>
      </div>
      <div class="kpi">
        <strong>{{ summary.running }}</strong>
        <span>计量中</span>
      </div>
      <div class="kpi">
        <strong>{{ summary.cum }}</strong>
        <span>累计算力 PFLOPS·h</span>
      </div>
      <div class="kpi">
        <strong>{{ summary.avgGpu }}</strong>
        <span>平均 GPU 利用率</span>
      </div>
    </div>

    <div class="filter card">
      <input v-model="keyword" placeholder="任务名称 / ID" />
      <select v-model="type">
        <option value="">全部类型</option>
        <option>训练</option>
        <option>推理</option>
        <option>批处理</option>
      </select>
      <select v-model="status">
        <option value="">全部状态</option>
        <option>计量中</option>
        <option>已完成</option>
        <option>暂停</option>
      </select>
    </div>

    <section class="card">
      <div class="card-title">
        任务计量列表
        <small>点击行查看指标曲线与累计算力</small>
      </div>
      <table>
        <thead>
          <tr>
            <th>任务ID</th>
            <th>名称</th>
            <th>类型</th>
            <th>GPU</th>
            <th>GPU利用率</th>
            <th>显存占用</th>
            <th>算力吞吐</th>
            <th>IO吞吐</th>
            <th>累计算力</th>
            <th>时长</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in filtered"
            :key="r.id"
            class="row"
            :class="{ active: selected?.id === r.id }"
            @click="openDetail(r)"
          >
            <td>{{ r.id }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.type }}</td>
            <td>{{ r.gpus }}</td>
            <td>{{ r.gpuUtil }}%</td>
            <td>{{ r.vramUtil }}%</td>
            <td>{{ r.throughput }}</td>
            <td>{{ r.io }}</td>
            <td class="em">{{ r.cumulative }}</td>
            <td>{{ r.duration }}</td>
            <td>
              <span class="badge" :class="statusClass(r.status)">{{
                r.status
              }}</span>
            </td>
            <td>
              <button
                type="button"
                class="link"
                @click.stop="openDetail(r)"
              >
                明细
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="selected" class="card detail">
      <div class="card-title">
        计量明细 · {{ selected.name }}
        <span class="right">
          <button type="button" class="link" @click="selected = null">
            收起
          </button>
        </span>
      </div>

      <div class="meta">
        <span>任务ID：{{ selected.id }}</span>
        <span>类型：{{ selected.type }}</span>
        <span>GPU 数：{{ selected.gpus }}</span>
        <span>开始：{{ selected.startTime }}</span>
        <span>结束：{{ selected.endTime }}</span>
        <span class="em">累计算力：{{ selected.cumulative }}</span>
      </div>

      <div class="metric-kpis">
        <div class="mk">
          <em>GPU 利用率</em>
          <strong>{{ selected.gpuUtil }}%</strong>
        </div>
        <div class="mk">
          <em>算力吞吐</em>
          <strong>{{ selected.throughput }}</strong>
        </div>
        <div class="mk">
          <em>显存占用</em>
          <strong>{{ selected.vramUtil }}%</strong>
        </div>
        <div class="mk">
          <em>IO 吞吐</em>
          <strong>{{ selected.io }}</strong>
        </div>
      </div>

      <div class="chart-block">
        <div class="sub-title">基础指标时序</div>
        <EchartsUI ref="metricsRef" height="280px" />
      </div>
      <div class="chart-block">
        <div class="sub-title">累计算力消耗</div>
        <EchartsUI ref="cumRef" height="220px" />
      </div>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.row {
  cursor: pointer;
}

.row:hover,
.row.active {
  background: #f0f7ff;
}

.em {
  font-weight: 600;
  color: #409eff;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.detail {
  margin-top: 12px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 14px;
  color: #606266;
  font-size: 13px;
}

.metric-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.mk {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.mk em {
  display: block;
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
  font-style: normal;
}

.mk strong {
  color: #303133;
  font-size: 18px;
}

.chart-block {
  margin-top: 8px;
}

.sub-title {
  margin-bottom: 6px;
  color: #606266;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .metric-kpis {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
