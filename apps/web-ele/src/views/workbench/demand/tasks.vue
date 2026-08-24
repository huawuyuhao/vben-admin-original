<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type ComputeTaskItem,
  computeTasks as seed,
} from '#/views/_shared/data/workbench-demand';

defineOptions({ name: 'WorkbenchDemandTasks' });

const portalTab = ref('电碳协同门户');
const rows = ref<ComputeTaskItem[]>(seed.map((i) => ({ ...i })));
const page = ref(1);
const pageSize = 6;

const query = reactive({
  modelType: '',
  appName: '',
  taskStatus: '',
  taskId: '',
  start: '',
  end: '',
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.appName.trim()) {
    list = list.filter((i) => i.container.includes(query.appName.trim()));
  }
  if (query.taskStatus) {
    list = list.filter((i) => i.status === query.taskStatus);
  }
  if (query.taskId.trim()) {
    list = list.filter(
      (i) =>
        i.id.includes(query.taskId.trim()) ||
        i.pod.includes(query.taskId.trim()),
    );
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

function search() {
  page.value = 1;
  ElMessage.success('已查询（示例）');
}

function reset() {
  query.modelType = '';
  query.appName = '';
  query.taskStatus = '';
  query.taskId = '';
  query.start = '';
  query.end = '';
  page.value = 1;
}

function statusClass(s: string) {
  if (s === '已完成') return 'ok';
  if (s === '已取消') return 'mute';
  return 'info';
}
</script>

<template>
  <div class="page">
    <div class="tabs">
      <button
        v-for="t in ['电碳协同门户', '协同运营中心', '全国一体化算力网']"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: portalTab === t }"
        @click="portalTab = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="filter">
      <select v-model="query.modelType">
        <option value="">请选择模型类型</option>
        <option>视觉模型</option>
        <option>NLP</option>
        <option>多模态</option>
      </select>
      <input
        v-model="query.appName"
        type="text"
        placeholder="请输入应用名称"
      />
      <select v-model="query.taskStatus">
        <option value="">请选择任务状态</option>
        <option>未完成</option>
        <option>已完成</option>
        <option>已取消</option>
      </select>
      <input v-model="query.taskId" type="text" placeholder="请输入任务ID" />
      <input v-model="query.start" type="date" />
      <span class="dash">至</span>
      <input v-model="query.end" type="date" />
      <button class="btn primary" type="button" @click="search">查询</button>
      <button class="btn" type="button" @click="reset">重置</button>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('已导出（示例）')"
      >
        导出
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>POD</th>
            <th>容器名</th>
            <th>节点</th>
            <th>分配算力</th>
            <th>分配显存</th>
            <th>分配设备</th>
            <th>任务状态</th>
            <th>任务进度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>{{ row.pod }}</td>
            <td>{{ row.container }}</td>
            <td>{{ row.node }}</td>
            <td>{{ row.computePct }}%</td>
            <td>{{ row.memoryGi }} Gi</td>
            <td>{{ row.devices }}</td>
            <td>
              <span class="badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.progressDone }}/{{ row.progressTotal }}</td>
            <td class="ops">
              <button type="button" @click="ElMessage.info(`详情 ${row.pod}`)">
                详情
              </button>
              <button
                type="button"
                @click="ElMessage.success('开始下载（示例）')"
              >
                下载
              </button>
              <button
                type="button"
                @click="ElMessage.info(`配置 ${row.container}`)"
              >
                配置
              </button>
              <button
                v-if="row.status === '未完成'"
                type="button"
                @click="ElMessage.warning('标记未处理（示例）')"
              >
                未处理
              </button>
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
  </div>
</template>

<style scoped>
.page {
  --primary: #409eff;
  padding-bottom: 24px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.tab {
  padding: 10px 16px;
  margin-bottom: -1px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: var(--primary);
  font-weight: 600;
  border-bottom-color: var(--primary);
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

.dash {
  color: #909399;
  font-size: 12px;
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
  padding: 12px 10px;
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

.badge.info {
  color: #409eff;
  background: #ecf5ff;
}

.badge.ok {
  color: #67c23a;
  background: #f0f9eb;
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
</style>
