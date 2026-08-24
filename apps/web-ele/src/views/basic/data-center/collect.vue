<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { collectObjects } from '#/views/_shared/data/basic-data-center';

defineOptions({ name: 'DcCollect' });

const tab = ref<'config' | 'monitor' | 'query'>('config');
const keyword = ref('');
const typeFilter = ref('全部');
const statusFilter = ref('全部');

const filtered = computed(() => {
  let rows = [...collectObjects];
  if (keyword.value.trim()) {
    rows = rows.filter((r) => r.name.includes(keyword.value.trim()));
  }
  if (typeFilter.value !== '全部') {
    rows = rows.filter((r) => r.type === typeFilter.value);
  }
  if (statusFilter.value !== '全部') {
    rows = rows.filter((r) => r.status === statusFilter.value);
  }
  return rows;
});

function statusClass(s: string) {
  if (s === '正常') return 'ok';
  if (s === '异常') return 'danger';
  if (s === '暂停') return 'warn';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 电力、算力数据高频采集</div>
    <header class="head">
      <div>
        <h2>电力、算力数据高频采集</h2>
        <p>统一管理采集配置，实时运行监控和历史数据查询导出</p>
      </div>
    </header>

    <div class="alert-bar">
      <span class="alert-icon">⚠</span>
      P600-机架-B02 采集异常，最后心跳 14:20:00，请检查 Modbus 网关连接状态
    </div>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'config' }" @click="tab = 'config'">
        采集配置
      </button>
      <button type="button" :class="{ active: tab === 'monitor' }" @click="tab = 'monitor'">
        运行监控
      </button>
      <button type="button" :class="{ active: tab === 'query' }" @click="tab = 'query'">
        数据查询与导出
      </button>
    </div>

    <!-- 采集配置 -->
    <template v-if="tab === 'config'">
      <div class="kpi-row">
        <div class="kpi"><strong>32</strong><span>采集对象总数</span></div>
        <div class="kpi"><strong>25</strong><span>正常运行</span></div>
        <div class="kpi"><strong>3</strong><span>异常/离线</span></div>
        <div class="kpi"><strong>4</strong><span>暂停采集</span></div>
      </div>

      <section class="card">
        <div class="filter">
          <label>采集对象<input v-model="keyword" placeholder="请输入名称" /></label>
          <label>
            类型
            <select v-model="typeFilter">
              <option>全部</option>
              <option>电力</option>
              <option>算力</option>
              <option>制冷</option>
              <option>网络</option>
              <option>存储</option>
            </select>
          </label>
          <label>
            状态
            <select v-model="statusFilter">
              <option>全部</option>
              <option>正常</option>
              <option>异常</option>
              <option>暂停</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="btn" type="button">重置</button>
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="toolbar">
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('新增采集对象（示例）')"
          >
            + 新增采集对象
          </button>
          <span class="count">共 {{ filtered.length }} 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>采集对象</th>
                <th>类型</th>
                <th>采集方式</th>
                <th>频率</th>
                <th>指标项</th>
                <th>最后采集时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filtered" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.type }}</td>
                <td>{{ r.method }}</td>
                <td>{{ r.freq }}</td>
                <td>{{ r.metrics }}</td>
                <td>{{ r.lastTime }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">
                    编辑
                  </button>
                  <button type="button" class="link warn" @click="ElMessage.success('暂停（示例）')">
                    暂停
                  </button>
                  <button type="button" class="link danger" @click="ElMessage.success('删除（示例）')">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
      </section>
    </template>

    <!-- 运行监控 -->
    <template v-if="tab === 'monitor'">
      <div class="kpi-row">
        <div class="kpi"><strong>98.2%</strong><span>采集成功率</span></div>
        <div class="kpi"><strong>1.2s</strong><span>平均延迟</span></div>
        <div class="kpi"><strong>2.4M</strong><span>今日数据点</span></div>
        <div class="kpi"><strong>3</strong><span>当前告警</span></div>
      </div>

      <section class="card chart-card">
        <h3 class="section-title">采集吞吐量趋势（近24h）</h3>
        <div class="line-chart">
          <div v-for="i in 24" :key="i" class="bar-col">
            <div class="bar" :style="{ height: `${30 + Math.sin(i) * 20 + i * 1.5}%` }" />
            <span>{{ i }}h</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">运行状态</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>采集对象</th>
                <th>类型</th>
                <th>最后采集时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in collectObjects" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.type }}</td>
                <td>{{ r.lastTime }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('查看详情（示例）')">
                    详情
                  </button>
                  <button
                    v-if="r.status === '异常'"
                    type="button"
                    class="link warn"
                    @click="ElMessage.success('重试采集（示例）')"
                  >
                    重试
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 数据查询与导出 -->
    <template v-if="tab === 'query'">
      <section class="card">
        <div class="filter">
          <label>采集对象<input placeholder="请输入采集对象名称" /></label>
          <label>数据类型<select><option>全部</option><option>电力</option><option>算力</option></select></label>
          <label>开始时间<input type="datetime-local" /></label>
          <label>结束时间<input type="datetime-local" /></label>
          <div class="filter-actions">
            <button class="btn" type="button">重置</button>
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
      </section>

      <div class="kpi-row">
        <div class="kpi"><strong>128,456</strong><span>查询结果条数</span></div>
        <div class="kpi"><strong>6</strong><span>涉及采集对象</span></div>
        <div class="kpi"><strong>24h</strong><span>时间跨度</span></div>
        <div class="kpi"><strong>98.5%</strong><span>数据完整率</span></div>
      </div>

      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('导出 CSV（示例）')">
            导出 CSV
          </button>
          <button class="btn" type="button" @click="ElMessage.success('导出 Excel（示例）')">
            导出 Excel
          </button>
          <span class="count">共 128,456 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>采集对象</th>
                <th>类型</th>
                <th>指标</th>
                <th>数值</th>
                <th>单位</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-08-24 15:58:02</td>
                <td>P600-机架-B02 电力采集</td>
                <td>电力</td>
                <td>实时功率</td>
                <td>6.2</td>
                <td>kW</td>
              </tr>
              <tr>
                <td>2026-08-24 15:58:05</td>
                <td>GPU-A区-算力负载</td>
                <td>算力</td>
                <td>GPU利用率</td>
                <td>87.3</td>
                <td>%</td>
              </tr>
              <tr>
                <td>2026-08-24 15:57:50</td>
                <td>冷站-1# 制冷功率</td>
                <td>制冷</td>
                <td>冷量</td>
                <td>412</td>
                <td>RT</td>
              </tr>
              <tr>
                <td>2026-08-24 15:57:30</td>
                <td>UPS-3A 备电状态</td>
                <td>电力</td>
                <td>负载率</td>
                <td>73.6</td>
                <td>%</td>
              </tr>
              <tr>
                <td>2026-08-24 15:58:01</td>
                <td>存储阵列-IOPS</td>
                <td>存储</td>
                <td>IOPS</td>
                <td>45,200</td>
                <td>次/s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 5 条，共 128,456 条记录</div>
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
  color: #e6a23c;
  font-size: 13px;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 8px;
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
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 1px solid #ebeef5;
}

.page-tabs button:last-child {
  border-right: none;
}

.page-tabs button.active {
  color: #409eff;
  font-weight: 500;
  background: #ecf5ff;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
}

.chart-card {
  padding-bottom: 20px;
}

.line-chart {
  display: flex;
  gap: 4px;
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
  height: 100%;
  justify-content: flex-end;
}

.bar-col .bar {
  width: 100%;
  min-height: 4px;
  background: linear-gradient(180deg, #409eff, #a0cfff);
  border-radius: 2px 2px 0 0;
}

.bar-col span {
  color: #c0c4cc;
  font-size: 10px;
}
</style>
