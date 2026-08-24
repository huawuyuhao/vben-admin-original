<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import { modelCards } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccModelCard' });

const route = useRoute();

const card = computed(() => {
  const kind = String(route.meta.eccKind || '');
  return (
    modelCards[kind] || {
      desc: '',
      version: '-',
      metric: '-',
      accuracy: '-',
      features: [],
      samples: [],
      columns: [],
    }
  );
});

const title = computed(() => String(route.meta.title || '预测模型'));
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ card.desc }}</p>
      </div>
      <div class="head-actions">
        <span class="pill run">{{ card.version }}</span>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已发起在线推理试算（示例）')"
        >
          在线试算
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>{{ card.accuracy }}</strong><span>准确率</span></div>
      <div class="kpi"><strong>{{ card.metric }}</strong><span>评估指标</span></div>
      <div class="kpi"><strong>{{ card.features.length }}</strong><span>特征数</span></div>
      <div class="kpi"><strong>{{ card.samples.length }}</strong><span>样例数</span></div>
    </div>

    <section class="card">
      <div class="card-title">模型特征</div>
      <div class="tags">
        <span v-for="f in card.features" :key="f" class="ok">{{ f }}</span>
      </div>
    </section>

    <section class="card">
      <div class="card-title">验证样本</div>
      <table>
        <thead>
          <tr>
            <th v-for="c in card.columns" :key="c">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in card.samples" :key="i">
            <td v-for="c in card.columns" :key="c">{{ row[c] }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';
</style>
