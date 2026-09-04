<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  powerMeterTasks,
  type PowerPeriod,
  powerPeriodKpis,
  powerTrendWeek,
} from '#/views/_shared/data/power-meter';

defineOptions({ name: 'PowerTaskMeter' });

const period = ref<PowerPeriod>('today');
const page = ref(1);
const pageSize = 5;

const powerChartRef = ref<EchartsUIType>();
const carbonChartRef = ref<EchartsUIType>();
const { renderEcharts: renderPower } = useEcharts(powerChartRef);
const { renderEcharts: renderCarbon } = useEcharts(carbonChartRef);

const kpis = computed(() => powerPeriodKpis[period.value]);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(powerMeterTasks.length / pageSize)),
);

const pagedTasks = computed(() => {
  const start = (page.value - 1) * pageSize;
  return powerMeterTasks.slice(start, start + pageSize);
});

function statusClass(s: string) {
  if (s === '正常') return 'ok';
  if (s === '警告') return 'warn';
  if (s === '缓慢') return 'slow';
  if (s === '超时') return 'timeout';
  return 'danger';
}

function priorityClass(p: string) {
  if (p === '高') return 'high';
  if (p === '中') return 'mid';
  return 'low';
}

function barOption(name: string, data: number[], color: string, unit: string) {
  return {
    color: [color],
    grid: { bottom: 28, containLabel: true, left: 48, right: 16, top: 36 },
    series: [
      {
        barMaxWidth: 36,
        data,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          color: '#606266',
          fontSize: 11,
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
      data: powerTrendWeek.days,
      type: 'category' as const,
    },
    yAxis: {
      name: unit,
      splitLine: { lineStyle: { type: 'dashed' as const } },
      type: 'value' as const,
    },
  };
}

function paintCharts() {
  renderPower(barOption('电力消耗', powerTrendWeek.power, '#f5a623', 'kWh'));
  renderCarbon(barOption('碳排放量', powerTrendWeek.carbon, '#52c41a', 'kg'));
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
        <h2>智算任务电力计量</h2>
        <p>
          计量智算任务执行过程中的电力消耗，结合 PUE、峰值功率与关联碳排强度，支撑能耗分析与调度优化。
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
        <div class="card-title">电力消耗趋势（近 7 天）</div>
        <EchartsUI ref="powerChartRef" height="260px" />
      </section>
      <section class="card">
        <div class="card-title">关联碳排放量趋势（近 7 天）</div>
        <EchartsUI ref="carbonChartRef" height="260px" />
      </section>
    </div>

    <section class="card table-card">
      <div class="card-title">
        运行中任务列表
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
            @click="ElMessage.success('已导出列表（示例）')"
          >
            导出列表
          </button>
        </span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>任务 ID</th>
              <th>任务名称</th>
              <th>任务类型</th>
              <th>运行阶段</th>
              <th>状态</th>
              <th>优先级</th>
              <th>已运行时间</th>
              <th>累计电量</th>
              <th>峰值功率</th>
              <th>进度</th>
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
              <td>
                <span class="type-tag">{{ r.type }}</span>
              </td>
              <td>
                <span class="stage-tag">{{ r.stage }}</span>
              </td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">
                  {{ r.status }}
                </span>
              </td>
              <td>
                <span class="prio" :class="priorityClass(r.priority)">
                  {{ r.priority }}
                </span>
              </td>
              <td>{{ r.elapsed }}</td>
              <td>{{ r.powerKwh }} kWh</td>
              <td>{{ r.peakKw }} kW</td>
              <td>
                <div class="prog-cell">
                  <div class="prog">
                    <i :style="{ width: `${r.progress}%` }"></i>
                  </div>
                  <em>{{ r.progress }}%</em>
                  <button
                    type="button"
                    class="link sm"
                    @click="ElMessage.info(`进度详情：${r.name}`)"
                  >
                    查看详情
                  </button>
                </div>
              </td>
              <td>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.warning(`终止任务 ${r.id}（示例）`)"
                >
                  终止任务
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>
          显示 {{ (page - 1) * pageSize + 1 }} 到
          {{ Math.min(page * pageSize, powerMeterTasks.length) }} 条，共
          {{ powerMeterTasks.length }} 条
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
  gap: 0;
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
  background: #409eff;
  border-color: #409eff;
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

.stat-card.orange {
  border-left: 4px solid #f5a623;
}

.stat-card.orange-light {
  border-left: 4px solid #ffc069;
}

.stat-card.green {
  border-left: 4px solid #52c41a;
}

.stat-card.green-light {
  border-left: 4px solid #95de64;
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
  line-height: 1.2;
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
  background: #f5f7fa;
  border-radius: 10px;
}

.stat-card.orange .stat-icon {
  color: #f5a623;
  background: #fff7e6;
}

.stat-card.orange-light .stat-icon {
  color: #fa8c16;
  background: #fff2e8;
}

.stat-card.green .stat-icon {
  color: #52c41a;
  background: #f6ffed;
}

.stat-card.green-light .stat-icon {
  color: #73d13d;
  background: #fcffe6;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
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
  color: #409eff;
  background: #ecf5ff;
  border-radius: 4px;
}

.stage-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.status-dot {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.status-dot::before {
  width: 8px;
  height: 8px;
  content: '';
  border-radius: 50%;
}

.status-dot.ok {
  color: #67c23a;
}

.status-dot.ok::before {
  background: #67c23a;
}

.status-dot.warn {
  color: #e6a23c;
}

.status-dot.warn::before {
  background: #e6a23c;
}

.status-dot.slow {
  color: #fa8c16;
}

.status-dot.slow::before {
  background: #fa8c16;
}

.status-dot.danger,
.status-dot.timeout {
  color: #f56c6c;
}

.status-dot.danger::before,
.status-dot.timeout::before {
  background: #f56c6c;
}

.prio {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.prio.high {
  color: #fff;
  background: #f56c6c;
}

.prio.mid {
  color: #fff;
  background: #e6a23c;
}

.prio.low {
  color: #fff;
  background: #67c23a;
}

.prog-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-width: 140px;
}

.prog {
  flex: 1;
  min-width: 60px;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
}

.prog i {
  display: block;
  height: 100%;
  background: #409eff;
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

.link.sm {
  font-size: 12px;
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
  background: #409eff;
  border-color: #409eff;
}

.pager-btns button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 1100px) {
  .stat-grid,
  .chart-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .stat-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
