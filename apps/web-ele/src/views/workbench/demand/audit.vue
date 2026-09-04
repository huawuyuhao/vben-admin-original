<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type DemandAuditItem,
  type DemandAuditTab,
  demandAudits as seed,
} from '#/views/_shared/data/workbench-demand';

defineOptions({ name: 'WorkbenchDemandAudit' });

const tab = ref<DemandAuditTab>('待审核');
const rows = ref<DemandAuditItem[]>(seed.map((i) => ({ ...i })));
const selected = ref<string[]>([]);
const page = ref(1);
const pageSize = 8;

const query = reactive({
  modelType: '',
  modelName: '',
  taskStatus: '',
  client: '',
  start: '',
  end: '',
  appType: '全部' as '全部' | '推理类' | '训练类',
  dataType: '全部' as '全部' | '图像识别' | '文档解析' | '目标检测',
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (tab.value === '待审核') {
    list = list.filter((i) => i.status === '待确认' || i.status === '审核中');
  } else if (tab.value === '已审批') {
    list = list.filter((i) => i.status === '已通过' || i.status === '已驳回');
  }
  if (query.modelType) {
    list = list.filter((i) => i.modelType.includes(query.modelType));
  }
  if (query.modelName.trim()) {
    list = list.filter((i) => i.modelName.includes(query.modelName.trim()));
  }
  if (query.taskStatus) {
    list = list.filter((i) => i.status === query.taskStatus);
  }
  if (query.client.trim()) {
    list = list.filter((i) => i.client.includes(query.client.trim()));
  }
  if (query.appType !== '全部') {
    list = list.filter((i) => i.appType === query.appType);
  }
  if (query.dataType !== '全部') {
    const map: Record<string, string[]> = {
      目标检测: ['目标检测'],
      图像识别: ['图像识别', '图片分类'],
      文档解析: ['文档解析'],
    };
    const allow = map[query.dataType] || [];
    list = list.filter((i) => allow.includes(i.dataType));
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

const allChecked = computed(
  () =>
    paged.value.length > 0 &&
    paged.value.every((r) => selected.value.includes(r.id)),
);

watch(tab, () => {
  page.value = 1;
  selected.value = [];
});

function search() {
  page.value = 1;
  ElMessage.success('已按条件查询（示例）');
}

function reset() {
  query.modelType = '';
  query.modelName = '';
  query.taskStatus = '';
  query.client = '';
  query.start = '';
  query.end = '';
  query.appType = '全部';
  query.dataType = '全部';
  page.value = 1;
}

function toggleAll(checked: boolean) {
  if (checked) {
    selected.value = [
      ...new Set([...selected.value, ...paged.value.map((r) => r.id)]),
    ];
  } else {
    const ids = new Set(paged.value.map((r) => r.id));
    selected.value = selected.value.filter((id) => !ids.has(id));
  }
}

function toggleOne(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((x) => x !== id);
  } else {
    selected.value = [...selected.value, id];
  }
}

function submitAudit() {
  if (selected.value.length === 0) {
    ElMessage.warning('请先勾选需求');
    return;
  }
  ElMessage.success(`已提交审核 ${selected.value.length} 条（示例）`);
}

function statusClass(s: string) {
  if (s === '已通过') return 'ok';
  if (s === '已驳回') return 'danger';
  if (s === '审核中') return 'warn';
  return 'pending';
}
</script>

<template>
  <div class="page">
    <div class="tabs">
      <button
        v-for="t in ['全部需求', '待审核', '已审批'] as DemandAuditTab[]"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="filter">
      <div class="row">
        <select v-model="query.modelType">
          <option value="">请选择模型类型</option>
          <option>视觉模型</option>
          <option>NLP</option>
          <option>多模态</option>
        </select>
        <input
          v-model="query.modelName"
          type="text"
          placeholder="请输入模型名称"
        />
        <select v-model="query.taskStatus">
          <option value="">请选择任务状态</option>
          <option>待确认</option>
          <option>审核中</option>
          <option>已通过</option>
          <option>已驳回</option>
        </select>
        <input v-model="query.client" type="text" placeholder="请输入委托方" />
        <input v-model="query.start" type="datetime-local" />
        <span class="dash">至</span>
        <input v-model="query.end" type="datetime-local" />
        <button class="btn primary" type="button" @click="search">查询</button>
        <button class="btn" type="button" @click="reset">重置</button>
      </div>

      <div class="row checks">
        <span class="label">应用（算力）类型</span>
        <label
          v-for="t in ['全部', '推理类', '训练类']"
          :key="t"
        >
          <input
            v-model="query.appType"
            type="radio"
            :value="t"
          />
          {{ t }}
        </label>
      </div>
      <div class="row checks">
        <span class="label">数据类型</span>
        <label
          v-for="t in ['全部', '目标检测', '图像识别', '文档解析']"
          :key="t"
        >
          <input v-model="query.dataType" type="radio" :value="t" />
          {{ t }}
        </label>
      </div>
    </div>

    <div class="toolbar">
      <button class="btn primary" type="button" @click="submitAudit">
        提交审核
      </button>
      <button
        class="btn"
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
            <th>
              <input
                type="checkbox"
                :checked="allChecked"
                @change="toggleAll(($event.target as HTMLInputElement).checked)"
              />
            </th>
            <th>需求ID</th>
            <th>数据类型</th>
            <th>文件数量</th>
            <th>委托方</th>
            <th>任务时间</th>
            <th>任务状态</th>
            <th>任务进度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td>
              <input
                type="checkbox"
                :checked="selected.includes(row.id)"
                @change="toggleOne(row.id)"
              />
            </td>
            <td>{{ row.id }}</td>
            <td class="link">{{ row.dataType }}</td>
            <td>{{ row.fileCount }}</td>
            <td>{{ row.client }}</td>
            <td>{{ row.taskTime }}</td>
            <td>
              <span class="status" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.progressDone }}/{{ row.progressTotal }}</td>
            <td class="ops">
              <button type="button" @click="ElMessage.info(`详情 ${row.id}`)">
                详情
              </button>
              <button
                type="button"
                @click="ElMessage.info(`用户画像 ${row.client}`)"
              >
                用户画像
              </button>
              <button
                type="button"
                @click="ElMessage.success(`审核 ${row.id}（示例）`)"
              >
                审核
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
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.tab.active {
  font-weight: 600;
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.filter {
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.row:last-child {
  margin-bottom: 0;
}

.row input,
.row select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.dash {
  font-size: 12px;
  color: #909399;
}

.label {
  width: 120px;
  font-size: 13px;
  color: #909399;
}

.checks label {
  margin-right: 12px;
  font-size: 13px;
  color: #606266;
}

.btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
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

.toolbar {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 10px;
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
  padding: 12px 10px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #ebeef5;
}

th {
  font-weight: 500;
  color: #909399;
  background: #fafafa;
}

.link {
  color: var(--primary);
}

.status {
  font-weight: 500;
}

.status.pending,
.status.warn {
  color: #e6a23c;
}

.status.ok {
  color: #67c23a;
}

.status.danger {
  color: #f56c6c;
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
</style>
