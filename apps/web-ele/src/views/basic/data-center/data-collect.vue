<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcDataCollect' });

interface CollectTask {
  id: string;
  name: string;
  source: string;
  type: string;
  cycle: string;
  lastRun: string;
  successRate: number;
  status: string;
}

const rows: CollectTask[] = [
  {
    id: '1',
    name: '电力负荷实时采集',
    source: 'SCADA-华东',
    type: '实时流',
    cycle: '5 秒',
    lastRun: '2026-08-24 16:20',
    successRate: 99.8,
    status: '运行中',
  },
  {
    id: '2',
    name: '算力节点指标采集',
    source: 'K8s-Metrics',
    type: '定时拉取',
    cycle: '1 分钟',
    lastRun: '2026-08-24 16:19',
    successRate: 98.5,
    status: '运行中',
  },
  {
    id: '3',
    name: '温湿度传感器采集',
    source: 'IoT-Gateway',
    type: 'MQTT 订阅',
    cycle: '30 秒',
    lastRun: '2026-08-24 16:18',
    successRate: 97.2,
    status: '异常',
  },
  {
    id: '4',
    name: '碳排放核算数据采集',
    source: 'Carbon-API',
    type: '定时拉取',
    cycle: '15 分钟',
    lastRun: '2026-08-24 16:00',
    successRate: 99.1,
    status: '运行中',
  },
  {
    id: '5',
    name: '网络流量镜像采集',
    source: 'NetFlow-Probe',
    type: '实时流',
    cycle: '10 秒',
    lastRun: '2026-08-24 15:55',
    successRate: 96.0,
    status: '已暂停',
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
  running: rows.filter((r) => r.status === '运行中').length,
  avgRate: (rows.reduce((s, r) => s + r.successRate, 0) / rows.length).toFixed(1),
  abnormal: rows.filter((r) => r.status === '异常').length,
}));

function statusClass(s: string) {
  if (s === '运行中') return 'ok';
  if (s === '异常') return 'danger';
  if (s === '已暂停') return 'warn';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据采集</div>
    <header class="head">
      <div>
        <h2>数据采集</h2>
        <p>管理各数据源采集任务，监控执行周期与成功率。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新建采集任务（示例）')"
        >
          + 新建任务
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi">
        <strong>{{ kpis.total }}</strong>
        <span>采集任务总数</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.running }}</strong>
        <span>运行中任务</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.avgRate }}%</strong>
        <span>平均成功率</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.abnormal }}</strong>
        <span>异常任务</span>
      </div>
    </div>

    <section class="card">
      <div class="filter">
        <label>
          任务名称
          <input v-model="keyword" placeholder="请输入任务名称" />
        </label>
        <label>
          采集类型
          <select v-model="type">
            <option>全部</option>
            <option>实时流</option>
            <option>定时拉取</option>
            <option>MQTT 订阅</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>运行中</option>
            <option>异常</option>
            <option>已暂停</option>
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
              <th>任务名</th>
              <th>数据源</th>
              <th>采集类型</th>
              <th>周期</th>
              <th>最近执行</th>
              <th>成功率</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>{{ r.source }}</td>
              <td>{{ r.type }}</td>
              <td>{{ r.cycle }}</td>
              <td>{{ r.lastRun }}</td>
              <td>{{ r.successRate }}%</td>
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
                  v-if="r.status === '已暂停'"
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
                  @click="ElMessage.success(`暂停 ${r.name}（示例）`)"
                >
                  暂停
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
