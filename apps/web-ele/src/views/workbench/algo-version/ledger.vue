<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import {
  algoCallLogs,
  algoCategories,
  algoLedgerItems,
  type AlgoLedgerTab,
  algoOpLogs,
  algoParams,
  algoTypeOptions,
} from '#/views/_shared/data/algo-version';

defineOptions({ name: 'AlgoLedger' });

const tabs: Array<{ key: AlgoLedgerTab; label: string }> = [
  { key: 'list', label: '算法清单' },
  { key: 'category', label: '算法分类' },
  { key: 'params', label: '参数配置' },
  { key: 'op-log', label: '操作日志' },
  { key: 'call-log', label: '调用日志' },
];

const activeTab = ref<AlgoLedgerTab>('list');
const keyword = ref('');
const type = ref('');
const status = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const page = ref(1);
const pageSize = 6;

const filteredList = computed(() => {
  let rows = [...algoLedgerItems];
  const kw = keyword.value.trim();
  if (kw) rows = rows.filter((r) => r.name.includes(kw));
  if (type.value) rows = rows.filter((r) => r.type === type.value);
  if (status.value) rows = rows.filter((r) => r.status === status.value);
  if (dateFrom.value) {
    rows = rows.filter((r) => r.created >= dateFrom.value);
  }
  if (dateTo.value) {
    rows = rows.filter((r) => r.created <= dateTo.value);
  }
  return rows;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize)),
);

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

watch([keyword, type, status, dateFrom, dateTo, activeTab], () => {
  page.value = 1;
});

function reset() {
  keyword.value = '';
  type.value = '';
  status.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  page.value = 1;
  ElMessage.info('已重置筛选条件');
}

function search() {
  page.value = 1;
  ElMessage.success('查询完成');
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <div class="title-row">
          <h2>算法台账管理</h2>
          <span class="role-pill">运营人员</span>
        </div>
        <p>管理算法清单、分类、参数配置与操作日志。</p>
      </div>
      <button
        v-if="activeTab === 'list'"
        class="btn primary"
        type="button"
        @click="ElMessage.success('打开新增算法表单（示例）')"
      >
        + 新增算法
      </button>
    </header>

    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <section v-if="activeTab === 'list'" class="filter card">
      <label>
        算法名称
        <input v-model="keyword" placeholder="请输入算法名称" />
      </label>
      <label>
        算法类型
        <select v-model="type">
          <option value="">请选择</option>
          <option v-for="o in algoTypeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>
      <label>
        状态
        <select v-model="status">
          <option value="">请选择</option>
          <option>启用</option>
          <option>停用</option>
        </select>
      </label>
      <label class="date-range">
        创建时间
        <span class="dates">
          <input v-model="dateFrom" type="date" />
          <i>—</i>
          <input v-model="dateTo" type="date" />
        </span>
      </label>
      <div class="filter-actions">
        <button class="btn" type="button" @click="reset">重置</button>
        <button class="btn primary" type="button" @click="search">查询</button>
      </div>
    </section>

    <section v-if="activeTab === 'list'" class="card">
      <table>
        <thead>
          <tr>
            <th>算法名称</th>
            <th>算法类型</th>
            <th>最新版本</th>
            <th>状态</th>
            <th>最近更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in pagedList" :key="r.id">
            <td>{{ r.name }}</td>
            <td><span class="type-tag">{{ r.type }}</span></td>
            <td>{{ r.version }}</td>
            <td>
              <span class="status-dot" :class="r.status === '启用' ? 'on' : 'off'">
                {{ r.status }}
              </span>
            </td>
            <td>{{ r.updated }}</td>
            <td class="ops">
              <button type="button" class="link" @click="ElMessage.info(`详情 ${r.name}`)">
                详情
              </button>
              <button type="button" class="link" @click="ElMessage.info(`维护 ${r.name}`)">
                维护
              </button>
              <button type="button" class="link" @click="ElMessage.info(`参数 ${r.name}`)">
                参数
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <span>共 {{ filteredList.length }} 条</span>
        <div class="pager-btns">
          <button
            type="button"
            :disabled="page <= 1"
            @click="page = Math.max(1, page - 1)"
          >
            上一页
          </button>
          <button type="button" class="active">{{ page }}</button>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="page = Math.min(totalPages, page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="activeTab === 'category'" class="card">
      <div class="card-title">算法分类</div>
      <table>
        <thead>
          <tr>
            <th>分类ID</th>
            <th>分类名称</th>
            <th>算法数量</th>
            <th>说明</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in algoCategories" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.name }}</td>
            <td>{{ c.count }}</td>
            <td>{{ c.desc }}</td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`编辑 ${c.name}`)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="activeTab === 'params'" class="card">
      <div class="card-title">
        参数配置
        <span class="right">
          <button class="btn primary" type="button" @click="ElMessage.success('新增参数（示例）')">
            + 新增参数
          </button>
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>参数ID</th>
            <th>所属算法</th>
            <th>参数键</th>
            <th>参数值</th>
            <th>作用域</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in algoParams" :key="p.id">
            <td>{{ p.id }}</td>
            <td>{{ p.algo }}</td>
            <td>{{ p.key }}</td>
            <td>{{ p.value }}</td>
            <td>{{ p.scope }}</td>
            <td>{{ p.updated }}</td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`编辑 ${p.key}`)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="activeTab === 'op-log'" class="card">
      <div class="card-title">操作日志</div>
      <table>
        <thead>
          <tr>
            <th>日志ID</th>
            <th>时间</th>
            <th>操作人</th>
            <th>操作类型</th>
            <th>目标算法</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in algoOpLogs" :key="l.id">
            <td>{{ l.id }}</td>
            <td>{{ l.time }}</td>
            <td>{{ l.operator }}</td>
            <td>{{ l.action }}</td>
            <td>{{ l.target }}</td>
            <td>
              <span class="badge ok">{{ l.result }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="card">
      <div class="card-title">调用日志</div>
      <table>
        <thead>
          <tr>
            <th>调用ID</th>
            <th>时间</th>
            <th>算法</th>
            <th>调用方</th>
            <th>耗时</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in algoCallLogs" :key="l.id">
            <td>{{ l.id }}</td>
            <td>{{ l.time }}</td>
            <td>{{ l.algo }}</td>
            <td>{{ l.caller }}</td>
            <td>{{ l.duration }}</td>
            <td>
              <span class="badge" :class="l.status === '成功' ? 'ok' : 'danger'">
                {{ l.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.title-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.role-pill {
  padding: 4px 10px;
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  border: 1px solid #c2e7b0;
  border-radius: 12px;
}

.filter {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 12px;
  align-items: end;
  padding: 14px;
  margin-bottom: 12px;
  background: #fafafa;
}

.filter label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.dates {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dates i {
  font-style: normal;
  color: #909399;
}

.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
}

.status-dot {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.status-dot::before {
  width: 8px;
  height: 8px;
  content: '';
  border-radius: 50%;
}

.status-dot.on {
  color: #67c23a;
}

.status-dot.on::before {
  background: #67c23a;
}

.status-dot.off {
  color: #909399;
}

.status-dot.off::before {
  background: #c0c4cc;
}

.ops {
  display: flex;
  gap: 10px;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
  border-top: 1px solid #ebeef5;
}

.pager-btns {
  display: flex;
  gap: 6px;
}

.pager-btns button {
  min-width: 64px;
  height: 32px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.pager-btns button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.pager-btns button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}

@media (max-width: 1100px) {
  .filter {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
