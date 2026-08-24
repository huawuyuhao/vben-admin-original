<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type ReassessResult,
  type SchemeReassess,
  schemeReassessList as seed,
} from '#/views/_shared/data/workbench-region';

defineOptions({ name: 'WorkbenchRegionReassess' });

const rows = ref<SchemeReassess[]>(seed.map((i) => ({ ...i })));
const page = ref(1);
const pageSize = 5;
const current = ref<SchemeReassess | null>(null);

const query = reactive({
  keyword: '',
  result: '' as '' | ReassessResult,
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.keyword.trim()) {
    const kw = query.keyword.trim();
    list = list.filter(
      (i) =>
        i.schemeName.includes(kw) ||
        i.schemeId.includes(kw) ||
        i.region.includes(kw),
    );
  }
  if (query.result) list = list.filter((i) => i.result === query.result);
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function delta(actual: number, expect: number) {
  const d = Number((actual - expect).toFixed(1));
  return d > 0 ? `+${d}` : `${d}`;
}

function resultClass(r: ReassessResult) {
  if (r === '优于预期') return 'ok';
  if (r === '符合预期') return 'info';
  if (r === '低于预期') return 'danger';
  return 'mute';
}

function triggerAssess() {
  ElMessage.success('已对已实施方案发起重新评估（示例）');
}

function search() {
  page.value = 1;
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>调度方案重新评估</h2>
        <p>
          对已实施调度方案进行再评估，对比执行效果与预期目标差距，为优化调整提供依据。
        </p>
      </div>
      <button class="btn primary" type="button" @click="triggerAssess">
        发起评估
      </button>
    </header>

    <div class="filter">
      <input
        v-model="query.keyword"
        type="text"
        placeholder="方案名称/编号/区域"
      />
      <select v-model="query.result">
        <option value="">全部结论</option>
        <option>优于预期</option>
        <option>符合预期</option>
        <option>低于预期</option>
        <option>待评估</option>
      </select>
      <button class="btn primary" type="button" @click="search">查询</button>
      <button
        class="btn"
        type="button"
        @click="query.keyword = ''; query.result = ''; page = 1"
      >
        重置
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>评估单号</th>
            <th>方案</th>
            <th>区域</th>
            <th>利用率 预期/实际</th>
            <th>绿电 预期/实际</th>
            <th>成本节约 预期/实际</th>
            <th>结论</th>
            <th>评估时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>{{ row.id }}</td>
            <td>
              <div class="name">{{ row.schemeName }}</div>
              <div class="sub">{{ row.schemeId }}</div>
            </td>
            <td>{{ row.region }}</td>
            <td>
              {{ row.expectUtil }}% /
              <b>{{ row.actualUtil }}%</b>
              <span class="delta">
                ({{ delta(row.actualUtil, row.expectUtil) }})
              </span>
            </td>
            <td>
              {{ row.expectGreen }}% /
              <b>{{ row.actualGreen }}%</b>
              <span class="delta">
                ({{ delta(row.actualGreen, row.expectGreen) }})
              </span>
            </td>
            <td>
              {{ row.expectCost }}% /
              <b>{{ row.actualCost }}%</b>
              <span class="delta">
                ({{ delta(row.actualCost, row.expectCost) }})
              </span>
            </td>
            <td>
              <span class="badge" :class="resultClass(row.result)">
                {{ row.result }}
              </span>
            </td>
            <td>{{ row.assessAt }}</td>
            <td class="ops">
              <button type="button" @click="current = row">差距分析</button>
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
          <h3>差距分析 · {{ current.schemeName }}</h3>
          <button type="button" @click="current = null">×</button>
        </header>
        <div class="compare">
          <div>
            <span>利用率偏差</span>
            <strong>{{ delta(current.actualUtil, current.expectUtil) }} pp</strong>
          </div>
          <div>
            <span>绿电偏差</span>
            <strong>{{ delta(current.actualGreen, current.expectGreen) }} pp</strong>
          </div>
          <div>
            <span>成本节约偏差</span>
            <strong>{{ delta(current.actualCost, current.expectCost) }} pp</strong>
          </div>
        </div>
        <h4>差距说明</h4>
        <p>{{ current.gapNote }}</p>
        <h4>优化建议</h4>
        <p>{{ current.suggest }}</p>
        <p class="meta">评估人：{{ current.assessor }} · {{ current.assessAt }}</p>
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
  max-width: 720px;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
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

.name {
  font-weight: 500;
}

.sub {
  color: #909399;
  font-size: 12px;
}

.delta {
  margin-left: 4px;
  color: #909399;
  font-size: 12px;
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

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.badge.mute {
  color: #909399;
  background: #f4f4f5;
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
  color: #606266;
  font-size: 13px;
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

.compare {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 14px 0;
}

.compare > div {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
}

.compare span {
  color: #909399;
}

.drawer h4 {
  margin: 12px 0 6px;
  font-size: 14px;
}

.drawer p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.meta {
  margin-top: 16px !important;
  color: #909399 !important;
  font-size: 12px !important;
}
</style>
