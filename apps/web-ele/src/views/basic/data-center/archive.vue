<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcArchive' });

interface ArchiveTask {
  id: string;
  name: string;
  scope: string;
  strategy: string;
  volume: string;
  lastArchive: string;
  status: string;
}

const rows: ArchiveTask[] = [
  {
    id: '1',
    name: '采集日志冷归档',
    scope: '采集日志表 · 90 天前',
    strategy: '增量 · 压缩存储',
    volume: '2.8 TB',
    lastArchive: '2026-08-24 02:00',
    status: '已完成',
  },
  {
    id: '2',
    name: '能耗明细归档',
    scope: '能耗明细表 · 180 天前',
    strategy: '全量 · 分区归档',
    volume: '5.2 TB',
    lastArchive: '2026-08-23 03:30',
    status: '已完成',
  },
  {
    id: '3',
    name: '告警历史归档',
    scope: '告警事件表 · 365 天前',
    strategy: '增量 · 对象存储',
    volume: '1.1 TB',
    lastArchive: '2026-08-22 01:15',
    status: '执行中',
  },
  {
    id: '4',
    name: '算力调度记录归档',
    scope: '调度记录表 · 60 天前',
    strategy: '增量 · 压缩存储',
    volume: '860 GB',
    lastArchive: '2026-08-21 04:00',
    status: '已完成',
  },
  {
    id: '5',
    name: '审计日志长期归档',
    scope: '审计日志表 · 730 天前',
    strategy: '全量 · 磁带库',
    volume: '12.5 TB',
    lastArchive: '2026-08-20 00:00',
    status: '失败',
  },
];

const keyword = ref('');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (keyword.value.trim()) {
    list = list.filter((r) => r.name.includes(keyword.value.trim()));
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

function statusClass(s: string) {
  if (s === '已完成') return 'ok';
  if (s === '执行中') return 'info';
  if (s === '失败') return 'danger';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据归档</div>
    <header class="head">
      <div>
        <h2>数据归档</h2>
        <p>管理历史数据归档任务，配置归档范围、策略与存储目标。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新建归档任务（示例）')"
        >
          + 新建任务
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          任务名称
          <input v-model="keyword" placeholder="请输入任务名称" />
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>已完成</option>
            <option>执行中</option>
            <option>失败</option>
          </select>
        </label>
        <label>数据范围<input placeholder="请输入数据范围" /></label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span>共 {{ filtered.length }} 条记录</span>
        <span class="count">
          <button class="btn" type="button" @click="ElMessage.success('已刷新')">↻</button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>任务名</th>
              <th>数据范围</th>
              <th>策略</th>
              <th>归档量</th>
              <th>最近归档</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>{{ r.scope }}</td>
              <td>{{ r.strategy }}</td>
              <td>{{ r.volume }}</td>
              <td>{{ r.lastArchive }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name} 详情（示例）`)"
                >
                  详情
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}（示例）`)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="link ok"
                  @click="ElMessage.success(`立即归档 ${r.name}（示例）`)"
                >
                  立即归档
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
