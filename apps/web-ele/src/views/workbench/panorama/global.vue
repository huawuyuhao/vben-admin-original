<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  aiScenes,
  dcStats,
  hours,
  kpiBubbles,
  mapNodes,
  priceSeries,
  sceneTop5,
  taskLoadSeries,
  taskOps,
  taskQueue,
} from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaGlobal' });

const clock = ref('');
const activeTab = ref('驾驶舱');
const tabs = ['驾驶舱', '日前编排', '日内调度', '需求响应'];

const top5Ref = ref<EchartsUIType>();
const curveRef = ref<EchartsUIType>();
const { renderEcharts: renderTop5 } = useEcharts(top5Ref);
const { renderEcharts: renderCurve } = useEcharts(curveRef);

let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  const now = new Date();
  clock.value = now.toLocaleTimeString('zh-CN', { hour12: false });
}

function renderCharts() {
  renderTop5({
    backgroundColor: 'transparent',
    grid: { bottom: 8, containLabel: true, left: 8, right: 36, top: 8 },
    series: [
      {
        data: sceneTop5.map((i) => i.value),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            colorStops: [
              { color: '#005eff', offset: 0 },
              { color: '#00d8ff', offset: 1 },
            ],
            type: 'linear',
            x: 0,
            x2: 1,
            y: 0,
            y2: 0,
          },
        },
        type: 'bar',
        barWidth: 12,
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#7eb6d9', fontSize: 11 },
      splitLine: { show: false },
      type: 'value',
    },
    yAxis: {
      axisLabel: { color: '#a8d4f0', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      data: sceneTop5.map((i) => i.name),
      type: 'category',
    },
  });

  renderCurve({
    backgroundColor: 'transparent',
    color: ['#00d8ff', '#69f0ae'],
    grid: { bottom: 28, containLabel: true, left: 42, right: 42, top: 36 },
    legend: {
      data: ['任务运行负荷', '电价'],
      right: 8,
      textStyle: { color: '#9ec9e8', fontSize: 11 },
      top: 4,
    },
    series: [
      {
        data: taskLoadSeries,
        name: '任务运行负荷',
        smooth: true,
        type: 'line',
        areaStyle: {
          color: {
            colorStops: [
              { color: 'rgba(0,216,255,0.35)', offset: 0 },
              { color: 'rgba(0,216,255,0)', offset: 1 },
            ],
            type: 'linear',
            x: 0,
            x2: 0,
            y: 0,
            y2: 1,
          },
        },
        showSymbol: false,
        yAxisIndex: 0,
      },
      {
        data: priceSeries,
        name: '电价',
        step: 'middle',
        type: 'line',
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: { width: 2 },
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      axisLabel: { color: '#7eb6d9', fontSize: 10 },
      boundaryGap: false,
      data: hours,
      type: 'category',
    },
    yAxis: [
      {
        axisLabel: { color: '#7eb6d9', fontSize: 10 },
        name: '负荷%',
        nameTextStyle: { color: '#7eb6d9', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0,120,180,0.25)' } },
        type: 'value',
      },
      {
        axisLabel: { color: '#7eb6d9', fontSize: 10 },
        name: '元/kWh',
        nameTextStyle: { color: '#7eb6d9', fontSize: 10 },
        splitLine: { show: false },
        type: 'value',
      },
    ],
  });
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
  renderCharts();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="screen">
    <header class="screen-head">
      <div class="head-deco" />
      <h1>电碳算协同运营系统</h1>
      <nav class="head-nav">
        <button
          v-for="t in tabs"
          :key="t"
          type="button"
          :class="{ active: activeTab === t }"
          @click="activeTab = t"
        >
          {{ t }}
        </button>
      </nav>
      <p class="head-time">数据更新时间: {{ clock }}</p>
    </header>

    <div class="screen-body">
      <!-- 左栏 -->
      <aside class="col left">
        <section class="panel">
          <h3 class="panel-title">数据中心</h3>
          <div class="dc-grid">
            <div v-for="item in dcStats" :key="item.label" class="dc-card">
              <span class="dc-icon">{{ item.icon }}</span>
              <div>
                <strong>{{ item.value }}<small>{{ item.unit }}</small></strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="panel">
          <h3 class="panel-title">AI 场景建设</h3>
          <div class="ai-grid">
            <div
              v-for="s in aiScenes"
              :key="s.label"
              class="ai-card"
              :data-tone="s.tone"
            >
              <strong>{{ s.value }}</strong>
              <span>{{ s.label }}</span>
            </div>
          </div>
        </section>

        <section class="panel grow">
          <h3 class="panel-title">业务场景分布 TOP5</h3>
          <EchartsUI ref="top5Ref" height="180px" />
        </section>
      </aside>

      <!-- 中栏 -->
      <main class="col center">
        <div class="kpi-row">
          <div v-for="k in kpiBubbles" :key="k.label" class="kpi-bubble">
            <div class="ring">
              <strong>{{ k.value }}</strong>
              <small>{{ k.unit }}</small>
            </div>
            <span>{{ k.label }}</span>
          </div>
        </div>

        <section class="panel map-panel">
          <h3 class="panel-title">算力节点分布</h3>
          <div class="map-stage">
            <div class="map-glow" />
            <svg class="map-shape" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M22 30 C30 18, 55 14, 72 22 C88 30, 92 48, 84 62 C76 78, 55 88, 36 84 C18 78, 12 52, 22 30 Z"
                fill="rgba(0,80,160,0.35)"
                stroke="rgba(0,216,255,0.55)"
                stroke-width="0.6"
              />
              <path
                d="M34 36 C42 28, 58 30, 66 38 C74 48, 70 62, 58 68 C44 74, 30 58, 34 36 Z"
                fill="rgba(0,120,200,0.2)"
                stroke="rgba(0,216,255,0.25)"
                stroke-width="0.4"
              />
            </svg>
            <div
              v-for="n in mapNodes"
              :key="n.name"
              class="map-node"
              :data-status="n.status"
              :style="{ left: `${n.x}%`, top: `${n.y}%` }"
            >
              <i />
              <em>{{ n.name }}</em>
            </div>
          </div>
        </section>

        <section class="panel">
          <h3 class="panel-title">算力节点运行曲线</h3>
          <EchartsUI ref="curveRef" height="200px" />
        </section>
      </main>

      <!-- 右栏 -->
      <aside class="col right">
        <section class="panel">
          <h3 class="panel-title">任务运维数据</h3>
          <div class="ops-top">
            <div class="ops-circle">
              <strong>{{ taskOps.completed.toLocaleString() }}</strong>
              <span>已累计完成任务数</span>
            </div>
            <div class="ops-circle green">
              <strong>{{ taskOps.energySaved }}<small>MWh</small></strong>
              <span>节省能耗</span>
            </div>
          </div>
          <div class="ops-grid">
            <div class="ops-mini">
              <strong>{{ taskOps.physical }}%</strong>
              <span>物理算力</span>
            </div>
            <div class="ops-mini">
              <strong>{{ taskOps.logical }}%</strong>
              <span>逻辑算力</span>
            </div>
            <div class="ops-mini">
              <strong>{{ taskOps.cpu }}%</strong>
              <span>CPU</span>
            </div>
            <div class="ops-mini">
              <strong>{{ taskOps.gpu }}%</strong>
              <span>GPU</span>
            </div>
          </div>
        </section>

        <section class="panel grow queue-panel">
          <h3 class="panel-title">任务队列</h3>
          <div class="queue-list">
            <article v-for="(t, i) in taskQueue" :key="i" class="queue-item">
              <div class="queue-head">
                <h4>{{ t.name }}</h4>
                <div class="tags">
                  <span class="tag run">{{ t.status }}</span>
                  <span class="tag strat">{{ t.strategy }}</span>
                </div>
              </div>
              <ul>
                <li><label>应用</label>{{ t.app }}</li>
                <li><label>计划启动</label>{{ t.planStart }}</li>
                <li><label>任务偏向</label>{{ t.bias }}</li>
                <li><label>数据中心</label>{{ t.dc }}</li>
              </ul>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.screen {
  --cyan: #00d8ff;
  --blue: #005eff;
  --bg: #041428;
  --panel: rgba(6, 40, 78, 0.72);
  --line: rgba(0, 180, 255, 0.35);
  --text: #d7eefc;
  --muted: #7eb6d9;

  min-height: calc(100vh - 120px);
  margin: -12px -16px;
  padding: 10px 14px 16px;
  color: var(--text);
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 90, 180, 0.45), transparent),
    linear-gradient(180deg, #062a52 0%, var(--bg) 45%, #020b18 100%);
  overflow: hidden;
}

.screen-head {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  min-height: 64px;
  margin-bottom: 10px;
  text-align: center;
}

.head-deco {
  position: absolute;
  inset: 8px 8% auto;
  height: 42px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 216, 255, 0.15),
    transparent
  );
  border-bottom: 1px solid rgba(0, 216, 255, 0.35);
  clip-path: polygon(4% 0, 96% 0, 100% 100%, 0 100%);
}

.screen-head h1 {
  grid-column: 2;
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-shadow: 0 0 18px rgba(0, 216, 255, 0.45);
}

.head-nav {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}

.head-nav button {
  padding: 4px 12px;
  color: var(--muted);
  font-size: 12px;
  background: rgba(0, 60, 120, 0.35);
  border: 1px solid rgba(0, 180, 255, 0.25);
  cursor: pointer;
}

.head-nav button.active {
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 120, 255, 0.55), rgba(0, 60, 140, 0.55));
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 216, 255, 0.35);
}

.head-time {
  position: absolute;
  bottom: -2px;
  left: 50%;
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  transform: translateX(-50%);
}

.screen-body {
  display: grid;
  grid-template-columns: 1.05fr 1.5fr 1.05fr;
  gap: 12px;
  min-height: 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.panel {
  padding: 10px 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  box-shadow: inset 0 0 24px rgba(0, 120, 200, 0.12);
}

.panel.grow {
  flex: 1;
  min-height: 0;
}

.panel-title {
  position: relative;
  margin: 0 0 10px;
  padding-left: 10px;
  color: var(--cyan);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.panel-title::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 0;
  width: 3px;
  height: 14px;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
}

.dc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dc-card {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: rgba(0, 40, 90, 0.45);
  border: 1px solid rgba(0, 160, 220, 0.2);
}

.dc-icon {
  font-size: 18px;
}

.dc-card strong {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}

.dc-card small {
  margin-left: 2px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 400;
}

.dc-card span {
  color: var(--muted);
  font-size: 11px;
}

.ai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ai-card {
  padding: 12px 8px;
  text-align: center;
  background: rgba(0, 50, 100, 0.4);
  border: 1px solid rgba(0, 180, 255, 0.25);
}

.ai-card strong {
  display: block;
  margin-bottom: 4px;
  font-size: 22px;
  color: var(--cyan);
}

.ai-card[data-tone='green'] strong {
  color: #69f0ae;
}

.ai-card[data-tone='blue'] strong {
  color: #40c4ff;
}

.ai-card[data-tone='orange'] strong {
  color: #ffb74d;
}

.ai-card span {
  color: var(--muted);
  font-size: 12px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.kpi-bubble {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 86px;
  height: 86px;
  background: radial-gradient(circle at 35% 30%, rgba(0, 180, 255, 0.35), transparent 55%),
    rgba(0, 40, 90, 0.5);
  border: 2px solid rgba(0, 216, 255, 0.55);
  border-radius: 50%;
  box-shadow: 0 0 18px rgba(0, 216, 255, 0.25);
}

.ring strong {
  font-size: 18px;
  line-height: 1;
}

.ring small {
  color: var(--muted);
  font-size: 10px;
}

.kpi-bubble > span {
  color: var(--muted);
  font-size: 12px;
}

.map-panel {
  flex: 1;
  min-height: 260px;
}

.map-stage {
  position: relative;
  height: 240px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 55%, rgba(0, 120, 200, 0.25), transparent 55%),
    linear-gradient(180deg, rgba(0, 30, 70, 0.2), rgba(0, 20, 50, 0.4));
}

.map-glow {
  position: absolute;
  inset: 20% 15%;
  background: radial-gradient(circle, rgba(0, 216, 255, 0.12), transparent 70%);
  pointer-events: none;
}

.map-shape {
  position: absolute;
  inset: 8% 12%;
  width: 76%;
  height: 84%;
}

.map-node {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  white-space: nowrap;
}

.map-node i {
  display: block;
  width: 10px;
  height: 10px;
  margin: 0 auto 4px;
  background: var(--cyan);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--cyan);
}

.map-node[data-status='busy'] i {
  background: #ffb74d;
  box-shadow: 0 0 12px #ffb74d;
}

.map-node[data-status='warn'] i {
  background: #ff5252;
  box-shadow: 0 0 12px #ff5252;
}

.map-node em {
  padding: 1px 6px;
  color: #e8f7ff;
  font-size: 11px;
  font-style: normal;
  background: rgba(0, 40, 90, 0.75);
  border: 1px solid rgba(0, 180, 255, 0.35);
}

.ops-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.ops-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  padding: 8px;
  text-align: center;
  background: radial-gradient(circle at 50% 40%, rgba(0, 160, 255, 0.25), transparent 60%),
    rgba(0, 40, 90, 0.45);
  border: 1px solid rgba(0, 180, 255, 0.35);
  border-radius: 50%;
  aspect-ratio: 1;
}

.ops-circle.green {
  border-color: rgba(105, 240, 174, 0.45);
}

.ops-circle strong {
  font-size: 18px;
  color: var(--cyan);
}

.ops-circle.green strong {
  color: #69f0ae;
}

.ops-circle small {
  font-size: 11px;
}

.ops-circle span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
}

.ops-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ops-mini {
  padding: 8px;
  text-align: center;
  background: rgba(0, 40, 90, 0.4);
  border: 1px solid rgba(0, 160, 220, 0.25);
}

.ops-mini strong {
  display: block;
  color: var(--cyan);
  font-size: 16px;
}

.ops-mini span {
  color: var(--muted);
  font-size: 11px;
}

.queue-panel {
  display: flex;
  flex-direction: column;
}

.queue-list {
  flex: 1;
  max-height: 420px;
  overflow: auto;
  padding-right: 4px;
}

.queue-item {
  margin-bottom: 8px;
  padding: 8px 10px;
  background: rgba(0, 36, 80, 0.55);
  border: 1px solid rgba(0, 160, 220, 0.22);
}

.queue-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.queue-head h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.tags {
  display: flex;
  gap: 4px;
}

.tag {
  padding: 1px 8px;
  font-size: 11px;
  border-radius: 10px;
}

.tag.run {
  color: #041428;
  background: #00d8ff;
}

.tag.strat {
  color: #ffecb3;
  background: rgba(255, 183, 77, 0.25);
  border: 1px solid rgba(255, 183, 77, 0.5);
}

.queue-item ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.queue-item li {
  display: flex;
  gap: 8px;
  color: #c5e4f7;
  font-size: 11px;
  line-height: 1.7;
}

.queue-item label {
  flex: 0 0 56px;
  color: var(--muted);
}

@media (max-width: 1280px) {
  .screen-body {
    grid-template-columns: 1fr;
  }

  .map-stage {
    height: 220px;
  }

  .queue-list {
    max-height: 280px;
  }
}
</style>
