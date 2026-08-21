<script lang="ts" setup>
const stats = [
  {
    label: '总算力利用率',
    value: '78.5',
    unit: '%',
    tip: '↑ 5.2% 较昨日',
    tipClass: 'up',
    cardClass: '',
  },
  {
    label: '绿电消纳占比',
    value: '85.3',
    unit: '%',
    tip: '↑ 3.8% 较昨日',
    tipClass: 'up',
    cardClass: 'green',
  },
  {
    label: '今日调度任务',
    value: '2,486',
    unit: '',
    tip: '↑ 12.5% 较昨日',
    tipClass: 'up',
    cardClass: 'blue',
  },
  {
    label: '告警数量',
    value: '7',
    unit: '',
    tip: '↓ 3 较昨日',
    tipClass: 'down',
    cardClass: 'orange',
  },
];

const resourceLegend = [
  { name: 'GPU 算力', value: '280 PFLOPS', color: '#6B4CFF' },
  { name: 'CPU 算力', value: '130 PFLOPS', color: '#00C853' },
  { name: '存储容量', value: '60 PB', color: '#2196F3' },
  { name: '边缘算力', value: '30 PFLOPS', color: '#FF9800' },
];

const powerBars = [
  { label: '8/14', value: '12.5K', h: 60 },
  { label: '8/15', value: '14.2K', h: 68 },
  { label: '8/16', value: '11.8K', h: 56 },
  { label: '8/17', value: '16.5K', h: 82 },
  { label: '8/18', value: '15.3K', h: 75 },
  { label: '8/19', value: '18.2K', h: 92 },
  { label: '8/20', value: '17.6K', h: 88 },
];

const carbonBars = [
  { label: '8/14', value: '3.2T', h: 45 },
  { label: '8/15', value: '3.5T', h: 52 },
  { label: '8/16', value: '2.9T', h: 42 },
  { label: '8/17', value: '4.1T', h: 62 },
  { label: '8/18', value: '3.8T', h: 56 },
  { label: '8/19', value: '4.5T', h: 68 },
  { label: '8/20', value: '4.2T', h: 63 },
];

const taskProgress = [
  { label: '任务调度率', value: '93.2%', pct: 93, fillClass: '' },
  { label: '策略校核成功率', value: '96.8%', pct: 97, fillClass: 'green' },
  { label: '在运应用实例', value: '156 个', pct: 72, fillClass: '' },
  { label: 'GPU 资源占用', value: '78%', pct: 78, fillClass: 'orange' },
];

const alerts = [
  {
    type: 'danger',
    icon: '🔴',
    title: 'GPU 利用率超阈值',
    desc: '贵州A区节点 GPU-03 利用率达 98%',
    time: '2 分钟前',
  },
  {
    type: 'warning',
    icon: '🟡',
    title: '网络延迟升高',
    desc: '广州B区网络延迟 45ms，超预警阈值',
    time: '15 分钟前',
  },
  {
    type: 'warning',
    icon: '🟡',
    title: '绿电占比下降',
    desc: '惠州D区绿电占比降至 55%，低于预警线',
    time: '1 小时前',
  },
  {
    type: 'info',
    icon: '🔵',
    title: '策略校核完成',
    desc: '日前调度策略校核通过，可执行',
    time: '2 小时前',
  },
];

const mapPins = [
  { top: '35%', left: '25%', color: '#6B4CFF', title: '贵州数据中心' },
  { top: '45%', left: '50%', color: '#00C853', title: '广州数据中心' },
  { top: '55%', left: '58%', color: '#2196F3', title: '惠州数据中心' },
  { top: '30%', left: '40%', color: '#FF9800', title: '边缘节点' },
  { top: '60%', left: '35%', color: '#FF9800', title: '边缘节点' },
  { top: '50%', left: '70%', color: '#FF9800', title: '边缘节点' },
];
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>全景看板</h2>
      <p>
        通过获取的算力、电价、碳排放、算力任务和系统运行等数据，实现算力资源与调度任务运行状态的全景化展示。
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
          }}<span v-if="item.unit" class="portal-stat-unit">{{
            item.unit
          }}</span>
        </div>
        <div class="portal-stat-trend" :class="item.tipClass">
          {{ item.tip }}
        </div>
      </div>
    </div>

    <div class="wb-map-row">
      <div class="portal-card">
        <div class="portal-card-title">
          <span>基于地图的算力网服务</span>
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
          >
            下钻详情
          </button>
        </div>
        <div class="portal-map-area">
          <div class="portal-map-bg"></div>
          <div
            v-for="(pin, idx) in mapPins"
            :key="idx"
            class="portal-map-pin"
            :style="{
              top: pin.top,
              left: pin.left,
              background: pin.color,
            }"
            :title="pin.title"
          ></div>
          <div class="map-legend">
            <span>🟣 贵州</span>
            <span>🟢 广州</span>
            <span>🔵 惠州</span>
            <span>🟠 边缘节点</span>
          </div>
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-card-title">
          <span>算力资源汇总分析</span>
          <button class="portal-btn-text portal-btn-sm" type="button">
            查看详情
          </button>
        </div>
        <div class="resource-row">
          <div class="portal-donut-chart">
            <div class="portal-donut-inner">
              <div class="num">500<span style="font-size: 14px">P</span></div>
              <div class="lbl">总算力</div>
            </div>
          </div>
          <div class="resource-legend">
            <div
              v-for="item in resourceLegend"
              :key="item.name"
              class="legend-item"
            >
              <span class="dot" :style="{ background: item.color }"></span>
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
        <div class="usage-block">
          <div class="usage-label">GPU 利用率：78%</div>
          <div class="portal-progress-bar">
            <div class="fill" style="width: 78%"></div>
          </div>
          <div class="usage-label">CPU 利用率：65%</div>
          <div class="portal-progress-bar">
            <div class="fill green" style="width: 65%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="portal-two-col" style="margin-bottom: 20px">
      <div class="portal-card">
        <div class="portal-card-title">
          <span>能耗分析 - 用电量趋势</span>
          <span class="sub">近7天</span>
        </div>
        <div class="portal-bar-chart">
          <div
            v-for="bar in powerBars"
            :key="bar.label"
            class="portal-bar-col"
          >
            <div class="portal-bar-value">{{ bar.value }}</div>
            <div class="portal-bar" :style="{ height: `${bar.h}%` }"></div>
            <div class="portal-bar-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="chart-footer">
          <span>📊 总用电量：<strong>106.1 K kWh</strong></span>
          <span>
            🍃 绿电消纳：
            <strong style="color: var(--portal-green)">90.5 K kWh (85.3%)</strong>
          </span>
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-card-title">
          <span>碳排放趋势分析</span>
          <span class="sub">近7天</span>
        </div>
        <div class="portal-bar-chart">
          <div
            v-for="bar in carbonBars"
            :key="bar.label"
            class="portal-bar-col"
          >
            <div class="portal-bar-value">{{ bar.value }}</div>
            <div
              class="portal-bar"
              :style="{
                height: `${bar.h}%`,
                background: 'linear-gradient(180deg, #81c784, #4caf50)',
              }"
            ></div>
            <div class="portal-bar-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="chart-footer">
          <span>🍃 总碳排放：<strong>26.2 T CO₂</strong></span>
          <span>
            📉 同比下降：
            <strong style="color: var(--portal-green)">8.5%</strong>
          </span>
        </div>
      </div>
    </div>

    <div class="portal-two-col">
      <div class="portal-card">
        <div class="portal-card-title">
          <span>任务过程分析</span>
          <button class="portal-btn-text portal-btn-sm" type="button">
            查看详情
          </button>
        </div>
        <div
          v-for="item in taskProgress"
          :key="item.label"
          class="progress-item"
        >
          <div class="progress-head">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <div class="portal-progress-bar">
            <div
              class="fill"
              :class="item.fillClass"
              :style="{ width: `${item.pct}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-card-title">
          <span>实时告警</span>
          <span class="portal-badge portal-badge-danger">7 条</span>
        </div>
        <div class="portal-alert-list">
          <div
            v-for="(item, idx) in alerts"
            :key="idx"
            class="portal-alert-item"
            :class="item.type"
          >
            <span>{{ item.icon }}</span>
            <div style="flex: 1">
              <strong>{{ item.title }}</strong> - {{ item.desc }}
              <div class="ai-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.wb-map-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.map-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 1;
  display: flex;
  gap: 16px;
  padding: 8px 14px;
  font-size: 12px;
  background: rgb(255 255 255 / 90%);
  border-radius: 8px;
}

.resource-row {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 16px;
}

.resource-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-item strong {
  margin-left: auto;
}

.usage-block {
  padding-top: 16px;
  border-top: 1px solid var(--portal-gray-100, #f5f5f5);
}

.usage-label {
  margin: 10px 0 8px;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
}

.usage-label:first-child {
  margin-top: 0;
}

.portal-card-title .sub {
  font-size: 13px;
  font-weight: 400;
  color: var(--portal-gray-500, #9e9e9e);
}

.chart-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 16px;
  margin-top: 16px;
  font-size: 13px;
  border-top: 1px solid var(--portal-gray-100, #f5f5f5);
}

.progress-item {
  margin-bottom: 14px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .wb-map-row {
    grid-template-columns: 1fr;
  }
}
</style>
