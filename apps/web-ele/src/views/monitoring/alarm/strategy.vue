<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  strategyAlarmKpis,
  strategyAlarmRows,
  strategyLevelPie,
} from '#/views/_shared/data/monitoring-alarm';

defineOptions({ name: 'AlarmStrategy' });

const viewTab = ref('query');
const pieRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(pieRef);

function levelClass(l: string) {
  if (l === '致命') return 'danger';
  if (l === '警告') return 'warn';
  return 'info';
}

function statusClass(s: string) {
  if (s === '待处理') return 'warn';
  if (s === '处理中') return 'run';
  return 'ok';
}

onMounted(() => {
  renderEcharts({
    color: strategyLevelPie.map((d) => d.color),
    legend: { bottom: 0, orient: 'vertical', right: 0 },
    series: [
      {
        data: strategyLevelPie.map((d) => ({ name: d.name, value: d.value })),
        radius: ['50%', '72%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });
});
</script>

<template>
  <div class="page compact">
    <header class="head">
      <div>
        <h2>策略校核告警</h2>
        <p>标准化、可追溯的策略校核实时告警监控与闭环处置。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn danger-outline"
          type="button"
          @click="ElMessage.warning('模拟推送（示例）')"
        >
          ↻ 模拟实时推送
        </button>
        <button class="btn" type="button" @click="ElMessage.info('阈值规则配置')">
          ⚙ 阈值规则配置
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已导出（示例）')"
        >
          导出告警数据
        </button>
      </div>
    </header>

    <div class="kpi-cards">
      <article
        v-for="k in strategyAlarmKpis"
        :key="k.label"
        class="kpi-card"
        :class="k.tone"
      >
        <span class="tag">{{ k.tag }}</span>
        <div class="kpi-label">{{ k.label }}</div>
        <strong>{{ k.value }}</strong>
      </article>
    </div>

    <div class="sub-tabs">
      <button
        type="button"
        class="sub-tab"
        :class="{ active: viewTab === 'query' }"
        @click="viewTab = 'query'"
      >
        实时告警查询
      </button>
      <button
        type="button"
        class="sub-tab"
        :class="{ active: viewTab === 'overview' }"
        @click="viewTab = 'overview'"
      >
        告警总览视图
      </button>
    </div>

    <div class="content-grid">
      <section class="card main-panel">
        <div class="search-bar">
          <input placeholder="搜索告警ID、来源任务、告警类型…" />
          <select><option>告警等级: 全部</option></select>
          <select><option>状态: 全部</option></select>
        </div>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>告警信息</th>
              <th>等级</th>
              <th>告警类型</th>
              <th>来源任务</th>
              <th>状态</th>
              <th>触发时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in strategyAlarmRows" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>
                <strong>{{ r.id }}</strong>
                <div class="sub">{{ r.title }}</div>
              </td>
              <td><span class="lvl" :class="levelClass(r.level)">{{ r.level }}</span></td>
              <td>{{ r.type }}</td>
              <td>{{ r.task }}</td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.time }}</td>
              <td class="ops">
                <button type="button" class="link" title="认领">👤</button>
                <button type="button" class="link" title="详情">👁</button>
                <button type="button" class="link">⋯</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <aside class="card side-panel">
        <div class="card-title">告警等级分布</div>
        <EchartsUI ref="pieRef" height="220px" />
        <ul class="legend-list">
          <li v-for="d in strategyLevelPie" :key="d.name">
            <i :style="{ background: d.color }"></i>
            {{ d.name }}
            <em>{{ d.value }}</em>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.page.compact {
  max-width: 1280px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn.danger-outline {
  color: #f56c6c;
  border-color: #fbc4c4;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card {
  position: relative;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.kpi-card .tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  font-size: 10px;
  border-radius: 4px;
}

.kpi-card.danger .tag {
  color: #f56c6c;
  background: #fef0f0;
}

.kpi-card.mute .tag {
  color: #909399;
  background: #f4f4f5;
}

.kpi-card.info .tag {
  color: #409eff;
  background: #ecf5ff;
}

.kpi-card.ok .tag {
  color: #67c23a;
  background: #f0f9eb;
}

.kpi-label {
  font-size: 13px;
  color: #909399;
}

.kpi-card strong {
  display: block;
  margin-top: 4px;
  font-size: 28px;
}

.kpi-card.danger strong {
  color: #f56c6c;
}

.kpi-card.info strong {
  color: #409eff;
}

.kpi-card.ok strong {
  color: #67c23a;
}

.sub-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.sub-tab {
  padding: 10px 0;
  margin-bottom: -1px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.sub-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.search-bar input {
  flex: 1;
  min-width: 200px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.search-bar select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

.lvl.danger {
  color: #f56c6c;
}

.lvl.warn {
  color: #e6a23c;
}

.lvl.info {
  color: #409eff;
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

.status-dot.warn::before {
  background: #f56c6c;
}

.status-dot.run::before {
  background: #e6a23c;
}

.status-dot.ok::before {
  background: #67c23a;
}

.ops {
  display: flex;
  gap: 6px;
}

.link {
  padding: 0 4px;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.legend-list {
  padding: 0;
  margin: 8px 0 0;
  list-style: none;
}

.legend-list li {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.legend-list i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-list em {
  margin-left: auto;
  font-style: normal;
  color: #909399;
}

@media (max-width: 1000px) {
  .kpi-cards {
    grid-template-columns: 1fr 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
