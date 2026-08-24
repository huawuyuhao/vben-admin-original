<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import { dispatchBoards } from '#/views/_shared/data/task-schedule';

defineOptions({ name: 'TsDispatchBoard' });

const route = useRoute();

const board = computed(() => {
  const mode = String(route.meta.dispatchMode || '');
  return (
    dispatchBoards[mode] || {
      desc: '',
      mode: '',
      stats: [],
      rows: [],
    }
  );
});

const title = computed(() => String(route.meta.title || '调度'));
const columns = computed(() =>
  board.value.rows[0] ? Object.keys(board.value.rows[0]) : [],
);
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ board.desc }}</p>
      </div>
      <div class="head-actions">
        <span class="pill run">{{ board.mode }}</span>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已创建计划（示例）')"
        >
          新建计划
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="s in board.stats" :key="s.label" class="kpi">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <section class="card">
      <div class="card-title">
        计划列表
        <div class="right">
          <button class="btn" type="button" @click="ElMessage.success('已导出')">
            导出
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th v-for="c in columns" :key="c">{{ c }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in board.rows" :key="i">
            <td v-for="c in columns" :key="c">{{ row[c] }}</td>
            <td>
              <button
                type="button"
                class="link"
                @click="ElMessage.info('查看详情（示例）')"
              >
                详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import './shared.css';

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}
</style>
