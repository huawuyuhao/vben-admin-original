<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  type SupplyStatus,
  supplyBatches,
} from '#/views/_shared/data/enterprise';

const activeTab = ref<'list' | 'progress'>('list');
const dataCenter = ref('all');
const statusFilter = ref('all');
const dateFrom = ref('');
const dateTo = ref('');
const keyword = ref('');
const currentPage = ref(1);
const pageSize = 4;
const selected = ref<string[]>([]);
const toast = ref('');

const dataCenters = [
  '华东-上海数据中心',
  '华南-广州数据中心',
  '西南-贵阳数据中心',
  '华北-北京数据中心',
];

const filtered = computed(() => {
  let list = [...supplyBatches];
  if (dataCenter.value !== 'all') {
    list = list.filter((r) => r.dataCenter === dataCenter.value);
  }
  if (statusFilter.value !== 'all') {
    list = list.filter((r) => r.status === statusFilter.value);
  }
  if (dateFrom.value) {
    list = list.filter((r) => r.planDate >= dateFrom.value);
  }
  if (dateTo.value) {
    list = list.filter((r) => r.planDate <= dateTo.value);
  }
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(key) ||
        r.code.toLowerCase().includes(key) ||
        r.deviceType.includes(key),
    );
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

const allChecked = computed({
  get: () =>
    paged.value.length > 0 &&
    paged.value.every((r) => selected.value.includes(r.id)),
  set: (val: boolean) => {
    const ids = paged.value.map((r) => r.id);
    if (val) {
      selected.value = [...new Set([...selected.value, ...ids])];
    } else {
      selected.value = selected.value.filter((id) => !ids.includes(id));
    }
  },
});

watch([dataCenter, statusFilter, dateFrom, dateTo, keyword, activeTab], () => {
  currentPage.value = 1;
});

function statusClass(s: SupplyStatus) {
  if (s === '已确认') return 'portal-badge-success';
  if (s === '审核中') return 'portal-badge-info';
  if (s === '待审核') return 'portal-badge-warning';
  return 'portal-badge-gray';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function toggleRow(id: string) {
  const i = selected.value.indexOf(id);
  if (i >= 0) selected.value.splice(i, 1);
  else selected.value.push(id);
}
</script>

<template>
  <div class="portal-inner-page enterprise-supply-page">
    <div class="portal-page-title">
      <h2>我的算力供给</h2>
      <p>在线提交可接入系统的服务器、GPU 等设备清单，跟踪受理与进场进度。</p>
    </div>

    <div class="toolbar-row">
      <div class="portal-tabs">
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          供给设备清单
        </div>
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'progress' }"
          @click="activeTab = 'progress'"
        >
          清单受理进度
        </div>
      </div>
      <div class="toolbar-actions">
        <button
          class="portal-btn portal-btn-outline portal-btn-sm"
          type="button"
          @click="showToast('打开导入弹窗（示例）')"
        >
          导入
        </button>
        <button
          class="portal-btn portal-btn-primary portal-btn-sm"
          type="button"
          @click="showToast('打开新增设备表单（示例）')"
        >
          + 新增设备
        </button>
      </div>
    </div>

    <div class="portal-filter-bar">
      <select v-model="dataCenter">
        <option value="all">数据中心</option>
        <option v-for="dc in dataCenters" :key="dc" :value="dc">{{ dc }}</option>
      </select>
      <select v-model="statusFilter">
        <option value="all">状态</option>
        <option value="已确认">已确认</option>
        <option value="审核中">审核中</option>
        <option value="待审核">待审核</option>
        <option value="已取消">已取消</option>
      </select>
      <div class="date-range">
        <span class="date-label">计划进场时间</span>
        <input v-model="dateFrom" type="date" />
        <span class="date-sep">至</span>
        <input v-model="dateTo" type="date" />
      </div>
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="搜索" />
      </div>
      <button class="portal-btn portal-btn-primary portal-btn-sm" type="button">
        查询
      </button>
    </div>

    <template v-if="activeTab === 'list'">
      <div class="portal-card table-wrap">
        <table class="portal-data-table">
          <thead>
            <tr>
              <th class="col-check">
                <input v-model="allChecked" type="checkbox" />
              </th>
              <th>清单名称</th>
              <th>编号</th>
              <th>数据中心</th>
              <th>设备类型</th>
              <th>设备数量</th>
              <th>总算力 (H/s)</th>
              <th>计划进场时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paged" :key="row.id">
              <td class="col-check">
                <input
                  type="checkbox"
                  :checked="selected.includes(row.id)"
                  @change="toggleRow(row.id)"
                />
              </td>
              <td>{{ row.name }}</td>
              <td class="portal-col-id">{{ row.code }}</td>
              <td>{{ row.dataCenter }}</td>
              <td>{{ row.deviceType }}</td>
              <td>{{ row.quantity }}</td>
              <td>{{ row.totalCompute }}</td>
              <td>{{ row.planDate }}</td>
              <td>
                <span class="portal-badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td class="col-actions">
                <button
                  class="icon-btn"
                  type="button"
                  title="查看"
                  @click="showToast(`查看：${row.name}`)"
                >
                  👁
                </button>
                <button
                  class="icon-btn"
                  type="button"
                  title="编辑"
                  @click="showToast(`编辑：${row.name}`)"
                >
                  ✎
                </button>
                <button
                  class="icon-btn danger"
                  type="button"
                  title="删除"
                  @click="showToast(`删除：${row.name}`)"
                >
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="portal-pagination">
        <span class="portal-page-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到
          {{ Math.min(currentPage * pageSize, filtered.length) }} 条，共
          {{ filtered.length }} 条记录
        </span>
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          :class="{ active: p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >
          ›
        </button>
      </div>
    </template>

    <div v-else class="portal-card progress-panel">
      <p class="progress-tip">清单受理进度（示例）</p>
      <ul class="progress-list">
        <li v-for="row in filtered" :key="row.id">
          <div class="progress-main">
            <strong>{{ row.name }}</strong>
            <span class="portal-badge" :class="statusClass(row.status)">
              {{ row.status }}
            </span>
          </div>
          <div class="progress-meta">
            {{ row.code }} · {{ row.dataCenter }} · 计划 {{ row.planDate }}
          </div>
        </li>
      </ul>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toolbar-row :deep(.portal-tabs) {
  margin-bottom: 0;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-range {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.date-label {
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
  white-space: nowrap;
}

.date-sep {
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.date-range input[type='date'] {
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  border: 1px solid var(--portal-gray-300, #e0e0e0);
  border-radius: 8px;
  background: #fff;
}

.table-wrap {
  padding: 0;
  overflow: hidden;
}

.col-check {
  width: 40px;
  text-align: center;
}

.col-actions {
  white-space: nowrap;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 4px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: var(--portal-gray-600, #757575);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
}

.icon-btn:hover {
  background: var(--portal-gray-100, #f5f5f5);
  color: var(--portal-primary, #6b4cff);
}

.icon-btn.danger:hover {
  color: var(--portal-red, #f44336);
}

.progress-panel {
  padding: 20px 24px;
}

.progress-tip {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--portal-gray-500, #9e9e9e);
}

.progress-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.progress-list li {
  padding: 14px 0;
  border-bottom: 1px solid var(--portal-gray-200, #eeeeee);
}

.progress-list li:last-child {
  border-bottom: none;
}

.progress-main {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.progress-meta {
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
