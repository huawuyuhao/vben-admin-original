<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type DemandConvertItem,
  demandConverts as seed,
} from '#/views/_shared/data/workbench-demand';

defineOptions({ name: 'WorkbenchDemandConvert' });

const rows = ref<DemandConvertItem[]>(seed.map((i) => ({ ...i })));
const selected = ref<string[]>([]);
const page = ref(1);
const pageSize = 6;
const showDrawer = ref(false);
const current = ref<DemandConvertItem | null>(null);

const query = reactive({
  demandId: '',
  workOrderId: '',
  queueStatus: '',
  autoOnly: false,
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.demandId.trim()) {
    list = list.filter((i) => i.demandId.includes(query.demandId.trim()));
  }
  if (query.workOrderId.trim()) {
    list = list.filter((i) => i.workOrderId.includes(query.workOrderId.trim()));
  }
  if (query.queueStatus) {
    list = list.filter((i) => i.queueStatus === query.queueStatus);
  }
  if (query.autoOnly) {
    list = list.filter((i) => i.auto);
  }
  return list;
});

const stats = computed(() => ({
  total: rows.value.length,
  queued: rows.value.filter((i) =>
    ['已入队', '排队中', '已下发'].includes(i.queueStatus),
  ).length,
  pending: rows.value.filter((i) => i.queueStatus === '待入队').length,
  auto: rows.value.filter((i) => i.auto).length,
}));

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function search() {
  page.value = 1;
  ElMessage.success('已查询（示例）');
}

function reset() {
  query.demandId = '';
  query.workOrderId = '';
  query.queueStatus = '';
  query.autoOnly = false;
  page.value = 1;
}

function openDetail(row: DemandConvertItem) {
  current.value = row;
  showDrawer.value = true;
}

function enqueue(row: DemandConvertItem) {
  if (row.queueStatus !== '待入队') {
    ElMessage.info('该工单已在队列中');
    return;
  }
  row.queueStatus = '已入队';
  ElMessage.success(`工单 ${row.workOrderId} 已转入算力任务队列`);
}

function batchEnqueue() {
  const targets = rows.value.filter(
    (r) => selected.value.includes(r.id) && r.queueStatus === '待入队',
  );
  if (targets.length === 0) {
    ElMessage.warning('请勾选待入队工单');
    return;
  }
  targets.forEach((r) => {
    r.queueStatus = '已入队';
  });
  ElMessage.success(`已批量入队 ${targets.length} 条`);
  selected.value = [];
}

function autoExtract() {
  ElMessage.success(
    '已对审批通过需求自动提取关键信息并生成标准化工单（示例）',
  );
}

function queueClass(s: string) {
  if (s === '已下发') return 'ok';
  if (s === '排队中' || s === '已入队') return 'info';
  return 'warn';
}

function toggle(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((x) => x !== id);
  } else {
    selected.value = [...selected.value, id];
  }
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>需求转任务</h2>
        <p>
          对审批通过的目标需求自动提取关键信息，生成标准化工单并流转至算力任务队列。
        </p>
      </div>
      <button class="btn primary" type="button" @click="autoExtract">
        自动提取并生成工单
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi">
        <strong>{{ stats.total }}</strong>
        <span>标准化工单</span>
      </div>
      <div class="kpi">
        <strong>{{ stats.auto }}</strong>
        <span>自动生成</span>
      </div>
      <div class="kpi">
        <strong>{{ stats.queued }}</strong>
        <span>已入队列</span>
      </div>
      <div class="kpi">
        <strong>{{ stats.pending }}</strong>
        <span>待入队</span>
      </div>
    </div>

    <div class="filter">
      <input
        v-model="query.demandId"
        type="text"
        placeholder="需求ID"
      />
      <input
        v-model="query.workOrderId"
        type="text"
        placeholder="工单号"
      />
      <select v-model="query.queueStatus">
        <option value="">队列状态</option>
        <option>待入队</option>
        <option>已入队</option>
        <option>排队中</option>
        <option>已下发</option>
      </select>
      <label class="check">
        <input v-model="query.autoOnly" type="checkbox" />
        仅看自动生成
      </label>
      <button class="btn primary" type="button" @click="search">查询</button>
      <button class="btn" type="button" @click="reset">重置</button>
      <button class="btn primary" type="button" @click="batchEnqueue">
        批量入队
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 40px" />
            <th>需求ID</th>
            <th>标准工单号</th>
            <th>委托方</th>
            <th>数据类型</th>
            <th>应用类型</th>
            <th>提取算力</th>
            <th>显存需求</th>
            <th>提取时间</th>
            <th>生成方式</th>
            <th>队列状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>
              <input
                type="checkbox"
                :checked="selected.includes(row.id)"
                @change="toggle(row.id)"
              />
            </td>
            <td class="link">{{ row.demandId }}</td>
            <td>{{ row.workOrderId }}</td>
            <td>{{ row.client }}</td>
            <td>{{ row.dataType }}</td>
            <td>{{ row.appType }}</td>
            <td>{{ row.gpuNeed }}</td>
            <td>{{ row.memNeed }}</td>
            <td>{{ row.extractAt }}</td>
            <td>
              <span class="tag" :class="row.auto ? 'auto' : 'manual'">
                {{ row.auto ? '自动' : '手动' }}
              </span>
            </td>
            <td>
              <span class="status" :class="queueClass(row.queueStatus)">
                {{ row.queueStatus }}
              </span>
            </td>
            <td class="ops">
              <button type="button" @click="openDetail(row)">详情</button>
              <button type="button" @click="enqueue(row)">入队</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <span>共 {{ filtered.length }} 条</span>
      <div class="pages">
        <button
          type="button"
          :disabled="page <= 1"
          @click="page = Math.max(1, page - 1)"
        >
          ‹
        </button>
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
          @click="page = Math.min(totalPages, page + 1)"
        >
          ›
        </button>
      </div>
    </div>

    <div v-if="showDrawer && current" class="drawer-mask" @click="showDrawer = false">
      <aside class="drawer" @click.stop>
        <header>
          <h3>工单详情</h3>
          <button type="button" @click="showDrawer = false">×</button>
        </header>
        <dl>
          <div><dt>需求ID</dt><dd>{{ current.demandId }}</dd></div>
          <div><dt>标准工单号</dt><dd>{{ current.workOrderId }}</dd></div>
          <div><dt>委托方</dt><dd>{{ current.client }}</dd></div>
          <div><dt>数据类型</dt><dd>{{ current.dataType }}</dd></div>
          <div><dt>应用类型</dt><dd>{{ current.appType }}</dd></div>
          <div><dt>算力需求</dt><dd>{{ current.gpuNeed }}</dd></div>
          <div><dt>显存需求</dt><dd>{{ current.memNeed }}</dd></div>
          <div><dt>提取时间</dt><dd>{{ current.extractAt }}</dd></div>
          <div>
            <dt>生成方式</dt>
            <dd>{{ current.auto ? '系统自动提取' : '人工确认' }}</dd>
          </div>
          <div><dt>队列状态</dt><dd>{{ current.queueStatus }}</dd></div>
        </dl>
        <p class="tip">
          系统从审批通过需求中提取委托方、数据类型、算力/显存等关键信息，生成标准化工单后自动或手动流转至算力任务队列。
        </p>
        <button
          class="btn primary block"
          type="button"
          @click="enqueue(current); showDrawer = false"
        >
          确认入队
        </button>
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
  margin: 0;
  max-width: 640px;
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
  margin-bottom: 4px;
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
  align-items: center;
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

.check {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.btn {
  height: 32px;
  padding: 0 14px;
  color: #606266;
  font-size: 13px;
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

.btn.block {
  width: 100%;
  margin-top: 12px;
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

.link {
  color: var(--primary);
}

.tag {
  padding: 1px 8px;
  font-size: 12px;
  border-radius: 10px;
}

.tag.auto {
  color: #409eff;
  background: #ecf5ff;
}

.tag.manual {
  color: #e6a23c;
  background: #fdf6ec;
}

.status.ok {
  color: #67c23a;
}

.status.info {
  color: #409eff;
}

.status.warn {
  color: #e6a23c;
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

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
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
  box-shadow: -8px 0 24px rgb(0 0 0 / 12%);
}

.drawer header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
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

.drawer dl {
  margin: 0;
}

.drawer dl > div {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
  font-size: 13px;
}

.drawer dt {
  color: #909399;
}

.drawer dd {
  margin: 0;
  color: #303133;
}

.tip {
  margin: 14px 0 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
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
