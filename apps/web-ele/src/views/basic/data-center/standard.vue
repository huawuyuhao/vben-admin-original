<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcStandard' });

interface DataStandard {
  id: string;
  code: string;
  name: string;
  category: string;
  version: string;
  publishDate: string;
  status: string;
}

const rows: DataStandard[] = [
  {
    id: '1',
    code: 'DS-DC-001',
    name: '数据中心编码规范',
    category: '编码标准',
    version: 'v2.1',
    publishDate: '2026-03-15',
    status: '已发布',
  },
  {
    id: '2',
    code: 'DS-DC-002',
    name: '机柜资源数据元标准',
    category: '数据元',
    version: 'v1.3',
    publishDate: '2026-02-20',
    status: '已发布',
  },
  {
    id: '3',
    code: 'DS-DC-003',
    name: '能耗指标口径标准',
    category: '指标标准',
    version: 'v1.0',
    publishDate: '2026-05-08',
    status: '草稿',
  },
  {
    id: '4',
    code: 'DS-DC-004',
    name: '算力节点命名规范',
    category: '编码标准',
    version: 'v3.0',
    publishDate: '2026-01-10',
    status: '已发布',
  },
  {
    id: '5',
    code: 'DS-DC-005',
    name: '告警事件分类标准',
    category: '分类标准',
    version: 'v2.0',
    publishDate: '2026-06-22',
    status: '审核中',
  },
];

const keyword = ref('');
const category = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (keyword.value.trim()) {
    const k = keyword.value.trim();
    list = list.filter((r) => r.name.includes(k) || r.code.includes(k));
  }
  if (category.value !== '全部') {
    list = list.filter((r) => r.category === category.value);
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

function statusClass(s: string) {
  if (s === '已发布') return 'ok';
  if (s === '审核中') return 'warn';
  if (s === '草稿') return 'mute';
  return 'info';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据标准</div>
    <header class="head">
      <div>
        <h2>数据标准</h2>
        <p>维护数据中心相关数据标准目录，包括编码、数据元与指标口径规范。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新建数据标准（示例）')"
        >
          + 新建标准
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出目录（示例）')">
          导出
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          编号/名称
          <input v-model="keyword" placeholder="请输入编号或名称" />
        </label>
        <label>
          分类
          <select v-model="category">
            <option>全部</option>
            <option>编码标准</option>
            <option>数据元</option>
            <option>指标标准</option>
            <option>分类标准</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>已发布</option>
            <option>审核中</option>
            <option>草稿</option>
          </select>
        </label>
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
              <th>标准编号</th>
              <th>名称</th>
              <th>分类</th>
              <th>版本</th>
              <th>发布日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.code }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.category }}</td>
              <td>{{ r.version }}</td>
              <td>{{ r.publishDate }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name}（示例）`)"
                >
                  查看
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}（示例）`)"
                >
                  编辑
                </button>
                <button
                  v-if="r.status === '草稿'"
                  type="button"
                  class="link ok"
                  @click="ElMessage.success(`提交审核 ${r.name}（示例）`)"
                >
                  提交审核
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
