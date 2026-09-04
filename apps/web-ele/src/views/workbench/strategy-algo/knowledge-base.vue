<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElMessage } from 'element-plus';

import {
  kbEntries,
  kbRecentUpdates,
  kbStats,
  kbTrainingTrend,
} from '#/views/_shared/data/strategy-algo';

defineOptions({ name: 'StrategyKnowledgeBase' });

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    color: ['#409eff', '#6b4cff'],
    grid: { bottom: 28, containLabel: true, left: 44, right: 44, top: 40 },
    legend: { data: ['准确率', '损失值'] },
    series: [
      {
        data: kbTrainingTrend.accuracy,
        name: '准确率',
        smooth: true,
        type: 'line',
        yAxisIndex: 0,
      },
      {
        data: kbTrainingTrend.loss,
        name: '损失值',
        smooth: true,
        type: 'line',
        yAxisIndex: 1,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: { data: kbTrainingTrend.dates, type: 'category' },
    yAxis: [
      { max: 100, min: 0, name: '%', type: 'value' },
      { max: 0.15, min: 0, name: 'loss', splitLine: { show: false }, type: 'value' },
    ],
  });
});

function toneClass(t: string) {
  if (t === 'new') return 'new';
  if (t === 'warn') return 'warn';
  return 'ok';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>策略校核模型知识库</h2>
        <p>收录历史运行数据，驱动策略模型持续进化。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('数据同步完成（示例）')"
        >
          ↻ 手动同步数据
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('打开新增表单（示例）')"
        >
          + 新增知识条目
        </button>
      </div>
    </header>

    <div class="stat-grid">
      <article v-for="s in kbStats" :key="s.key" class="stat-card">
        <div class="stat-icon">{{ s.icon }}</div>
        <div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
        <div class="spark">▁▂▃▅▆</div>
      </article>
    </div>

    <div class="main-grid">
      <section class="card chart-card">
        <div class="card-title">策略模型训练趋势</div>
        <p class="sub">
          基于历史运行数据的模型精度与损失函数分析
        </p>
        <EchartsUI ref="chartRef" height="300px" />
      </section>

      <section class="card feed-card">
        <div class="card-title">⚡ 最近知识更新</div>
        <button
          v-for="u in kbRecentUpdates"
          :key="u.id"
          type="button"
          class="feed-item"
          @click="ElMessage.info(`查看 ${u.id}`)"
        >
          <span class="dot" :class="toneClass(u.tone)"></span>
          <span class="feed-body">
            <strong>{{ u.title }}</strong>
            <em>{{ u.time }} · {{ u.id }}</em>
          </span>
          <span class="chev">›</span>
        </button>
      </section>
    </div>

    <section class="card">
      <div class="card-title">知识条目</div>
      <table>
        <thead>
          <tr>
            <th>条目ID</th>
            <th>分类</th>
            <th>标题</th>
            <th>来源</th>
            <th>关联版本</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in kbEntries" :key="e.id">
            <td>{{ e.id }}</td>
            <td><span class="cat">{{ e.category }}</span></td>
            <td>{{ e.title }}</td>
            <td>{{ e.source }}</td>
            <td>{{ e.version }}</td>
            <td>{{ e.updated }}</td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`详情 ${e.id}`)">
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

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
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  background: #f5f7fa;
  border-radius: 10px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.spark {
  margin-left: auto;
  font-size: 12px;
  color: #67c23a;
  letter-spacing: 1px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 12px;
  margin-bottom: 12px;
}

.chart-card .sub {
  margin: -4px 0 8px;
  font-size: 12px;
  color: #909399;
}

.feed-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  padding: 12px 4px;
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.feed-item:last-child {
  border-bottom: none;
}

.dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
}

.dot.new {
  background: #409eff;
}

.dot.ok {
  background: #67c23a;
}

.dot.warn {
  background: #e6a23c;
}

.feed-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.feed-body strong {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #303133;
}

.feed-body em {
  font-size: 12px;
  font-style: normal;
  color: #909399;
}

.chev {
  font-size: 18px;
  color: #c0c4cc;
}

.cat {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #6b4cff;
  background: #f3f0ff;
  border-radius: 4px;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

@media (max-width: 1100px) {
  .stat-grid,
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
