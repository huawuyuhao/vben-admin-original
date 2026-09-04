<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import { predictProfiles } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccPredict' });

const route = useRoute();
const running = ref(false);

const profile = computed(() => {
  const kind = String(route.meta.eccKind || '');
  return (
    predictProfiles[kind] || {
      desc: '',
      unit: '',
      formHints: [],
      kpis: [],
      rows: [],
      columns: [],
    }
  );
});

const title = computed(() => String(route.meta.title || '预测'));

async function run() {
  running.value = true;
  await new Promise((r) => setTimeout(r, 500));
  running.value = false;
  ElMessage.success('预测完成（示例）');
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ profile.desc }}</p>
      </div>
      <button class="btn primary" type="button" :disabled="running" @click="run">
        {{ running ? '预测中…' : '开始预测' }}
      </button>
    </header>

    <section class="card">
      <div class="card-title">输入参数</div>
      <div class="hint-grid">
        <label v-for="h in profile.formHints" :key="h">
          {{ h }}
          <input type="text" :placeholder="`请输入${h}`" />
        </label>
      </div>
    </section>

    <div class="kpi-row">
      <div v-for="k in profile.kpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
      </div>
    </div>

    <section class="card">
      <div class="card-title">
        预测结果列表
        <small>单位：{{ profile.unit }}</small>
      </div>
      <table>
        <thead>
          <tr>
            <th v-for="c in profile.columns" :key="c">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in profile.rows" :key="i">
            <td v-for="c in profile.columns" :key="c">{{ row[c] }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.hint-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hint-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.hint-grid input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

@media (max-width: 800px) {
  .hint-grid {
    grid-template-columns: 1fr;
  }
}
</style>
