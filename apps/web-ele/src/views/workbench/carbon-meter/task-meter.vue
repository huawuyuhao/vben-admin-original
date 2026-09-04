<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  carbonIntensityWeek,
  carbonMeterTasks,
  type CarbonPeriod,
  carbonPeriodKpis,
  carbonRegionRows,
  carbonRules,
  carbonTrendWeek,
} from '#/views/_shared/data/carbon-meter';

defineOptions({ name: 'CarbonTaskMeter' });

const period = ref<CarbonPeriod>('today');
const page = ref(1);
const pageSize = 5;

const trendRef = ref<EchartsUIType>();
const intensityRef = ref<EchartsUIType>();
const { renderEcharts: renderTrend } = useEcharts(trendRef);
const { renderEcharts: renderIntensity } = useEcharts(intensityRef);

const kpis = computed(() => carbonPeriodKpis[period.value]);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(carbonMeterTasks.length / pageSize)),
);

const pagedTasks = computed(() => {
  const start = (page.value - 1) * pageSize;
  return carbonMeterTasks.slice(start, start + pageSize);
});

function statusClass(s: string) {
  if (s === '计量中') return 'run';
  if (s === '已完成') return 'ok';
  return 'mute';
}

function barOption(
  name: string,
  data: number[],
  color: string,
  unit: string,
  days: string[],
  max?: number,
) {
  return {
    color: [color],
    grid: { bottom: 28, containLabel: true, left: 52, right: 16, top: 36 },
    series: [
      {
        barMaxWidth: 36,
        data,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          color: '#303133',
          fontSize: 11,
          fontWeight: (params: { dataIndex: number }) =>
            params.dataIndex === data.length - 1 ? ('bold' as const) : ('normal' as const),
          position: 'top' as const,
          show: true,
        },
        name,
        type: 'bar' as const,
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      valueFormatter: (v: number) => `${v} ${unit}`,
    },
    xAxis: {
      axisLine: { lineStyle: { color: '#ebeef5' } },
      axisTick: { show: false },
      data: days,
      type: 'category' as const,
    },
    yAxis: {
      max,
      name: unit,
      splitLine: { lineStyle: { type: 'dashed' as const } },
      type: 'value' as const,
    },
  };
}

function lineOption(name: string, data: number[], color: string) {
  return {
    color: [color],
    grid: { bottom: 28, containLabel: true, left: 48, right: 16, top: 36 },
    series: [
      {
        data,
        name,
        smooth: true,
        type: 'line' as const,
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      valueFormatter: (v: number) => `${v} kg/kWh`,
    },
    xAxis: {
      data: carbonIntensityWeek.days,
      type: 'category' as const,
    },
    yAxis: {
      max: 0.6,
      min: 0.45,
      name: 'kg/kWh',
      splitLine: { lineStyle: { type: 'dashed' as const } },
      type: 'value' as const,
    },
  };
}

function paintCharts() {
  renderTrend(
    barOption(
      '碳排放量',
      carbonTrendWeek.carbon,
      '#52c41a',
      'kg',
      carbonTrendWeek.days,
      4000,
    ),
  );
  renderIntensity(lineOption('碳排强度', carbonIntensityWeek.intensity, '#13c2c2'));
}

watch(period, () => {
  page.value = 1;
});

onMounted(async () => {
  await nextTick();
  paintCharts();
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>智算任务碳排计量</h2>
        <p>
          基于区域电网碳强度、任务用电量与绿电占比，计量智算任务执行过程中的毛碳排、绿电抵消与净碳排。
        </p>
      </div>
      <div class="period-tabs">
        <button
          type="button"
          :class="{ active: period === 'today' }"
          @click="period = 'today'"
        >
          今日
        </button>
        <button
          type="button"
          :class="{ active: period === 'week' }"
          @click="period = 'week'"
        >
          本周
        </button>
        <button
          type="button"
          :class="{ active: period === 'month' }"
          @click="period = 'month'"
        >
          本月
        </button>
      </div>
    </header>

    <div class="stat-grid">
      <article
        v-for="k in kpis"
        :key="k.key"
        class="stat-card"
        :class="k.tone"
      >
        <div class="stat-body">
          <div class="stat-label">{{ k.label }}</div>
          <div class="stat-value">
            {{ k.value }}
            <small>{{ k.unit }}</small>
          </div>
          <div class="stat-trend" :class="k.up ? 'up' : 'down'">
            {{ k.up ? '↑' : '↓' }} {{ k.trend }}
          </div>
        </div>
        <div class="stat-icon">{{ k.icon }}</div>
      </article>
    </div>

    <div class="chart-grid">
      <section class="card">
        <div class="card-title">碳排放量趋势（近 7 天）</div>
        <EchartsUI ref="trendRef" height="280px" />
      </section>
      <section class="card">
        <div class="card-title">碳排强度趋势（近 7 天）</div>
        <EchartsUI ref="intensityRef" height="280px" />
      </section>
    </div>

    <div class="mid-grid">
      <section class="card">
        <div class="card-title">分区域碳排汇总</div>
        <table>
          <thead>
            <tr>
              <th>区域</th>
              <th>毛碳排</th>
              <th>绿电抵消</th>
              <th>净碳排</th>
              <th>绿电占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in carbonRegionRows" :key="r.region">
              <td>{{ r.region }}</td>
              <td>{{ r.gross }} kg</td>
              <td class="ok">{{ r.offset }} kg</td>
              <td class="em">{{ r.net }} kg</td>
              <td>{{ r.ratio }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card rules">
        <div class="card-title">计量规则算法</div>
        <ul>
          <li v-for="(rule, i) in carbonRules" :key="i">{{ rule }}</li>
        </ul>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.info('已打开规则详情（示例）')"
        >
          查看规则详情
        </button>
      </section>
    </div>

    <section class="card table-card">
      <div class="card-title">
        任务碳排计量列表
        <span class="right">
          <button
            class="btn"
            type="button"
            @click="ElMessage.success('列表已刷新')"
          >
            刷新
          </button>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('已导出碳排报表（示例）')"
          >
            导出报表
          </button>
        </span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>任务 ID</th>
              <th>任务名称</th>
              <th>类型</th>
              <th>区域</th>
              <th>毛碳排</th>
              <th>绿电抵消</th>
              <th>净碳排</th>
              <th>碳排强度</th>
              <th>绿电占比</th>
              <th>进度</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagedTasks" :key="r.id">
              <td>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.info(`查看 ${r.id}`)"
                >
                  {{ r.id }}
                </button>
              </td>
              <td>{{ r.name }}</td>
              <td><span class="type-tag">{{ r.type }}</span></td>
              <td>{{ r.region }}</td>
              <td>{{ r.gross }}</td>
              <td class="ok">{{ r.offset }}</td>
              <td class="em">{{ r.net }}</td>
              <td>{{ r.intensity }}</td>
              <td>{{ r.greenRatio }}</td>
              <td>
                <div class="prog-cell">
                  <div class="prog">
                    <i :style="{ width: `${r.progress}%` }"></i>
                  </div>
                  <em>{{ r.progress }}%</em>
                </div>
              </td>
              <td>
                <span class="badge" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.info(`核算明细：${r.name}`)"
                >
                  核算明细
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>
          显示 {{ (page - 1) * pageSize + 1 }} 到
          {{ Math.min(page * pageSize, carbonMeterTasks.length) }} 条，共
          {{ carbonMeterTasks.length }} 条
        </span>
        <div class="pager-btns">
          <button
            type="button"
            :disabled="page <= 1"
            @click="page = Math.max(1, page - 1)"
          >
            ‹
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            :class="{ active: p === page }"
            @click="page = p"
          >
            {{ p }}
          </button>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="page = Math.min(totalPages, page + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.head {
  align-items: center;
}

.period-tabs {
  display: flex;
  flex-shrink: 0;
}

.period-tabs button {
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.period-tabs button:first-child {
  border-radius: 4px 0 0 4px;
}

.period-tabs button:last-child {
  border-radius: 0 4px 4px 0;
}

.period-tabs button + button {
  margin-left: -1px;
}

.period-tabs button.active {
  z-index: 1;
  color: #fff;
  background: #52c41a;
  border-color: #52c41a;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.stat-card {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.stat-card.green {
  border-left: 4px solid #52c41a;
}

.stat-card.green-light {
  border-left: 4px solid #95de64;
}

.stat-card.teal {
  border-left: 4px solid #13c2c2;
}

.stat-card.teal-light {
  border-left: 4px solid #5cdbd3;
}

.stat-label {
  margin-bottom: 6px;
  font-size: 13px;
  color: #909399;
}

.stat-value {
  margin-bottom: 4px;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-value small {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up {
  color: #f56c6c;
}

.stat-trend.down {
  color: #67c23a;
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 20px;
  border-radius: 10px;
}

.stat-card.green .stat-icon {
  color: #52c41a;
  background: #f6ffed;
}

.stat-card.green-light .stat-icon {
  color: #73d13d;
  background: #fcffe6;
}

.stat-card.teal .stat-icon {
  color: #13c2c2;
  background: #e6fffb;
}

.stat-card.teal-light .stat-icon {
  color: #36cfc9;
  background: #e6fffb;
}

.chart-grid,
.mid-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.rules ul {
  padding-left: 18px;
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
}

.table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  min-width: 1100px;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  border-radius: 4px;
}

.em {
  font-weight: 600;
  color: #52c41a;
}

.ok {
  color: #13c2c2;
}

.prog-cell {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 90px;
}

.prog {
  flex: 1;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
}

.prog i {
  display: block;
  height: 100%;
  background: #52c41a;
  border-radius: 4px;
}

.prog-cell em {
  font-size: 12px;
  font-style: normal;
  color: #606266;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
  border-top: 1px solid #ebeef5;
}

.pager-btns {
  display: flex;
  gap: 4px;
}

.pager-btns button {
  min-width: 32px;
  height: 32px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.pager-btns button.active {
  color: #fff;
  background: #52c41a;
  border-color: #52c41a;
}

.pager-btns button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 1100px) {
  .stat-grid,
  .chart-grid,
  .mid-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .stat-grid,
  .chart-grid,
  .mid-grid {
    grid-template-columns: 1fr;
  }

  .head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
