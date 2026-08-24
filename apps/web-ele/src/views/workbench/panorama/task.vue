<script lang="ts" setup>
import { taskBoardStats, taskQueue } from '#/views/_shared/data/panorama';

defineOptions({ name: 'WorkbenchPanoramaTask' });
</script>

<template>
  <div class="board">
    <header>
      <h2>任务看板</h2>
      <p>汇总任务运行态、排队与完成情况，快速定位异常任务。</p>
    </header>

    <div class="kpi-row">
      <div v-for="s in taskBoardStats" :key="s.label" class="kpi">
        <strong :style="{ color: s.color }">{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <section class="panel">
      <h3>近期任务列表</h3>
      <table class="table">
        <thead>
          <tr>
            <th>任务名称</th>
            <th>状态</th>
            <th>策略</th>
            <th>应用</th>
            <th>计划启动</th>
            <th>数据中心</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in taskQueue" :key="i">
            <td>{{ t.name }}</td>
            <td>
              <span
                class="badge"
                :class="t.status === '运行中' ? 'ok' : t.status === '排队中' ? 'warn' : 'mute'"
              >
                {{ t.status }}
              </span>
            </td>
            <td>{{ t.strategy }}</td>
            <td>{{ t.app }}</td>
            <td>{{ t.planStart }}</td>
            <td>{{ t.dc }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style src="./board-shared.css"></style>
