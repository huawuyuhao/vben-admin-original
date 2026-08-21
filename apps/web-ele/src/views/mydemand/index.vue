<script lang="ts" setup>
import { ref } from 'vue';

const activeTab = ref('apps');
const keyword = ref('');
const statusFilter = ref('all');
const toast = ref('');

const apps = [
  {
    name: '大模型训练任务-A',
    id: 'TASK-20260820-001',
    type: 'GPU 智算',
    priority: '高',
    region: '贵州A区',
    status: '运行中',
    createdAt: '2026-08-20 09:15',
  },
  {
    name: '图像识别推理-B',
    id: 'TASK-20260819-018',
    type: 'GPU 智算',
    priority: '中',
    region: '广州B区',
    status: '运行中',
    createdAt: '2026-08-19 14:30',
  },
  {
    name: '数据分析批处理-C',
    id: 'TASK-20260819-012',
    type: 'CPU 通算',
    priority: '低',
    region: '惠州D区',
    status: '已完成',
    createdAt: '2026-08-19 08:00',
  },
  {
    name: '语音识别服务-D',
    id: 'TASK-20260818-025',
    type: '边缘算力',
    priority: '中',
    region: '边缘节点',
    status: '待审核',
    createdAt: '2026-08-18 16:45',
  },
  {
    name: '分布式训练-E',
    id: 'TASK-20260817-009',
    type: 'GPU 智算',
    priority: '高',
    region: '贵州A区',
    status: '已终止',
    createdAt: '2026-08-17 10:20',
  },
];

function priorityClass(p: string) {
  if (p === '高') return 'portal-badge-danger';
  if (p === '中') return 'portal-badge-warning';
  return 'portal-badge-gray';
}

function statusClass(s: string) {
  if (s === '运行中') return 'portal-badge-success';
  if (s === '待审核') return 'portal-badge-warning';
  if (s === '已终止') return 'portal-badge-danger';
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
      <h2>我的需求</h2>
      <p>
        个人应用管理、算力需求全流程管理及在运应用实时监控能力，覆盖从应用创建、需求提交到运行监控的闭环操作。
      </p>
    </div>

    <div class="portal-tabs">
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'apps' }"
        @click="activeTab = 'apps'"
      >
        我的应用
      </div>
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'demands' }"
        @click="activeTab = 'demands'"
      >
        我的算力需求
      </div>
      <div
        class="portal-tab"
        :class="{ active: activeTab === 'running' }"
        @click="activeTab = 'running'"
      >
        需求在运应用
      </div>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="输入任务编号查询..." />
      </div>
      <select v-model="statusFilter">
        <option value="all">全部状态</option>
        <option value="待审核">待审核</option>
        <option value="运行中">运行中</option>
        <option value="已完成">已完成</option>
        <option value="已终止">已终止</option>
      </select>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增应用表单（示例）')"
      >
        + 新增应用
      </button>
    </div>

    <div class="portal-card" style="padding: 0; overflow: hidden">
      <table class="portal-data-table">
        <thead>
          <tr>
            <th>应用名称</th>
            <th>任务编号</th>
            <th>算力类型</th>
            <th>优先级</th>
            <th>调度区域</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in apps" :key="row.id">
            <td>{{ row.name }}</td>
            <td class="portal-col-id">{{ row.id }}</td>
            <td>{{ row.type }}</td>
            <td>
              <span class="portal-badge" :class="priorityClass(row.priority)">
                {{ row.priority }}
              </span>
            </td>
            <td>{{ row.region }}</td>
            <td>
              <span class="portal-badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.createdAt }}</td>
            <td>
              <button
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast(`查看：${row.name}`)"
              >
                查看
              </button>
              <button
                v-if="row.status === '运行中'"
                class="portal-btn-text portal-btn-sm"
                style="color: var(--portal-red)"
                type="button"
                @click="showToast(`终止：${row.name}`)"
              >
                终止
              </button>
              <button
                v-else-if="row.status === '已完成'"
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast('开始下载')"
              >
                下载
              </button>
              <button
                v-else-if="row.status === '待审核'"
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast('编辑需求')"
              >
                编辑
              </button>
              <button
                v-else
                class="portal-btn-text portal-btn-sm"
                type="button"
                @click="showToast('重新提交')"
              >
                重新提交
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="padding: 16px">
        <div class="portal-pagination">
          <span class="portal-page-info">共 5 条记录</span>
          <button class="active" type="button">1</button>
        </div>
      </div>
    </div>

    <div class="portal-two-col" style="margin-top: 24px">
      <div class="portal-card">
        <div class="portal-card-title">
          <span>在运应用电力实时数据</span>
          <span class="portal-badge portal-badge-info">实时</span>
        </div>
        <div class="metric-row">
          <div>
            <div class="metric-num" style="color: var(--portal-orange)">
              856<span class="metric-unit">kW</span>
            </div>
            <div class="metric-label">当前功率</div>
          </div>
          <div>
            <div class="metric-num" style="color: var(--portal-green)">
              85.3<span class="metric-unit">%</span>
            </div>
            <div class="metric-label">绿电占比</div>
          </div>
          <div>
            <div class="metric-num" style="color: var(--portal-primary)">
              2,486<span class="metric-unit">kWh</span>
            </div>
            <div class="metric-label">今日用电量</div>
          </div>
        </div>
      </div>
      <div class="portal-card">
        <div class="portal-card-title">
          <span>在运应用碳排放实时数据</span>
          <span class="portal-badge portal-badge-info">实时</span>
        </div>
        <div class="metric-row">
          <div>
            <div class="metric-num" style="color: var(--portal-green)">
              4.2<span class="metric-unit">T</span>
            </div>
            <div class="metric-label">今日碳排放</div>
          </div>
          <div>
            <div class="metric-num" style="color: var(--portal-primary)">
              0.42<span class="metric-unit">kg/kWh</span>
            </div>
            <div class="metric-label">碳排放强度</div>
          </div>
          <div>
            <div class="metric-num" style="color: var(--portal-green)">
              ↓8.5<span class="metric-unit">%</span>
            </div>
            <div class="metric-label">同比降低</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

.metric-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.metric-num {
  font-size: 28px;
  font-weight: 800;
}

.metric-unit {
  margin-left: 2px;
  font-size: 14px;
}

.metric-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--portal-gray-500);
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
