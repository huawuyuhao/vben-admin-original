<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcCluster' });

interface ClusterRow {
  id: string;
  name: string;
  type: string;
  nodes: number;
  cpu: string;
  gpu: string;
  utilization: number;
  status: string;
}

const rows: ClusterRow[] = [
  {
    id: '1',
    name: 'prod-k8s-east',
    type: 'K8s',
    nodes: 48,
    cpu: '768 核',
    gpu: '96 卡',
    utilization: 72,
    status: '健康',
  },
  {
    id: '2',
    name: 'train-yarn-north',
    type: 'Yarn',
    nodes: 32,
    cpu: '512 核',
    gpu: '64 卡',
    utilization: 85,
    status: '健康',
  },
  {
    id: '3',
    name: 'edge-k8s-south',
    type: 'K8s',
    nodes: 16,
    cpu: '256 核',
    gpu: '32 卡',
    utilization: 58,
    status: '告警',
  },
  {
    id: '4',
    name: 'batch-yarn-west',
    type: 'Yarn',
    nodes: 24,
    cpu: '384 核',
    gpu: '48 卡',
    utilization: 91,
    status: '高负载',
  },
  {
    id: '5',
    name: 'dev-k8s-local',
    type: 'K8s',
    nodes: 8,
    cpu: '128 核',
    gpu: '16 卡',
    utilization: 35,
    status: '维护中',
  },
];

const keyword = ref('');
const type = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (keyword.value.trim()) {
    list = list.filter((r) => r.name.includes(keyword.value.trim()));
  }
  if (type.value !== '全部') {
    list = list.filter((r) => r.type === type.value);
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

const kpis = computed(() => ({
  total: rows.length,
  nodes: rows.reduce((s, r) => s + r.nodes, 0),
  avgUtil: Math.round(rows.reduce((s, r) => s + r.utilization, 0) / rows.length),
  healthy: rows.filter((r) => r.status === '健康').length,
}));

function statusClass(s: string) {
  if (s === '健康') return 'ok';
  if (s === '告警' || s === '高负载') return 'warn';
  if (s === '维护中') return 'info';
  return 'mute';
}

function typeClass(t: string) {
  return t === 'K8s' ? 'info' : 'purple';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 集群管理</div>
    <header class="head">
      <div>
        <h2>集群管理</h2>
        <p>统一管理 K8s 与 Yarn 集群，监控节点规模与资源利用率。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('接入新集群（示例）')"
        >
          + 接入集群
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi">
        <strong>{{ kpis.total }}</strong>
        <span>集群总数</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.nodes }}</strong>
        <span>节点总数</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.avgUtil }}%</strong>
        <span>平均利用率</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.healthy }}</strong>
        <span>健康集群</span>
      </div>
    </div>

    <section class="card">
      <div class="filter">
        <label>
          集群名称
          <input v-model="keyword" placeholder="请输入集群名称" />
        </label>
        <label>
          类型
          <select v-model="type">
            <option>全部</option>
            <option>K8s</option>
            <option>Yarn</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>健康</option>
            <option>告警</option>
            <option>高负载</option>
            <option>维护中</option>
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
              <th>集群名</th>
              <th>类型</th>
              <th>节点数</th>
              <th>CPU</th>
              <th>GPU</th>
              <th>利用率</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>
                <span class="tag" :class="typeClass(r.type)">{{ r.type }}</span>
              </td>
              <td>{{ r.nodes }}</td>
              <td>{{ r.cpu }}</td>
              <td>{{ r.gpu }}</td>
              <td>{{ r.utilization }}%</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name} 监控（示例）`)"
                >
                  监控
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`配置 ${r.name}（示例）`)"
                >
                  配置
                </button>
                <button
                  type="button"
                  class="link warn"
                  @click="ElMessage.success(`扩容 ${r.name}（示例）`)"
                >
                  扩容
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
