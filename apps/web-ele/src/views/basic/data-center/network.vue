<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcNetwork' });

interface NetworkResource {
  id: string;
  name: string;
  type: string;
  cidr: string;
  bandwidth: string;
  cluster: string;
  status: string;
}

const rows: NetworkResource[] = [
  {
    id: '1',
    name: 'vpc-prod-east',
    type: 'VPC',
    cidr: '10.10.0.0/16',
    bandwidth: '—',
    cluster: 'prod-k8s-east',
    status: '可用',
  },
  {
    id: '2',
    name: 'subnet-compute-a',
    type: '子网',
    cidr: '10.10.1.0/24',
    bandwidth: '—',
    cluster: 'prod-k8s-east',
    status: '可用',
  },
  {
    id: '3',
    name: 'bw-uplink-core',
    type: '带宽',
    cidr: '—',
    bandwidth: '10 Gbps',
    cluster: 'prod-k8s-east',
    status: '可用',
  },
  {
    id: '4',
    name: 'vpc-train-north',
    type: 'VPC',
    cidr: '10.20.0.0/16',
    bandwidth: '—',
    cluster: 'train-yarn-north',
    status: '可用',
  },
  {
    id: '5',
    name: 'bw-cross-dc',
    type: '带宽',
    cidr: '—',
    bandwidth: '40 Gbps',
    cluster: 'edge-k8s-south',
    status: '限速',
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

function statusClass(s: string) {
  if (s === '可用') return 'ok';
  if (s === '限速') return 'warn';
  return 'mute';
}

function typeClass(t: string) {
  if (t === 'VPC') return 'info';
  if (t === '子网') return 'purple';
  return 'ok';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 网络资源</div>
    <header class="head">
      <div>
        <h2>网络资源</h2>
        <p>管理 VPC、子网与带宽资源，查看 CIDR 分配与集群关联关系。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('申请网络资源（示例）')"
        >
          + 申请资源
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          资源名称
          <input v-model="keyword" placeholder="请输入资源名称" />
        </label>
        <label>
          类型
          <select v-model="type">
            <option>全部</option>
            <option>VPC</option>
            <option>子网</option>
            <option>带宽</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>可用</option>
            <option>限速</option>
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
              <th>类型</th>
              <th>CIDR</th>
              <th>带宽</th>
              <th>关联集群</th>
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
              <td>{{ r.cidr }}</td>
              <td>{{ r.bandwidth }}</td>
              <td>{{ r.cluster }}</td>
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
                  class="link purple"
                  @click="ElMessage.success(`拓扑 ${r.name}（示例）`)"
                >
                  拓扑
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
