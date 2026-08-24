<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcDataService' });

interface DataService {
  id: string;
  name: string;
  type: string;
  protocol: string;
  qps: number;
  calls: number;
  status: string;
}

const rows: DataService[] = [
  {
    id: '1',
    name: '算力资源查询服务',
    type: '查询',
    protocol: 'REST',
    qps: 1200,
    calls: 856000,
    status: '已发布',
  },
  {
    id: '2',
    name: '告警事件推送服务',
    type: '推送',
    protocol: 'WebSocket',
    qps: 350,
    calls: 128000,
    status: '已发布',
  },
  {
    id: '3',
    name: '指标变更订阅服务',
    type: '订阅',
    protocol: 'MQTT',
    qps: 800,
    calls: 420000,
    status: '已发布',
  },
  {
    id: '4',
    name: '能耗报表查询服务',
    type: '查询',
    protocol: 'GraphQL',
    qps: 200,
    calls: 95000,
    status: '待审核',
  },
  {
    id: '5',
    name: '任务状态推送服务',
    type: '推送',
    protocol: 'REST',
    qps: 600,
    calls: 310000,
    status: '已下线',
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
  if (s === '已发布') return 'ok';
  if (s === '待审核') return 'warn';
  if (s === '已下线') return 'mute';
  return 'info';
}

function typeClass(t: string) {
  if (t === '查询') return 'info';
  if (t === '推送') return 'purple';
  return 'ok';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据服务管理</div>
    <header class="head">
      <div>
        <h2>数据服务管理</h2>
        <p>统一管理数据查询、推送与订阅服务，监控 QPS 与调用量。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('注册新服务（示例）')"
        >
          + 注册服务
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          服务名称
          <input v-model="keyword" placeholder="请输入服务名称" />
        </label>
        <label>
          类型
          <select v-model="type">
            <option>全部</option>
            <option>查询</option>
            <option>推送</option>
            <option>订阅</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>已发布</option>
            <option>待审核</option>
            <option>已下线</option>
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
              <th>服务名</th>
              <th>类型</th>
              <th>协议</th>
              <th>QPS</th>
              <th>调用量</th>
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
              <td>{{ r.protocol }}</td>
              <td>{{ r.qps.toLocaleString() }}</td>
              <td>{{ r.calls.toLocaleString() }}</td>
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
                  v-if="r.status === '已发布'"
                  type="button"
                  class="link warn"
                  @click="ElMessage.success(`下线 ${r.name}（示例）`)"
                >
                  下线
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
