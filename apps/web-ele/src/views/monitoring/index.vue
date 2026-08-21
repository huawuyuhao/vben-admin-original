<script lang="ts" setup>
const stats = [
  {
    label: '校核任务总量',
    value: '1,286',
    unit: '',
    tip: '↑ 8.2% 本周',
    cardClass: '',
  },
  {
    label: '校核成功率',
    value: '96.8',
    unit: '%',
    tip: '↑ 1.5%',
    cardClass: 'green',
  },
  {
    label: '自动化覆盖率',
    value: '82.5',
    unit: '%',
    tip: '↑ 3.2%',
    cardClass: 'blue',
  },
  {
    label: '调度损失降低率',
    value: '15.3',
    unit: '%',
    tip: '↑ 2.8%',
    cardClass: 'orange',
  },
];

const eventBars = [
  {
    label: '任务执行',
    value: '486',
    h: 85,
    color: 'linear-gradient(180deg,#8B7AFF,#6B4CFF)',
  },
  {
    label: '策略匹配',
    value: '312',
    h: 58,
    color: 'linear-gradient(180deg,#5AE89A,#00C853)',
  },
  {
    label: '告警触发',
    value: '245',
    h: 45,
    color: 'linear-gradient(180deg,#64B5F6,#2196F3)',
  },
  {
    label: '预警分布',
    value: '168',
    h: 32,
    color: 'linear-gradient(180deg,#FFB74D,#FF9800)',
  },
  {
    label: '异常处理',
    value: '75',
    h: 15,
    color: 'linear-gradient(180deg,#E57373,#F44336)',
  },
];

const alertLevels = [
  { label: '🔴 紧急告警', count: '3 条', pct: 15, color: '#F44336' },
  { label: '🟡 重要告警', count: '12 条', pct: 40, color: '#FF9800' },
  { label: '🔵 一般告警', count: '28 条', pct: 65, color: '#6B4CFF' },
  { label: '🟢 提示信息', count: '45 条', pct: 85, color: '#00C853' },
];

const rows = [
  {
    name: 'CPU 平均利用率',
    value: '65.2%',
    threshold: '85%',
    status: '正常',
    time: '2026-08-20 15:30',
  },
  {
    name: '内存使用率',
    value: '72.8%',
    threshold: '90%',
    status: '正常',
    time: '2026-08-20 15:30',
  },
  {
    name: 'GPU 利用率',
    value: '78.5%',
    threshold: '95%',
    status: '正常',
    time: '2026-08-20 15:30',
  },
  {
    name: '网络带宽利用率',
    value: '88.2%',
    threshold: '85%',
    status: '预警',
    time: '2026-08-20 15:30',
  },
  {
    name: '存储使用率',
    value: '56.3%',
    threshold: '80%',
    status: '正常',
    time: '2026-08-20 15:30',
  },
  {
    name: '策略校核队列长度',
    value: '23',
    threshold: '50',
    status: '正常',
    time: '2026-08-20 15:30',
  },
  {
    name: '算法执行平均耗时',
    value: '1.25s',
    threshold: '3s',
    status: '正常',
    time: '2026-08-20 15:30',
  },
];

function statusClass(s: string) {
  return s === '正常' ? 'portal-badge-success' : 'portal-badge-warning';
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>策略校核监控</h2>
      <p>
        实现对策略校核任务的实时监控与分析，系统监控任务队列长度、算法执行耗时、并行任务数量等关键指标。
      </p>
    </div>

    <div class="portal-stat-grid">
      <div
        v-for="item in stats"
        :key="item.label"
        class="portal-stat-card"
        :class="item.cardClass"
      >
        <div class="portal-stat-label">{{ item.label }}</div>
        <div class="portal-stat-value">
          {{ item.value
          }}<span v-if="item.unit" class="portal-stat-unit">{{ item.unit }}</span>
        </div>
        <div class="portal-stat-trend up">{{ item.tip }}</div>
      </div>
    </div>

    <div class="portal-two-col" style="margin-bottom: 20px">
      <div class="portal-card">
        <div class="portal-card-title">校核事件类型分布</div>
        <div class="portal-bar-chart">
          <div v-for="bar in eventBars" :key="bar.label" class="portal-bar-col">
            <div class="portal-bar-value">{{ bar.value }}</div>
            <div
              class="portal-bar"
              :style="{ height: `${bar.h}%`, background: bar.color }"
            ></div>
            <div class="portal-bar-label">{{ bar.label }}</div>
          </div>
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-card-title">告警等级分布</div>
        <div
          v-for="item in alertLevels"
          :key="item.label"
          class="level-item"
        >
          <div class="level-head">
            <span>{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
          </div>
          <div class="portal-progress-bar">
            <div
              class="fill"
              :style="{ width: `${item.pct}%`, background: item.color }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="portal-card" style="padding: 0; overflow: hidden">
      <div class="table-head">
        <span class="table-title">系统运行状态</span>
        <button class="portal-btn portal-btn-outline portal-btn-sm" type="button">
          导出日志
        </button>
      </div>
      <table class="portal-data-table">
        <thead>
          <tr>
            <th>监控指标</th>
            <th>当前值</th>
            <th>预警阈值</th>
            <th>状态</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.value }}</td>
            <td>{{ row.threshold }}</td>
            <td>
              <span class="portal-badge" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.level-item {
  margin-bottom: 16px;
}

.level-item:last-child {
  margin-bottom: 0;
}

.level-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--portal-gray-200, #eee);
}

.table-title {
  font-size: 15px;
  font-weight: 700;
}
</style>
