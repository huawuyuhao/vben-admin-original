<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type SupplyListItem,
  supplyLists as seed,
} from '#/views/_shared/data/workbench-demand';

defineOptions({ name: 'WorkbenchDemandSupply' });

const tab = ref<'供给设备清单' | '清单受理进度'>('供给设备清单');
const keyword = ref('');
const rows = ref<SupplyListItem[]>(seed.map((i) => ({ ...i })));
const selected = ref<string[]>([]);
const page = ref(1);
const pageSize = 4;

const filtered = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return rows.value;
  return rows.value.filter(
    (i) =>
      i.name.includes(kw) ||
      i.deviceType.includes(kw) ||
      i.spec.includes(kw) ||
      i.status.includes(kw),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const progressRows = computed(() =>
  rows.value.map((r) => ({
    ...r,
    step:
      r.status === '已审核'
        ? '审核完成'
        : r.status === '待查看'
          ? '待运营查看'
          : '待受理',
    updatedAt: '2026-03-12 10:20',
  })),
);

function statusClass(s: string) {
  if (s === '已审核') return 'ok';
  if (s === '待查看') return 'info';
  return 'mute';
}

function toggle(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((x) => x !== id);
  } else {
    selected.value = [...selected.value, id];
  }
}

function audit() {
  ElMessage.success(
    selected.value.length
      ? `已提交 ${selected.value.length} 条供给审核（示例）`
      : '已打开算力供给审核（示例）',
  );
}
</script>

<template>
  <div class="page">
    <h2 class="title">我的算力供给</h2>

    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: tab === '供给设备清单' }"
        @click="tab = '供给设备清单'"
      >
        供给设备清单
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: tab === '清单受理进度' }"
        @click="tab = '清单受理进度'"
      >
        清单受理进度
      </button>
    </div>

    <template v-if="tab === '供给设备清单'">
      <div class="toolbar">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索设备名称、型号或状态"
          @keyup.enter="page = 1"
        />
        <button class="btn primary" type="button" @click="audit">
          算力供给审核
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 40px" />
              <th>清单名称</th>
              <th>设备类型</th>
              <th>型号规格</th>
              <th>数量</th>
              <th>总算力(FP32 TFLOPS)</th>
              <th>状态</th>
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
              <td>{{ row.name }}</td>
              <td>{{ row.deviceType }}</td>
              <td>{{ row.spec }}</td>
              <td>{{ row.quantity }}</td>
              <td>{{ row.tflops }}</td>
              <td>
                <span class="badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  title="查看"
                  @click="ElMessage.info(`查看 ${row.name}`)"
                >
                  👁
                </button>
                <button
                  type="button"
                  title="编辑"
                  @click="ElMessage.info(`编辑 ${row.name}`)"
                >
                  ✎
                </button>
                <button
                  type="button"
                  title="删除"
                  @click="ElMessage.warning(`删除 ${row.name}（示例）`)"
                >
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>
          显示 {{ (page - 1) * pageSize + 1 }} 到
          {{ Math.min(page * pageSize, filtered.length) }} 条，共
          {{ filtered.length }} 条记录
        </span>
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
    </template>

    <template v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>清单名称</th>
              <th>设备类型</th>
              <th>当前步骤</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in progressRows" :key="row.id">
              <td>{{ row.name }}</td>
              <td>{{ row.deviceType }}</td>
              <td>{{ row.step }}</td>
              <td>
                <span class="badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.updatedAt }}</td>
              <td class="ops">
                <button
                  type="button"
                  @click="ElMessage.info(`进度详情 ${row.name}`)"
                >
                  查看进度
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  --primary: #409eff;
  padding-bottom: 24px;
}

.title {
  margin: 0 0 12px;
  font-size: 20px;
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

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toolbar input {
  flex: 1;
  max-width: 360px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn {
  height: 34px;
  padding: 0 16px;
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

.badge.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.badge.info {
  color: #409eff;
  background: #ecf5ff;
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
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
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
