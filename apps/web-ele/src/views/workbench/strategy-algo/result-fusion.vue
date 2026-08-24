<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { ElMessage } from 'element-plus';

import {
  fusionModels,
  fusionResults,
} from '#/views/_shared/data/strategy-algo';

defineOptions({ name: 'StrategyResultFusion' });

const barRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(barRef);

const totalWeight = computed(() =>
  fusionModels.reduce((s, m) => s + m.weight, 0),
);

onMounted(() => {
  renderEcharts({
    color: ['#409eff', '#67c23a'],
    grid: { bottom: 28, containLabel: true, left: 48, right: 16, top: 36 },
    legend: { data: ['单模型', '融合结果'] },
    series: [
      {
        barMaxWidth: 28,
        data: [86.4, 920, 334],
        name: '单模型',
        type: 'bar',
      },
      {
        barMaxWidth: 28,
        data: [84.8, 948, 318],
        name: '融合结果',
        type: 'bar',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      data: ['算力预测', '吞吐预测', '电量预测'],
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
        <h2>模型结果融合</h2>
        <p>
          对多源预测模型结果按权重融合，输出统一策略校核输入并评估融合置信度。
        </p>
      </div>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('融合计算完成（示例）')"
      >
        执行融合
      </button>
    </header>

    <div class="grid">
      <section class="card">
        <div class="card-title">
          融合权重配置
          <small>总权重 {{ totalWeight }}%</small>
        </div>
        <div v-for="m in fusionModels" :key="m.name" class="weight-row">
          <div class="weight-head">
            <span>{{ m.name }}</span>
            <span class="badge" :class="m.status === '在线' ? 'run' : 'mute'">
              {{ m.status }}
            </span>
          </div>
          <div class="weight-bar">
            <i :style="{ width: `${m.weight}%` }" />
            <em>{{ m.weight }}%</em>
          </div>
          <div class="score">模型得分 {{ m.score }}</div>
        </div>
      </section>

      <section class="card">
        <div class="card-title">融合效果对比</div>
        <EchartsUI ref="barRef" height="260px" />
      </section>
    </div>

    <section class="card">
      <div class="card-title">任务融合结果</div>
      <table>
        <thead>
          <tr>
            <th>任务</th>
            <th>单模型结果</th>
            <th>融合结果</th>
            <th>变化</th>
            <th>置信度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in fusionResults" :key="r.task">
            <td>{{ r.task }}</td>
            <td>{{ r.single }}</td>
            <td class="em">{{ r.fused }}</td>
            <td :class="r.delta.startsWith('+') ? 'up' : 'down'">{{ r.delta }}</td>
            <td>{{ r.confidence }}</td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`明细 ${r.task}`)">
                明细
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.weight-row {
  margin-bottom: 14px;
}

.weight-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.weight-bar {
  position: relative;
  height: 10px;
  background: #ebeef5;
  border-radius: 5px;
}

.weight-bar i {
  display: block;
  height: 100%;
  background: #409eff;
  border-radius: 5px;
}

.weight-bar em {
  position: absolute;
  top: -18px;
  right: 0;
  font-size: 12px;
  font-style: normal;
  color: #606266;
}

.score {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.em {
  font-weight: 600;
  color: #409eff;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
