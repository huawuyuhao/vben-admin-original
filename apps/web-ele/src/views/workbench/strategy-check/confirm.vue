<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type ConfirmStatus,
  strategyConfirms as seed,
  type StrategyConfirmItem,
} from '#/views/_shared/data/workbench-strategy-check';

defineOptions({ name: 'WorkbenchStrategyConfirm' });

const rows = ref<StrategyConfirmItem[]>(seed.map((i) => ({ ...i, logs: [...i.logs] })));
const page = ref(1);
const pageSize = 5;
const current = ref<null | StrategyConfirmItem>(null);

const query = reactive({
  keyword: '',
  status: '' as '' | ConfirmStatus,
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.keyword.trim()) {
    const kw = query.keyword.trim();
    list = list.filter(
      (i) =>
        i.schemeName.includes(kw) ||
        i.conclusionId.includes(kw) ||
        i.analysisId.includes(kw),
    );
  }
  if (query.status) list = list.filter((i) => i.status === query.status);
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);
const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const pendingCount = computed(
  () => rows.value.filter((i) => i.status === '待确认').length,
);

function statusClass(s: ConfirmStatus) {
  if (s === '已通过') return 'ok';
  if (s === '已驳回') return 'danger';
  return 'warn';
}

function decide(row: StrategyConfirmItem, pass: boolean) {
  if (row.status !== '待确认') {
    ElMessage.info('该结论已处理');
    return;
  }
  row.status = pass ? '已通过' : '已驳回';
  row.reviewer = '当前用户';
  row.reviewedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  row.logs.push({
    time: row.reviewedAt,
    operator: row.reviewer,
    action: pass ? '确认通过' : '驳回',
    remark: pass ? '同意校核结论并反馈调度方案' : '结论不合理，退回优化',
  });
  ElMessage.success(pass ? '已确认通过' : '已驳回');
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>策略校核确认</h2>
        <p>
          对策略校核结论进行审核决策，结构化留存操作记录，形成可追溯闭环，为调度方案合理性与后续策略优化提供真实反馈。
        </p>
      </div>
      <div class="pending">待确认 {{ pendingCount }}</div>
    </header>

    <div class="filter">
      <input v-model="query.keyword" placeholder="方案/结论ID/分析ID" />
      <select v-model="query.status">
        <option value="">全部状态</option>
        <option>待确认</option>
        <option>已通过</option>
        <option>已驳回</option>
      </select>
      <button class="btn primary" type="button" @click="page = 1">查询</button>
      <button
        class="btn"
        type="button"
        @click="query.keyword = ''; query.status = ''; page = 1"
      >
        重置
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>结论ID</th>
            <th>策略方案</th>
            <th>关联分析</th>
            <th>校核结论</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>审核人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>{{ row.conclusionId }}</td>
            <td>{{ row.schemeName }}</td>
            <td>{{ row.analysisId }}</td>
            <td class="conclusion">{{ row.conclusion }}</td>
            <td>
              <span class="badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.submittedAt }}</td>
            <td>{{ row.reviewer }}</td>
            <td class="ops">
              <button type="button" @click="current = row">轨迹</button>
              <button
                type="button"
                :disabled="row.status !== '待确认'"
                @click="decide(row, true)"
              >
                通过
              </button>
              <button
                type="button"
                class="danger"
                :disabled="row.status !== '待确认'"
                @click="decide(row, false)"
              >
                驳回
              </button>
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
          <h3>操作轨迹 · {{ current.conclusionId }}</h3>
          <button type="button" @click="current = null">×</button>
        </header>
        <p class="conclusion-full">{{ current.conclusion }}</p>
        <ol class="timeline">
          <li v-for="(log, i) in current.logs" :key="i">
            <time>{{ log.time }}</time>
            <div>
              <strong>{{ log.action }}</strong>
              <span>{{ log.operator }}</span>
              <p>{{ log.remark || '—' }}</p>
            </div>
          </li>
        </ol>
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
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.head h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.head p {
  max-width: 740px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #909399;
}

.pending {
  padding: 8px 14px;
  font-weight: 600;
  color: #e6a23c;
  background: #fdf6ec;
  border-radius: 16px;
}

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
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
  font-size: 13px;
  border-collapse: collapse;
}

th,
td {
  padding: 11px 10px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

th {
  font-weight: 500;
  color: #909399;
  white-space: nowrap;
  background: #fafafa;
}

.conclusion {
  max-width: 280px;
  line-height: 1.45;
  color: #606266;
  white-space: normal;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
}

.badge.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.badge.warn {
  color: #e6a23c;
  background: #fdf6ec;
}

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.ops {
  display: flex;
  gap: 10px;
  white-space: nowrap;
}

.ops button {
  padding: 0;
  color: var(--primary);
  cursor: pointer;
  background: none;
  border: none;
}

.ops button:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.ops .danger {
  color: #f56c6c;
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
  width: min(420px, 92vw);
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
  font-size: 15px;
}

.drawer header button {
  font-size: 22px;
  cursor: pointer;
  background: none;
  border: none;
}

.conclusion-full {
  padding: 10px;
  margin: 12px 0;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  background: #f5f7fa;
  border-radius: 6px;
}

.timeline {
  padding: 0;
  margin: 0;
  list-style: none;
}

.timeline li {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 13px;
}

.timeline time {
  color: #909399;
}

.timeline strong {
  margin-right: 8px;
}

.timeline span {
  color: #909399;
}

.timeline p {
  margin: 4px 0 0;
  color: #606266;
}
</style>
