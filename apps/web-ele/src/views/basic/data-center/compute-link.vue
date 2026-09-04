<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { computeDevices, subscriptions } from '#/views/_shared/data/basic-data-center';

defineOptions({ name: 'DcComputeLink' });

const tab = ref<'device' | 'resource' | 'subscribe'>('resource');
const deviceStatus = ref('全部');

const filteredDevices = computed(() => {
  if (deviceStatus.value === '全部') return computeDevices;
  return computeDevices.filter((r) => r.status === deviceStatus.value);
});

const offlineDevices = computed(() => computeDevices.filter((d) => d.status === '离线'));

function statusClass(s: string) {
  if (s === '在线' || s === '活跃') return 'ok';
  if (s === '离线' || s === '暂停') return 'danger';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 算力连接管理</div>
    <header class="head">
      <div>
        <h2>算力连接管理</h2>
        <p>统一管理资源与能效分析、设备连接运维和数据发布订阅</p>
      </div>
    </header>

    <div v-if="offlineDevices.length" class="alert-bar danger">
      <span class="alert-icon">⚠</span>
      {{ offlineDevices.length }} 台设备离线：{{ offlineDevices.map((d) => d.name).join('、') }}
    </div>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'resource' }" @click="tab = 'resource'">
        资源与能效分析
      </button>
      <button type="button" :class="{ active: tab === 'device' }" @click="tab = 'device'">
        设备连接运维
      </button>
      <button type="button" :class="{ active: tab === 'subscribe' }" @click="tab = 'subscribe'">
        数据发布订阅
      </button>
    </div>

    <!-- 资源与能效分析 -->
    <template v-if="tab === 'resource'">
      <div class="progress-cards">
        <div class="progress-card">
          <div class="progress-head">
            <span>供电容量</span>
            <strong>4.8 / 6.1 MW</strong>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 78.7%"></div></div>
          <span class="progress-label">使用率 78.7%</span>
        </div>
        <div class="progress-card">
          <div class="progress-head">
            <span>制冷容量</span>
            <strong>4.2 / 5.3 MW</strong>
          </div>
          <div class="progress-bar"><div class="progress-fill cooling" style="width: 79.2%"></div></div>
          <span class="progress-label">使用率 79.2%</span>
        </div>
        <div class="progress-card">
          <div class="progress-head">
            <span>算力容量</span>
            <strong>1,180 / 1,380 GPU</strong>
          </div>
          <div class="progress-bar"><div class="progress-fill compute" style="width: 85.5%"></div></div>
          <span class="progress-label">使用率 85.5%</span>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi"><strong>1.42</strong><span>实时 PUE</span></div>
        <div class="kpi"><strong>0.82</strong><span>算力能效比</span></div>
        <div class="kpi"><strong>92.4%</strong><span>绿电占比</span></div>
        <div class="kpi"><strong>6.2 MW</strong><span>实时总功耗</span></div>
      </div>

      <section class="card chart-card">
        <h3 class="section-title">能效趋势（近7天）</h3>
        <div class="bar-chart">
          <div v-for="(label, i) in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="label" class="bar-col">
            <div class="bar-group">
              <div class="bar pue" :style="{ height: `${40 + i * 3}%` }"></div>
              <div class="bar power" :style="{ height: `${55 + i * 2}%` }"></div>
            </div>
            <span>{{ label }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <span><i class="dot pue"></i>PUE</span>
          <span><i class="dot power"></i>功耗(MW)</span>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">能效告警</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>告警内容</th>
                <th>级别</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-08-24 15:30</td>
                <td>GPU-A区利用率超过 85% 阈值</td>
                <td><span class="tag warn">警告</span></td>
                <td><span class="tag info">处理中</span></td>
              </tr>
              <tr>
                <td>2026-08-24 14:20</td>
                <td>P600-B02 采集节点离线，影响能效统计</td>
                <td><span class="tag danger">严重</span></td>
                <td><span class="tag warn">未恢复</span></td>
              </tr>
              <tr>
                <td>2026-08-23 22:00</td>
                <td>冷站-1# 制冷效率低于基准值</td>
                <td><span class="tag warn">警告</span></td>
                <td><span class="tag ok">已恢复</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 设备连接运维 -->
    <template v-if="tab === 'device'">
      <div class="kpi-row">
        <div class="kpi"><strong>6</strong><span>设备总数</span></div>
        <div class="kpi"><strong>5</strong><span>在线</span></div>
        <div class="kpi"><strong>1</strong><span>离线</span></div>
        <div class="kpi"><strong>99.5%</strong><span>平均成功率</span></div>
      </div>

      <section class="card">
        <div class="filter">
          <label>设备名称<input placeholder="请输入设备名称" /></label>
          <label>协议类型<select><option>全部</option><option>Modbus TCP</option><option>SNMP v3</option><option>OPC UA</option></select></label>
          <label>
            状态
            <select v-model="deviceStatus">
              <option>全部</option>
              <option>在线</option>
              <option>离线</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增设备（示例）')">
            + 新增设备
          </button>
          <span class="count">共 {{ filteredDevices.length }} 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>设备名称</th>
                <th>类型</th>
                <th>协议</th>
                <th>IP</th>
                <th>状态</th>
                <th>延迟</th>
                <th>成功率</th>
                <th>最后同步</th>
                <th>错误数</th>
                <th>告警</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredDevices" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.type }}</td>
                <td>{{ r.protocol }}</td>
                <td>{{ r.ip }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td>{{ r.latency }}</td>
                <td>{{ r.successRate }}</td>
                <td>{{ r.sync }}</td>
                <td>{{ r.error }}</td>
                <td>{{ r.alarms }}</td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('诊断（示例）')">诊断</button>
                  <button type="button" class="link" @click="ElMessage.success('配置（示例）')">配置</button>
                  <button
                    v-if="r.status === '离线'"
                    type="button"
                    class="link warn"
                    @click="ElMessage.success('重连（示例）')"
                  >
                    重连
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">最近告警</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>设备</th>
                <th>告警内容</th>
                <th>级别</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-08-24 14:20:00</td>
                <td>P600-B02采集节点</td>
                <td>设备离线，连续 156 次采集失败</td>
                <td><span class="tag danger">严重</span></td>
              </tr>
              <tr>
                <td>2026-08-24 12:05:00</td>
                <td>OPC UA客户端-冷站</td>
                <td>连接延迟超过 20ms 阈值</td>
                <td><span class="tag warn">警告</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 数据发布订阅 -->
    <template v-if="tab === 'subscribe'">
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增订阅（示例）')">
            + 新增订阅
          </button>
          <span class="count">共 {{ subscriptions.length }} 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>订阅方</th>
                <th>数据类型</th>
                <th>推送频率</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in subscriptions" :key="r.id">
                <td>{{ r.subscriber }}</td>
                <td>{{ r.dataType }}</td>
                <td>{{ r.freq }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">编辑</button>
                  <button
                    type="button"
                    class="link"
                    :class="r.status === '活跃' ? 'warn' : 'ok'"
                    @click="ElMessage.success(r.status === '活跃' ? '暂停（示例）' : '启用（示例）')"
                  >
                    {{ r.status === '活跃' ? '暂停' : '启用' }}
                  </button>
                  <button type="button" class="link danger" @click="ElMessage.success('删除（示例）')">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 {{ subscriptions.length }} 条，共 {{ subscriptions.length }} 条记录</div>
      </section>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.alert-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #e6a23c;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 8px;
}

.alert-bar.danger {
  color: #f56c6c;
  background: #fef0f0;
  border-color: #fbc4c4;
}

.alert-icon {
  font-size: 16px;
}

.page-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.page-tabs button {
  flex: 1;
  height: 40px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 1px solid #ebeef5;
}

.page-tabs button:last-child {
  border-right: none;
}

.page-tabs button.active {
  font-weight: 500;
  color: #409eff;
  background: #ecf5ff;
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.progress-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
}

.progress-head span {
  color: #909399;
}

.progress-head strong {
  font-size: 14px;
  color: #303133;
}

.progress-bar {
  height: 8px;
  overflow: hidden;
  background: #ebeef5;
  border-radius: 4px;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  border-radius: 4px;
}

.progress-fill.cooling {
  background: #67c23a;
}

.progress-fill.compute {
  background: #6b4cff;
}

.progress-label {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
}

.chart-card {
  padding-bottom: 20px;
}

.bar-chart {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 160px;
  padding: 0 8px;
}

.bar-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.bar-group {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  width: 100%;
  height: 100%;
}

.bar-group .bar {
  flex: 1;
  min-height: 4px;
  border-radius: 2px 2px 0 0;
}

.bar.pue {
  background: #409eff;
}

.bar.power {
  background: #67c23a;
}

.bar-col span {
  font-size: 11px;
  color: #c0c4cc;
}

.chart-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}

.chart-legend span {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.dot.pue {
  background: #409eff;
}

.dot.power {
  background: #67c23a;
}

@media (max-width: 1100px) {
  .progress-cards {
    grid-template-columns: 1fr;
  }
}
</style>
