<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcContainer' });

interface ContainerRow {
  id: string;
  name: string;
  image: string;
  namespace: string;
  replicas: string;
  resources: string;
  status: string;
}

const rows: ContainerRow[] = [
  {
    id: '1',
    name: 'metrics-collector',
    image: 'registry/metrics:v2.3',
    namespace: 'monitoring',
    replicas: '3/3',
    resources: '2C / 4Gi',
    status: '运行中',
  },
  {
    id: '2',
    name: 'data-ingest-worker',
    image: 'registry/ingest:v1.8',
    namespace: 'data-pipeline',
    replicas: '5/5',
    resources: '4C / 8Gi',
    status: '运行中',
  },
  {
    id: '3',
    name: 'alert-dispatcher',
    image: 'registry/alert:v3.1',
    namespace: 'monitoring',
    replicas: '2/2',
    resources: '1C / 2Gi',
    status: '运行中',
  },
  {
    id: '4',
    name: 'model-inference-svc',
    image: 'registry/inference:v4.0',
    namespace: 'ai-serving',
    replicas: '2/4',
    resources: '8C / 16Gi',
    status: '异常',
  },
  {
    id: '5',
    name: 'archive-scheduler',
    image: 'registry/archive:v1.2',
    namespace: 'data-pipeline',
    replicas: '0/1',
    resources: '2C / 4Gi',
    status: '已停止',
  },
];

const keyword = ref('');
const namespace = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (keyword.value.trim()) {
    list = list.filter((r) => r.name.includes(keyword.value.trim()));
  }
  if (namespace.value !== '全部') {
    list = list.filter((r) => r.namespace === namespace.value);
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

function statusClass(s: string) {
  if (s === '运行中') return 'ok';
  if (s === '异常') return 'danger';
  if (s === '已停止') return 'mute';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 容器管理</div>
    <header class="head">
      <div>
        <h2>容器管理</h2>
        <p>管理容器工作负载，查看镜像、命名空间、副本与资源配额。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('部署新工作负载（示例）')"
        >
          + 部署工作负载
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          名称
          <input v-model="keyword" placeholder="请输入工作负载名称" />
        </label>
        <label>
          命名空间
          <select v-model="namespace">
            <option>全部</option>
            <option>monitoring</option>
            <option>data-pipeline</option>
            <option>ai-serving</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>运行中</option>
            <option>异常</option>
            <option>已停止</option>
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
              <th>名称</th>
              <th>镜像</th>
              <th>命名空间</th>
              <th>副本</th>
              <th>CPU/内存</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>{{ r.image }}</td>
              <td>{{ r.namespace }}</td>
              <td>{{ r.replicas }}</td>
              <td>{{ r.resources }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name} 日志（示例）`)"
                >
                  日志
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}（示例）`)"
                >
                  编辑
                </button>
                <button
                  v-if="r.status === '已停止'"
                  type="button"
                  class="link ok"
                  @click="ElMessage.success(`启动 ${r.name}（示例）`)"
                >
                  启动
                </button>
                <button
                  v-else
                  type="button"
                  class="link warn"
                  @click="ElMessage.success(`重启 ${r.name}（示例）`)"
                >
                  重启
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
