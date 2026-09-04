<script lang="ts" setup>
import { resourcePools } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaResource' });

const summary = [
  { label: '总算力池', value: '12' },
  { label: '可用 GPU', value: '8,420' },
  { label: '存储余量', value: '18.6 PB' },
  { label: '资源告警池', value: '2' },
];
</script>

<template>
  <div class="board">
    <header>
      <h2>资源看板</h2>
      <p>展示各算力池 CPU / GPU / 内存 / 存储占用，辅助资源扩缩与调度决策。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in summary" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <div class="grid cols-1">
      <section v-for="pool in resourcePools" :key="pool.name" class="panel">
        <h3>{{ pool.name }}</h3>
        <div class="bar-row">
          <span>CPU</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${pool.cpu}%` }"></div>
          </div>
          <span>{{ pool.cpu }}%</span>
        </div>
        <div class="bar-row">
          <span>GPU</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${pool.gpu}%` }"></div>
          </div>
          <span>{{ pool.gpu }}%</span>
        </div>
        <div class="bar-row">
          <span>内存</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${pool.mem}%` }"></div>
          </div>
          <span>{{ pool.mem }}%</span>
        </div>
        <div class="bar-row">
          <span>存储</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${pool.storage}%` }"></div>
          </div>
          <span>{{ pool.storage }}%</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style src="./board-shared.css"></style>

<style scoped>
.grid.cols-1 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 900px) {
  .grid.cols-1 {
    grid-template-columns: 1fr;
  }
}
</style>
