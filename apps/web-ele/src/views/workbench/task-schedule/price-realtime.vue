<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { realtimePlanRows } from '#/views/_shared/data/task-schedule';

defineOptions({ name: 'TsPriceRealtime' });

const tab = ref<'当前轮次' | '调度依据' | '历史记录'>('当前轮次');
const steps = [
  '调度触发',
  '电价采集',
  '输入读取',
  '方案生成',
  '约束核验',
  '任务分配',
  '结果评估',
];
const activeStep = 6;
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>电价优先实时本地调度策略</h2>
        <p>以实时电价为驱动，每 15 分钟动态生成本地实时调度方案。</p>
      </div>
      <div class="head-actions">
        <span class="pill run">自动调度运行中</span>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <div class="alert">
      当前轮次有 2 个节点接近利用率上限，910B-Rack-A02 为 24MW / 252kW，建议优先调整任务分配。
    </div>

    <div class="tabs">
      <button
        v-for="t in ['当前轮次', '调度依据', '历史记录']"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: tab === t }"
        @click="tab = t as typeof tab"
      >
        {{ t }}
      </button>
    </div>

    <template v-if="tab === '当前轮次'">
      <div class="info-bar">
        <span>当前时段 14:00-14:15</span>
        <span>批次号 20240723-1400</span>
        <span>最近更新 14:00:02</span>
        <span>下次更新 14:15:00</span>
        <em class="ok">结果评估完成</em>
      </div>

      <section class="card">
        <div class="card-title">
          当前轮次调度流程
          <small>自动调度频率：每 15 分钟一次</small>
        </div>
        <ol class="steps">
          <li
            v-for="(s, i) in steps"
            :key="s"
            :class="{ done: i < activeStep, current: i === activeStep }"
          >
            <i>{{ i < activeStep ? '✓' : i + 1 }}</i>
            <span>{{ s }}</span>
          </li>
        </ol>
      </section>

      <div class="kpi-row">
        <div class="kpi"><strong>76.4%</strong><span>算力利用率</span></div>
        <div class="kpi"><strong>--</strong><span>实际电费（结算后）</span></div>
        <div class="kpi warn"><strong>2 节点</strong><span>边网约束告警</span></div>
        <div class="kpi"><strong>14:14:38</strong><span>本轮剩余时间</span></div>
      </div>

      <div class="summary-row">
        <div class="summary">
          <h4>电价状态摘要</h4>
          <p class="price">0.61 元/kWh</p>
          <div class="tags">
            <span class="ok">采集正常</span>
            <span class="ok">策略通过</span>
          </div>
        </div>
        <div class="summary warn">
          <h4>边网约束摘要</h4>
          <p>2 个节点达到告警阈值，最高利用率 99.2%</p>
          <span class="warn-tag">需关注</span>
        </div>
      </div>

      <section class="card">
        <div class="card-title">
          当前轮次调度方案（14:00-14:15）
          <div class="right">
            <button class="btn" type="button" @click="ElMessage.success('已导出')">
              导出
            </button>
            <button
              class="btn primary"
              type="button"
              @click="ElMessage.info('打开任务调整（示例）')"
            >
              调整任务分配
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>计算节点</th>
              <th>开始</th>
              <th>结束</th>
              <th>预计功耗</th>
              <th>计划状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in realtimePlanRows" :key="i">
              <td>{{ r.task }}</td>
              <td>{{ r.node }}</td>
              <td>{{ r.start }}</td>
              <td>{{ r.end }}</td>
              <td>{{ r.power }}</td>
              <td>
                <span class="badge" :class="r.status === '运行中' ? 'run' : 'mute'">
                  {{ r.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="footer ok">
        <div>
          <strong>本轮调度评估：正常</strong>
          <p>
            全部任务在可用窗口完成，功耗约束满足，2 节点接近上限，利用率 76.4%，实际成本待结算数据入库后计算。
          </p>
        </div>
        <div class="footer-btns">
          <button class="btn" type="button">查看优化闭环</button>
          <button class="btn" type="button">历史周评价</button>
        </div>
      </div>
    </template>

    <div v-else class="empty card">
      {{ tab }} 示例页：可继续按业务扩展电价曲线、历史批次对比等内容。
    </div>
  </div>
</template>

<style scoped>
@import './shared.css';
</style>
