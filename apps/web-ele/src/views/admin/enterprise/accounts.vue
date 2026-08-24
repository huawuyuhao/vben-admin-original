<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  type SubAccountStatus,
  subAccounts,
} from '#/views/_shared/data/enterprise-center';

const keyword = ref('');
const department = ref('all');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 5;
const toast = ref('');

const departments = ['技术部', '市场部', '运营部', '财务部'];

const filtered = computed(() => {
  let list = [...subAccounts];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (r) =>
        r.username.toLowerCase().includes(key) ||
        r.name.includes(key) ||
        r.phone.includes(key),
    );
  }
  if (department.value !== 'all') {
    list = list.filter((r) => r.department === department.value);
  }
  if (statusFilter.value !== 'all') {
    list = list.filter((r) => r.status === statusFilter.value);
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

watch([keyword, department, statusFilter], () => {
  currentPage.value = 1;
});

function statusClass(s: SubAccountStatus) {
  return s === '启用' ? 'portal-badge-success' : 'portal-badge-gray';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function resetFilters() {
  keyword.value = '';
  department.value = 'all';
  statusFilter.value = 'all';
}
</script>

<template>
  <div class="portal-inner-page enterprise-accounts-page">
    <div class="portal-page-title">
      <h2>子账号管理</h2>
      <p>管理企业子账号的权限、有效期与启用状态，支持按用户名、部门筛选。</p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">👤</span>
        <input v-model="keyword" type="text" placeholder="请输入用户名" />
      </div>
      <select v-model="department">
        <option value="all">全部部门</option>
        <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
      </select>
      <select v-model="statusFilter">
        <option value="all">全部状态</option>
        <option value="启用">启用</option>
        <option value="禁用">禁用</option>
      </select>
      <button class="portal-btn portal-btn-primary portal-btn-sm" type="button">
        搜索
      </button>
      <button
        class="portal-btn portal-btn-outline portal-btn-sm"
        type="button"
        @click="resetFilters"
      >
        重置
      </button>
    </div>

    <div class="action-row">
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增子账号表单（示例）')"
      >
        + 新增子账号
      </button>
    </div>

    <div class="portal-card table-wrap">
      <table class="portal-data-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>姓名</th>
            <th>部门</th>
            <th>联系方式</th>
            <th>权限</th>
            <th>有效期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td class="portal-col-id">{{ row.username }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.department }}</td>
            <td>{{ row.phone }}</td>
            <td>{{ row.role }}</td>
            <td>{{ row.validFrom }} 至 {{ row.validTo }}</td>
            <td>
              <span class="portal-badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td class="col-actions">
              <button
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast(`编辑：${row.username}`)"
              >
                编辑
              </button>
              <button
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast(`权限：${row.username}`)"
              >
                权限
              </button>
              <button
                class="portal-btn-text portal-btn-sm"
                :class="row.status === '启用' ? 'is-danger' : ''"
                type="button"
                @click="
                  showToast(
                    `${row.status === '启用' ? '禁用' : '启用'}：${row.username}`,
                  )
                "
              >
                {{ row.status === '启用' ? '禁用' : '启用' }}
              </button>
              <button
                class="portal-btn-text portal-btn-sm is-danger"
                type="button"
                @click="showToast(`删除：${row.username}`)"
              >
                删除
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

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.action-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.table-wrap {
  padding: 0;
  overflow: hidden;
}

.col-actions {
  white-space: nowrap;
}

.col-actions .is-danger {
  color: var(--portal-red, #f44336);
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
