<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type StrategyAnalysisItem,
  strategyAnalyses as seed,
} from '#/views/_shared/data/workbench-strategy-check';

defineOptions({ name: 'WorkbenchStrategyAnalysis' });

const rows = ref<StrategyAnalysisItem[]>(seed.map((i) => ({ ...i })));
const page = ref(1);
const pageSize = 5;
const current = ref<StrategyAnalysisItem | null>(null);

const query = reactive({
  keyword: '',
  feasibility: '',
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.keyword.trim()) {
    const kw = query.keyword.trim();
    list = list.filter(
      (i) =>
        i.taskName.includes(kw) ||
        i.schemeName.includes(kw) ||
        i.id.includes(kw),
    );
  }
  if (query.feasibility) {
    list = list.filter((i) => i.feasibility === query.feasibility);
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);
const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const stats = computed(() => ({
  total: rows.value.length,
  high: rows.value.filter((i) => i.feasibility === '高').length,
  mid: rows.value.filter((i) => i.feasibility === '中').length,
  low: rows.value.filter((i) => i.feasibility === '低').length,
}));

function feasibilityClass(v: string) {
  if (v === '高') return 'ok';
  if (v === '中') return 'warn';
  return 'danger';
}

function matchClass(v: string) {
  if (v === '优') return 'ok';
  if (v === '良') return 'info';
  if (v === '一般') return 'warn';
  return 'danger';
}

function runAnalysis() {
  ElMessage.success('已触发大模型+策略模型联合校核分析（示例）');
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>策略校核分析</h2>
        <p>
          对算力任务与策略方案进行结构化解析，结合大模型分析与策略推理，输出可行性评估、资源匹配、潜在风险与优化建议。
        </p>
      </div>
      <button class="btn primary" type="button" @click="runAnalysis">
        发起分析
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>{{ stats.total }}</strong><span>分析报告</span></div>
      <div class="kpi"><strong>{{ stats.high }}</strong><span>可行性高</span></div>
      <div class="kpi"><strong>{{ stats.mid }}</strong><span>可行性中</span></div>
      <div class="kpi"><strong>{{ stats.low }}</strong><span>可行性低</span></div>
    </div>

    <div class="filter">
      <input v-model="query.keyword" placeholder="任务/方案/分析ID" />
      <select v-model="query.feasibility">
        <option value="">全部可行性</option>
        <option>高</option>
        <option>中</option>
        <option>低</option>
      </select>
      <button class="btn primary" type="button" @click="page = 1">查询</button>
      <button
        class="btn"
        type="button"
        @click="query.keyword = ''; query.feasibility = ''; page = 1"
      >
        重置
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>分析ID</th>
            <th>算力任务</th>
            <th>策略方案</th>
            <th>区域</th>
            <th>可行性</th>
            <th>资源匹配</th>
            <th>风险数</th>
            <th>综合分</th>
            <th>分析时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.taskName }}</td>
            <td>{{ row.schemeName }}</td>
            <td>{{ row.region }}</td>
            <td>
              <span class="badge" :class="feasibilityClass(row.feasibility)">
                {{ row.feasibility }}
              </span>
            </td>
            <td>
              <span class="badge" :class="matchClass(row.matchLevel)">
                {{ row.matchLevel }}
              </span>
            </td>
            <td>{{ row.riskCount }}</td>
            <td>{{ row.score }}</td>
            <td>{{ row.analyzedAt }}</td>
            <td class="ops">
              <button type="button" @click="current = row">查看报告</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <span>共 {{ filtered.length }} 条</span>
      <div class="pages">
        <button type="button" :disabled="page <= 1" @click="page--">‹</button>
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          :class="{ on: p === page }"
          @click="page = p"
        >
          {{ p }}
        </button>
        <button
          type="button"
          :disabled="page >= totalPages"
          @click="page++"
        >
          ›
        </button>
      </div>
    </div>

    <div v-if="current" class="mask" @click="current = null">
      <aside class="drawer" @click.stop>
        <header>
          <h3>校核分析报告</h3>
          <button type="button" @click="current = null">×</button>
        </header>
        <p class="summary">{{ current.summary }}</p>
        <div class="cards">
          <div>
            <span>可行性</span>
            <strong>{{ current.feasibility }}</strong>
          </div>
          <div>
            <span>资源匹配</span>
            <strong>{{ current.matchLevel }}</strong>
          </div>
          <div>
            <span>综合分</span>
            <strong>{{ current.score }}</strong>
          </div>
        </div>
        <h4>潜在风险</h4>
        <ul>
          <li v-for="(r, i) in current.risks" :key="i">{{ r }}</li>
        </ul>
        <h4>优化建议</h4>
        <ul>
          <li v-for="(s, i) in current.suggestions" :key="i">{{ s }}</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  --primary: #409eff;
  padding-bottom: 24px;
}
.head {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}
.head h2 {
  margin: 0 0 6px;
  font-size: 20px;
}
.head p {
  margin: 0;
  max-width: 740px;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
.kpi {
  padding: 14px;
  text-align: center;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.kpi strong {
  display: block;
  color: var(--primary);
  font-size: 24px;
}
.kpi span {
  color: #909399;
  font-size: 12px;
}
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.btn {
  height: 32px;
  padding: 0 14px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.btn.primary {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}
.table-wrap {
  overflow: auto;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  padding: 11px 10px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}
th {
  color: #909399;
  font-weight: 500;
  background: #fafafa;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}
.badge.ok {
  color: #67c23a;
  background: #f0f9eb;
}
.badge.info {
  color: #409eff;
  background: #ecf5ff;
}
.badge.warn {
  color: #e6a23c;
  background: #fdf6ec;
}
.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}
.ops button {
  padding: 0;
  color: var(--primary);
  cursor: pointer;
  background: none;
  border: none;
}
.pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 14px;
  font-size: 13px;
  color: #606266;
}
.pages {
  display: flex;
  gap: 4px;
}
.pages button {
  min-width: 30px;
  height: 30px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.pages button.on {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}
.mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgb(0 0 0 / 35%);
}
.drawer {
  position: absolute;
  top: 0;
  right: 0;
  width: min(440px, 92vw);
  height: 100%;
  padding: 16px 18px;
  overflow: auto;
  background: #fff;
}
.drawer header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer header h3 {
  margin: 0;
}
.drawer header button {
  font-size: 22px;
  cursor: pointer;
  background: none;
  border: none;
}
.summary {
  margin: 12px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.cards > div {
  padding: 10px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 6px;
}
.cards span {
  display: block;
  color: #909399;
  font-size: 12px;
}
.cards strong {
  color: var(--primary);
  font-size: 18px;
}
.drawer h4 {
  margin: 12px 0 6px;
  font-size: 14px;
}
.drawer ul {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: 1fr 1fr;
  }
  .head {
    flex-direction: column;
  }
}
</style>
