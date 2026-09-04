<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type RegionScheme,
  type SchemeStatus,
  regionSchemes as seed,
} from '#/views/_shared/data/workbench-region';

defineOptions({ name: 'WorkbenchRegionScheme' });

const rows = ref<RegionScheme[]>(seed.map((i) => ({ ...i })));
const page = ref(1);
const pageSize = 5;
const current = ref<null | RegionScheme>(null);

const query = reactive({
  keyword: '',
  region: '',
  status: '' as '' | SchemeStatus,
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.keyword.trim()) {
    const kw = query.keyword.trim();
    list = list.filter(
      (i) => i.name.includes(kw) || i.id.includes(kw) || i.strategy.includes(kw),
    );
  }
  if (query.region) list = list.filter((i) => i.region.includes(query.region));
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

const stats = computed(() => ({
  total: rows.value.length,
  running: rows.value.filter((i) => i.status === '执行中').length,
  ready: rows.value.filter((i) => i.status === '已生成').length,
  done: rows.value.filter((i) => i.status === '已完成').length,
}));

function search() {
  page.value = 1;
  ElMessage.success('已查询（示例）');
}

function reset() {
  query.keyword = '';
  query.region = '';
  query.status = '';
  page.value = 1;
}

function generate() {
  ElMessage.success('已按约束求解生成新调度方案草稿（示例）');
}

function publish(row: RegionScheme) {
  if (row.status === '草稿' || row.status === '已生成') {
    row.status = '执行中';
    row.executeAt = '2026-03-12 18:00';
    ElMessage.success(`${row.name} 已下发执行`);
    return;
  }
  ElMessage.info('当前状态不可下发');
}

function statusClass(s: SchemeStatus) {
  if (s === '执行中') return 'run';
  if (s === '已完成') return 'ok';
  if (s === '已生成') return 'info';
  if (s === '已终止') return 'danger';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>区域调度方案</h2>
        <p>
          聚焦区域算力调度方案管理：覆盖生成逻辑、执行流程与再评估机制，保障方案科学性与可行性。
        </p>
      </div>
      <button class="btn primary" type="button" @click="generate">
        生成方案
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>{{ stats.total }}</strong><span>方案总数</span></div>
      <div class="kpi"><strong>{{ stats.running }}</strong><span>执行中</span></div>
      <div class="kpi"><strong>{{ stats.ready }}</strong><span>待执行</span></div>
      <div class="kpi"><strong>{{ stats.done }}</strong><span>已完成</span></div>
    </div>

    <div class="filter">
      <input v-model="query.keyword" type="text" placeholder="方案名称/编号/策略" />
      <input v-model="query.region" type="text" placeholder="区域" />
      <select v-model="query.status">
        <option value="">全部状态</option>
        <option>草稿</option>
        <option>已生成</option>
        <option>执行中</option>
        <option>已完成</option>
        <option>已终止</option>
      </select>
      <button class="btn primary" type="button" @click="search">查询</button>
      <button class="btn" type="button" @click="reset">重置</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>方案编号</th>
            <th>方案名称</th>
            <th>区域</th>
            <th>策略</th>
            <th>状态</th>
            <th>目标利用率</th>
            <th>绿电占比</th>
            <th>成本节约%</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.region }}</td>
            <td>{{ row.strategy }}</td>
            <td>
              <span class="badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.targetUtil }}%</td>
            <td>{{ row.greenRatio }}%</td>
            <td>{{ row.costSave }}%</td>
            <td>{{ row.createdAt }}</td>
            <td class="ops">
              <button type="button" @click="current = row">详情</button>
              <button type="button" @click="publish(row)">下发</button>
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
          <h3>{{ current.name }}</h3>
          <button type="button" @click="current = null">×</button>
        </header>
        <dl>
          <div><dt>方案编号</dt><dd>{{ current.id }}</dd></div>
          <div><dt>区域</dt><dd>{{ current.region }}</dd></div>
          <div><dt>策略</dt><dd>{{ current.strategy }}</dd></div>
          <div><dt>负责人</dt><dd>{{ current.owner }}</dd></div>
          <div><dt>执行时间</dt><dd>{{ current.executeAt }}</dd></div>
        </dl>
        <h4>生成逻辑</h4>
        <p>{{ current.logic }}</p>
        <h4>执行流程</h4>
        <ol class="flow">
          <li v-for="(step, i) in current.flow" :key="i">{{ step }}</li>
        </ol>
        <p class="tip">
          方案执行后可进入「调度方案重新评估」对比预期与实际差距，并在「调度方案评价」沉淀指标得分。
        </p>
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
  max-width: 720px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #909399;
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
  font-size: 24px;
  color: var(--primary);
}

.kpi span {
  font-size: 12px;
  color: #909399;
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
  white-space: nowrap;
  border-bottom: 1px solid #ebeef5;
}

th {
  font-weight: 500;
  color: #909399;
  background: #fafafa;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.badge.run {
  color: #409eff;
  background: #ecf5ff;
}

.badge.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.badge.info {
  color: #e6a23c;
  background: #fdf6ec;
}

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.badge.mute {
  color: #909399;
  background: #f4f4f5;
}

.ops {
  display: flex;
  gap: 10px;
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
  font-size: 16px;
}

.drawer header button {
  font-size: 22px;
  cursor: pointer;
  background: none;
  border: none;
}

.drawer dl {
  margin: 12px 0;
}

.drawer dl > div {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #f0f2f5;
}

.drawer dt {
  color: #909399;
}

.drawer dd {
  margin: 0;
}

.drawer h4 {
  margin: 14px 0 8px;
  font-size: 14px;
}

.drawer p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.flow {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
}

.tip {
  margin-top: 16px !important;
  font-size: 12px !important;
  color: #909399 !important;
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
