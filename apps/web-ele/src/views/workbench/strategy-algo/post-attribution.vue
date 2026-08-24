<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  attributionEvents,
  attributionFactors,
} from '#/views/_shared/data/strategy-algo';

defineOptions({ name: 'StrategyPostAttribution' });

const pieRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(pieRef);
const selectedId = ref(attributionEvents[0]?.id || '');

const selected = () =>
  attributionEvents.find((e) => e.id === selectedId.value) || attributionEvents[0];

onMounted(() => {
  renderEcharts({
    color: attributionFactors.map((f) => f.color),
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        data: attributionFactors.map((f) => ({
          name: f.factor,
          value: f.weight,
        })),
        label: { formatter: '{b}\n{d}%' },
        radius: ['42%', '68%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  });
});
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>事后归因算法</h2>
        <p>
          对策略校核失败、调度异常等事件进行根因归因，输出置信度与可复用经验条目。
        </p>
      </div>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('已启动归因分析（示例）')"
      >
        新建归因分析
      </button>
    </header>

    <div class="grid">
      <section class="card">
        <div class="card-title">归因事件列表</div>
        <article
          v-for="e in attributionEvents"
          :key="e.id"
          class="event-item"
          :class="{ active: selectedId === e.id }"
          @click="selectedId = e.id"
        >
          <div class="event-top">
            <strong>{{ e.name }}</strong>
            <span class="badge" :class="e.status === '已归因' ? 'ok' : 'run'">
              {{ e.status }}
            </span>
          </div>
          <div class="event-meta">
            <span>{{ e.id }}</span>
            <span>{{ e.time }}</span>
            <span>影响：{{ e.impact }}</span>
          </div>
        </article>
      </section>

      <section class="card" v-if="selected()">
        <div class="card-title">归因结果 · {{ selected()?.name }}</div>
        <dl class="kv">
          <div><dt>事件 ID</dt><dd>{{ selected()?.id }}</dd></div>
          <div><dt>发生时间</dt><dd>{{ selected()?.time }}</dd></div>
          <div><dt>根因结论</dt><dd class="em">{{ selected()?.root }}</dd></div>
          <div><dt>置信度</dt><dd>{{ selected()?.confidence }}</dd></div>
        </dl>
        <div class="card-title sub">归因因子权重</div>
        <EchartsUI ref="pieRef" height="260px" />
        <div class="actions">
          <button class="btn" type="button" @click="ElMessage.info('导出归因报告')">
            导出报告
          </button>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('已写入知识库（示例）')"
          >
            写入知识库
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
}

.event-item {
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.event-item.active,
.event-item:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.event-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #909399;
  font-size: 12px;
}

.kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-bottom: 12px;
}

.kv div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kv dt {
  color: #909399;
  font-size: 12px;
}

.kv dd {
  margin: 0;
  color: #303133;
  font-size: 14px;
}

.kv .em {
  color: #409eff;
  font-weight: 600;
}

.card-title.sub {
  margin-top: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
