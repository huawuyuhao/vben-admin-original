<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { dayaheadPlanRows } from '#/views/_shared/data/task-schedule';

defineOptions({ name: 'TsPriceDayahead' });

const tab = ref('当前规划');
const steps = [
  '任务周期登记',
  '多周期电价获取',
  '资源简评估',
  '方案生成',
  '方案核查',
  '方案下发',
  '执行监控',
];
const activeStep = 5;

function priceDot(p: string) {
  if (p === '低') return 'low';
  if (p === '中') return 'mid';
  return 'high';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>电价优先日前本地调度策略</h2>
        <p>以多周期电价预测为核心，生成第二天 / 下一周期的日前本地调度方案。</p>
      </div>
      <div class="head-actions">
        <span class="pill ok">方案已生成</span>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="t in ['当前规划', '多周期电价', '任务与资源', '执行监控']"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <template v-if="tab === '当前规划'">
      <div class="info-bar">
        <span>规划日期 2026-07-23</span>
        <span>方案版本 V1</span>
        <span>规划范围：第二天</span>
        <span>计划执行：2026-07-23 00:00</span>
        <em class="ok">方案校验通过</em>
      </div>

      <section class="card">
        <div class="card-title">日前规划流程</div>
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
        <div class="kpi"><strong>4 个</strong><span>规划任务</span></div>
        <div class="kpi"><strong>0.565</strong><span>预测均价 元/kWh</span></div>
        <div class="kpi"><strong>可满足</strong><span>资源简评估</span></div>
        <div class="kpi"><strong>V1</strong><span>当前方案版本</span></div>
      </div>

      <div class="summary-row">
        <div class="summary">
          <h4>电价预测摘要</h4>
          <p>低价时段集中在 03:00-08:00</p>
          <div class="tags">
            <span class="ok">预测已获取</span>
            <span class="ok">数据已核验</span>
          </div>
        </div>
        <div class="summary">
          <h4>任务与资源摘要</h4>
          <p>4 项任务信息完整，资源可满足当前规划</p>
          <div class="tags"><span class="ok">评估通过</span></div>
        </div>
      </div>

      <section class="card">
        <div class="card-title">
          明日调度方案 2026-07-23 V1
          <div class="right">
            <button class="btn" type="button" @click="ElMessage.success('已导出')">
              导出
            </button>
            <button class="btn" type="button" @click="ElMessage.info('重新生成（示例）')">
              重新生成方案
            </button>
            <button
              class="btn primary"
              type="button"
              @click="ElMessage.success('已确认并待执行')"
            >
              确认并待执行
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>时段</th>
              <th>计划任务</th>
              <th>计算节点</th>
              <th>预计功耗</th>
              <th>电价时段</th>
              <th>调度依据</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in dayaheadPlanRows" :key="i">
              <td>{{ r.slot }}</td>
              <td>{{ r.task }}</td>
              <td>{{ r.node }}</td>
              <td>{{ r.power }}</td>
              <td>
                <span class="dot" :class="priceDot(r.price)" />
                {{ r.price }}
              </td>
              <td>{{ r.basis }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="footer ok">
        <div>
          <strong>方案校验通过，可进入执行准备</strong>
          <p>任务时间窗口校验通过 · 算力资源许可满足 · 能耗规划约束满足</p>
        </div>
        <div class="footer-btns">
          <span style="color: #909399; font-size: 12px">
            计划下发时间: 2026-07-23 00:00
          </span>
          <button class="btn primary" type="button">复制执行准备</button>
        </div>
      </div>
    </template>

    <div v-else class="empty card">{{ tab }} 示例内容占位。</div>
  </div>
</template>

<style scoped>
@import './shared.css';

.pill.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.dot.low {
  background: #67c23a;
}

.dot.mid {
  background: #e6a23c;
}

.dot.high {
  background: #f56c6c;
}
</style>
