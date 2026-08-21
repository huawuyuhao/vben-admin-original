<script lang="ts" setup>
import { ref } from 'vue';

const activeTab = ref('devices');
const keyword = ref('');
const statusFilter = ref('all');
const toast = ref('');

const devices = [
  {
    id: 'DEV-001',
    name: 'NVIDIA A100 服务器',
    type: 'GPU 服务器',
    spec: 'A100-80GB × 8',
    count: 2,
    status: '已接入',
    submittedAt: '2026-08-15',
  },
  {
    id: 'DEV-002',
    name: 'NVIDIA H100 服务器',
    type: 'GPU 服务器',
    spec: 'H100-80GB × 4',
    count: 1,
    status: '已查看',
    submittedAt: '2026-08-18',
  },
  {
    id: 'DEV-003',
    name: 'AMD EPYC 计算节点',
    type: 'CPU 服务器',
    spec: 'EPYC-7763 × 2',
    count: 5,
    status: '未受理',
    submittedAt: '2026-08-20',
  },
];

function statusClass(s: string) {
  if (s === '已接入') return 'portal-badge-success';
  if (s === '已查看') return 'portal-badge-warning';
  return 'portal-badge-gray';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>企业服务</h2>
      <p>
        支持算力供给用户在线提交可接入系统的服务器、GPU等设备清单。设备完成接入后，支持新增算力产品并上架。
      </p>
    </div>

    <div class="portal-tabs">
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'devices' }"
        @click="activeTab = 'devices'"
      >
        设备清单
      </div>
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'products' }"
        @click="activeTab = 'products'"
      >
        算力产品上架
      </div>
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'center' }"
        @click="activeTab = 'center'"
      >
        企业中心
      </div>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="设备名称、编号..." />
      </div>
      <select v-model="statusFilter">
        <option value="all">全部状态</option>
        <option value="未受理">未受理</option>
        <option value="已查看">已查看</option>
        <option value="已接入">已接入</option>
      </select>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开设备清单提交表单（示例）')"
      >
        + 提交设备清单
      </button>
    </div>

    <div class="portal-card" style="padding: 0; overflow: hidden">
      <table class="portal-data-table">
        <thead>
          <tr>
            <th>设备编号</th>
            <th>设备名称</th>
            <th>设备类型</th>
            <th>规格参数</th>
            <th>数量</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in devices" :key="row.id">
            <td class="portal-col-id">{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.spec }}</td>
            <td>{{ row.count }}</td>
            <td>
              <span class="portal-badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.submittedAt }}</td>
            <td>
              <button
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast(`查看设备：${row.name}`)"
              >
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

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
