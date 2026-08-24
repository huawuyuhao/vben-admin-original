<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  type ComputeDemand,
  type DemandStatus,
  computeDemandList,
  modelTypeOptions,
  statusOptions,
} from '#/views/_shared/data/compute-demands';

const router = useRouter();

const modelType = ref('全部');
const modelName = ref('');
const statusFilter = ref('全部');
const consigner = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const currentPage = ref(1);
const pageSize = 8;
const jumpPage = ref('');
const toast = ref('');
const modalOpen = ref(false);
const modalRow = ref<ComputeDemand | null>(null);

const filtered = computed(() => {
  let list = [...computeDemandList];
  if (modelType.value !== '全部') {
    list = list.filter((r) => r.dataType === modelType.value);
  }
  const nk = modelName.value.trim().toLowerCase();
  if (nk) list = list.filter((r) => r.modelName.toLowerCase().includes(nk));
  if (statusFilter.value !== '全部') {
    list = list.filter((r) => r.status === statusFilter.value);
  }
  const ck = consigner.value.trim().toLowerCase();
  if (ck) list = list.filter((r) => r.consigner.toLowerCase().includes(ck));
  if (dateFrom.value) {
    list = list.filter((r) => r.taskTime.slice(0, 10) >= dateFrom.value);
  }
  if (dateTo.value) {
    list = list.filter((r) => r.taskTime.slice(0, 10) <= dateTo.value);
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | '...'> = [1];
  const start = Math.max(2, cur - 2);
  const end = Math.min(total - 1, cur + 2);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
});

watch([modelType, modelName, statusFilter, consigner, dateFrom, dateTo], () => {
  currentPage.value = 1;
});

function tip(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function reset() {
  modelType.value = '全部';
  modelName.value = '';
  statusFilter.value = '全部';
  consigner.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

function goCreate() {
  router.push('/service/mydemand/compute/create');
}

function dtypeClass(t: string) {
  if (t === '目标检测') return 'blue';
  if (t === '图片分类') return 'green';
  if (t === '文本分类') return 'purple';
  return 'orange';
}

function statusClass(s: DemandStatus) {
  if (s === '进行中' || s === '审核中') return 'running';
  if (s === '已完成') return 'done';
  if (s === '待确认') return 'pending';
  return 'cancel';
}

function goPage(p: number | '...') {
  if (p === '...') return;
  currentPage.value = p;
}

function doJump() {
  const n = Number(jumpPage.value);
  if (!Number.isFinite(n) || n < 1 || n > totalPages.value) {
    tip(`请输入 1-${totalPages.value} 之间的页码`);
    return;
  }
  currentPage.value = n;
}

function openModal(row: ComputeDemand) {
  modalRow.value = row;
  modalOpen.value = true;
}
</script>

<template>
  <div class="portal-inner-page demand-list">
    <div class="crumb">我的需求 / 算力需求</div>

    <div class="filters">
      <select v-model="modelType">
        <option v-for="t in modelTypeOptions" :key="t" :value="t">
          {{ t === '全部' ? '请选择模型类型' : t }}
        </option>
      </select>
      <input v-model="modelName" type="text" placeholder="请输入模型名称" />
      <select v-model="statusFilter">
        <option v-for="s in statusOptions" :key="s" :value="s">
          {{ s === '全部' ? '请选择任务状态' : s }}
        </option>
      </select>
      <input v-model="consigner" type="text" placeholder="请输入委托者" />
      <div class="dates">
        <input v-model="dateFrom" type="date" />
        <span>至</span>
        <input v-model="dateTo" type="date" />
      </div>
      <button class="primary" type="button" @click="tip('已查询')">查询</button>
      <button type="button" @click="reset">重置</button>
      <div class="grow" />
      <button class="primary" type="button" @click="goCreate">新增</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>需求ID</th>
            <th>应用模型</th>
            <th>数据集名称</th>
            <th>数据类型</th>
            <th>文件数量</th>
            <th>委托者</th>
            <th>任务时间</th>
            <th>任务状态</th>
            <th>任务进度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paged.length === 0">
            <td colspan="10" class="empty">暂无匹配需求</td>
          </tr>
          <tr v-for="row in paged" :key="row.id">
            <td class="mono">{{ row.demandId }}</td>
            <td>{{ row.modelName }}</td>
            <td>{{ row.datasetName }}</td>
            <td>
              <span class="tag" :class="dtypeClass(row.dataType)">
                {{ row.dataType }}
              </span>
            </td>
            <td>{{ row.fileCount }}</td>
            <td>{{ row.consigner }}</td>
            <td>{{ row.taskTime }}</td>
            <td>
              <span class="st" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.progressDone }}/{{ row.progressTotal }}</td>
            <td class="ops">
              <template v-if="row.status === '进行中' || row.status === '审核中'">
                <button type="button" @click="tip(`已关闭：${row.demandId}`)">
                  关闭任务
                </button>
                <button type="button" @click="openModal(row)">详情</button>
              </template>
              <template v-else>
                <button type="button" @click="openModal(row)">详情</button>
                <button type="button" @click="tip(`重新训练：${row.modelName}`)">
                  重新训练
                </button>
                <button type="button" @click="tip(`已复制：${row.demandId}`)">
                  复制
                </button>
                <button type="button" @click="tip(`下载：${row.datasetName}`)">
                  下载
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filtered.length > 0" class="pager">
      <span>共 {{ filtered.length }} 条</span>
      <div class="pages">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          ‹
        </button>
        <button
          v-for="(p, i) in pageNumbers"
          :key="`${p}-${i}`"
          type="button"
          :class="{ on: p === currentPage, dots: p === '...' }"
          :disabled="p === '...'"
          @click="goPage(p)"
        >
          {{ p }}
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          ›
        </button>
      </div>
      <div class="jump">
        前往
        <input v-model="jumpPage" @keyup.enter="doJump" />
        页
      </div>
    </div>

    <div v-if="modalOpen" class="mask" @click.self="modalOpen = false">
      <div class="modal">
        <div class="m-head">
          <h3>资源使用情况</h3>
          <button type="button" @click="modalOpen = false">×</button>
        </div>
        <p class="m-sub">
          {{ modalRow?.demandId }} · {{ modalRow?.modelName }}
        </p>
        <div class="charts">
          <div class="chart">
            <div class="ct">平均CPU使用率</div>
            <div class="line cpu" />
          </div>
          <div class="chart">
            <div class="ct">平均内存使用率</div>
            <div class="line mem" />
          </div>
          <div class="chart">
            <div class="ct">平均GPU使用率</div>
            <div class="line gpu" />
          </div>
          <div class="chart">
            <div class="ct">平均显存使用率</div>
            <div class="line vram" />
          </div>
        </div>
        <div class="m-foot">
          <button type="button" @click="modalOpen = false">取消</button>
          <button class="primary" type="button" @click="modalOpen = false">
            确定
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.crumb {
  margin-bottom: 12px;
  font-size: 13px;
  color: #9e9e9e;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.filters select,
.filters input {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.dates {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #9e9e9e;
}

.grow {
  flex: 1;
}

button {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  color: #616161;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

button.primary {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.table-wrap {
  overflow: auto;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
}

table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 10px;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 600;
  color: #616161;
  background: #fafafa;
}

.mono {
  font-family: Consolas, monospace;
  font-size: 12px;
  color: #616161;
}

.empty {
  padding: 40px !important;
  color: #9e9e9e;
  text-align: center;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.tag.blue {
  color: #1565c0;
  background: #e3f2fd;
}

.tag.green {
  color: #2e7d32;
  background: #e8f5e9;
}

.tag.purple {
  color: #6a1b9a;
  background: #f3e5f5;
}

.tag.orange {
  color: #ef6c00;
  background: #fff3e0;
}

.st {
  font-weight: 600;
}

.st.running {
  color: #1976d2;
}

.st.done {
  color: #2e7d32;
}

.st.pending {
  color: #f9a825;
}

.st.cancel {
  color: #9e9e9e;
}

.ops button {
  height: auto;
  margin-right: 8px;
  padding: 0;
  color: #409eff;
  background: none;
  border: none;
}

.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 14px;
  font-size: 13px;
  color: #757575;
}

.pages {
  display: flex;
  gap: 4px;
}

.pages button {
  min-width: 30px;
  padding: 0 6px;
}

.pages button.on {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.pages button:disabled {
  opacity: 0.45;
}

.pages button.dots {
  border: none;
  background: transparent;
}

.jump {
  display: flex;
  gap: 6px;
  align-items: center;
}

.jump input {
  width: 44px;
  height: 28px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(860px, 94vw);
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
}

.m-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.m-head h3 {
  margin: 0;
  font-size: 16px;
}

.m-head button {
  height: auto;
  padding: 0;
  font-size: 22px;
  color: #9e9e9e;
  background: none;
  border: none;
}

.m-sub {
  margin: 6px 0 14px;
  font-size: 13px;
  color: #9e9e9e;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chart {
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
}

.ct {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #616161;
}

.line {
  height: 110px;
  border-radius: 6px;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 18px,
    rgb(0 0 0 / 4%) 18px,
    rgb(0 0 0 / 4%) 19px
  );
  position: relative;
  overflow: hidden;
}

.line::after {
  position: absolute;
  inset: 18% 8% 16% 8%;
  content: '';
  opacity: 0.9;
}

.line.cpu::after {
  background: #ff9800;
  clip-path: polygon(
    0 70%,
    20% 50%,
    40% 60%,
    55% 30%,
    70% 45%,
    85% 25%,
    100% 35%,
    100% 100%,
    0 100%
  );
}

.line.mem::after {
  background: #66bb6a;
  clip-path: polygon(
    0 80%,
    30% 78%,
    60% 76%,
    100% 75%,
    100% 100%,
    0 100%
  );
}

.line.gpu::after {
  background: #42a5f5;
  clip-path: polygon(
    0 40%,
    15% 15%,
    30% 55%,
    45% 10%,
    60% 50%,
    75% 8%,
    90% 40%,
    100% 20%,
    100% 100%,
    0 100%
  );
}

.line.vram::after {
  background: #ab47bc;
  clip-path: polygon(
    0 70%,
    40% 68%,
    55% 55%,
    100% 52%,
    100% 100%,
    0 100%
  );
}

.m-foot {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 4000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
