<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type ProcessStatus,
  type StrategyProcessItem,
  strategyProcesses as seed,
} from '#/views/_shared/data/workbench-strategy-check';

defineOptions({ name: 'WorkbenchStrategyProcess' });

const rows = ref<StrategyProcessItem[]>(seed.map((i) => ({ ...i })));
const page = ref(1);
const pageSize = 6;
const current = ref<StrategyProcessItem | null>(null);

const query = reactive({
  keyword: '',
  status: '' as '' | ProcessStatus,
});

const filtered = computed(() => {
  let list = [...rows.value];
  if (query.keyword.trim()) {
    const kw = query.keyword.trim();
    list = list.filter(
      (i) =>
        i.id.includes(kw) ||
        i.taskName.includes(kw) ||
        i.schemeName.includes(kw),
    );
  }
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

function statusClass(s: ProcessStatus) {
  if (s === '已完成') return 'ok';
  if (s === '分析中') return 'info';
  if (s === '排队中') return 'warn';
  if (s === '失败') return 'danger';
  return 'mute';
}

function registerTask() {
  const id = `CHK-${Date.now().toString().slice(-8)}`;
  rows.value.unshift({
    id,
    taskName: '新建校核任务（示例）',
    schemeName: '待关联策略方案',
    status: '已登记',
    queue: '标准分析队列',
    priority: '中',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    context: '标准化登记完成，等待进入智能调度队列',
    progress: 0,
  });
  ElMessage.success(`已登记校核任务 ${id}`);
  page.value = 1;
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>策略校核过程管理</h2>
        <p>
          对算力任务标准化登记并生成唯一校核任务 ID，全程跟踪生命周期与队列状态，为策略分析与系统稳定运行提供数据支撑。
        </p>
      </div>
      <button class="btn primary" type="button" @click="registerTask">
        登记校核任务
      </button>
    </header>

    <div class="filter">
      <input v-model="query.keyword" placeholder="校核任务ID/任务名/方案" />
      <select v-model="query.status">
        <option value="">全部状态</option>
        <option>已登记</option>
        <option>排队中</option>
        <option>分析中</option>
        <option>已完成</option>
        <option>失败</option>
      </select>
      <button class="btn primary" type="button" @click="page = 1">查询</button>
      <button
        class="btn"
        type="button"
        @click="query.keyword = ''; query.status = ''; page = 1"
      >
        重置
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>校核任务ID</th>
            <th>算力任务</th>
            <th>策略方案</th>
            <th>优先级</th>
            <th>队列</th>
            <th>状态</th>
            <th>进度</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paged" :key="row.id">
            <td class="mono">{{ row.id }}</td>
            <td>{{ row.taskName }}</td>
            <td>{{ row.schemeName }}</td>
            <td>{{ row.priority }}</td>
            <td>{{ row.queue }}</td>
            <td>
              <span class="badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>
              <div class="progress">
                <i :style="{ width: `${row.progress}%` }" />
                <em>{{ row.progress }}%</em>
              </div>
            </td>
            <td>{{ row.updatedAt }}</td>
            <td class="ops">
              <button type="button" @click="current = row">上下文</button>
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
          <h3>任务上下文 · {{ current.id }}</h3>
          <button type="button" @click="current = null">×</button>
        </header>
        <dl>
          <div><dt>算力任务</dt><dd>{{ current.taskName }}</dd></div>
          <div><dt>策略方案</dt><dd>{{ current.schemeName }}</dd></div>
          <div><dt>登记时间</dt><dd>{{ current.createdAt }}</dd></div>
          <div><dt>调度队列</dt><dd>{{ current.queue }}</dd></div>
          <div><dt>生命周期</dt><dd>{{ current.status }}</dd></div>
        </dl>
        <h4>完整上下文</h4>
        <pre>{{ current.context }}</pre>
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
  max-width: 740px;
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
.mono {
  font-family: Consolas, monospace;
  color: #409eff;
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
.badge.warn {
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
.progress {
  position: relative;
  width: 96px;
  height: 8px;
  overflow: hidden;
  background: #ebeef5;
  border-radius: 4px;
}
.progress i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #79bbff, #409eff);
}
.progress em {
  position: absolute;
  top: -16px;
  right: 0;
  font-size: 11px;
  font-style: normal;
  color: #909399;
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
.drawer dl {
  margin: 12px 0;
}
.drawer dl > div {
  display: grid;
  grid-template-columns: 88px 1fr;
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
}
.drawer h4 {
  margin: 12px 0 6px;
}
.drawer pre {
  margin: 0;
  padding: 10px;
  color: #606266;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  background: #f5f7fa;
  border-radius: 6px;
}
</style>
