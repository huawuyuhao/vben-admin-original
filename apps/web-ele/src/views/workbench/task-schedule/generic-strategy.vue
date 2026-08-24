<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import { strategyProfiles } from '#/views/_shared/data/task-schedule';

defineOptions({ name: 'TsGenericStrategy' });

const route = useRoute();

const profile = computed(() => {
  const kind = String(route.meta.scheduleKind || '');
  return (
    strategyProfiles[kind] || {
      desc: String(route.meta.title || ''),
      kpis: [],
      steps: [],
      rows: [],
      columns: [],
      footer: '',
    }
  );
});

const title = computed(() => String(route.meta.title || '调度策略'));
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ profile.desc }}</p>
      </div>
      <div class="head-actions">
        <span class="pill run">策略可用</span>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="k in profile.kpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
      </div>
    </div>

    <section class="card">
      <div class="card-title">策略执行流程</div>
      <ol class="steps">
        <li
          v-for="(s, i) in profile.steps"
          :key="s"
          :class="{ done: i < profile.steps.length - 1, current: i === profile.steps.length - 1 }"
        >
          <i>{{ i < profile.steps.length - 1 ? '✓' : i + 1 }}</i>
          <span>{{ s }}</span>
        </li>
      </ol>
    </section>

    <section class="card">
      <div class="card-title">
        方案结果
        <div class="right">
          <button class="btn" type="button" @click="ElMessage.success('已导出')">
            导出
          </button>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('已触发生成（示例）')"
          >
            生成方案
          </button>
        </div>
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

    <div class="footer ok">
      <div>
        <strong>评估结论</strong>
        <p>{{ profile.footer }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './shared.css';
</style>
