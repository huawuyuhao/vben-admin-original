<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'TsPowerDayahead' });

const tab = ref('指令明细');
const steps = [
  { name: '指令明细', state: 'done', tip: '已通过' },
  { name: '预测与评估', state: 'done', tip: '预测完成' },
  { name: '编排方案', state: 'current', tip: '待确认' },
  { name: '执行监控', state: 'wait', tip: '等待确认' },
];
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>满足调度功耗的日前本地调度策略</h2>
        <p>根据日前调度指令，完成任务功耗预测、最大功耗评估、日前编排和次日执行监控。</p>
      </div>
      <div class="head-actions">
        <span class="pill run">日前编排进行中</span>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="t in ['指令明细', '预测与评估', '编排方案', '执行监控']"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="info-bar">
      <span>调度日期：明日 2026-07-23</span>
      <span>指令编号：CMD-DA-20260722-001</span>
      <span>已用上限：8300kW</span>
      <span>预测峰值：280kW</span>
      <span>可用余量：+45kW</span>
      <span>方案版本：V1</span>
      <em class="ok">已按预期通过</em>
    </div>

    <section class="card">
      <div class="card-title">
        日前调度流程
        <small>当前角色：协同调度人员（可调整、不可确认）</small>
      </div>
      <ol class="steps">
        <li
          v-for="s in steps"
          :key="s.name"
          :class="{ done: s.state === 'done', current: s.state === 'current' }"
        >
          <i>{{ s.state === 'done' ? '✓' : '·' }}</i>
          <span>{{ s.name }}（{{ s.tip }}）</span>
        </li>
      </ol>
    </section>

    <template v-if="tab === '指令明细'">
      <section class="card">
        <div class="card-title">日前调度指令详情</div>
        <div class="grid-2">
          <div>
            <h4>指令内容</h4>
            <dl class="kv">
              <div><dt>指令编号</dt><dd>CMD-DA-20260722-001</dd></div>
              <div><dt>指令来源</dt><dd>区域算力调度管理（系统自动）</dd></div>
              <div><dt>下发时间</dt><dd>2026-07-22 14:00:00</dd></div>
              <div><dt>调度日期</dt><dd>2026-07-23（明日）</dd></div>
            </dl>
          </div>
          <div>
            <h4>要求与校验</h4>
            <dl class="kv">
              <div><dt>功耗限制要求</dt><dd>全日最大功耗 ≤ 300kW</dd></div>
              <div><dt>任务执行范围</dt><dd>2026-07-23 00:00-24:00</dd></div>
              <div><dt>优先级策略</dt><dd>按业务紧急度排序</dd></div>
              <div><dt>完整性与解析</dt><dd style="color: #67c23a">通过，可进入预测</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div class="footer ok">
        <div>
          <strong>指令校验通过，已解锁预测与编排流程</strong>
          <p>校验项：必要字段、时间范围、功耗范围、任务优先级等。</p>
        </div>
        <button class="btn primary" type="button" @click="tab = '预测与评估'">
          进入预测与评估 &gt;
        </button>
      </div>
    </template>

    <div v-else class="empty card">{{ tab }}：示例内容，可继续按流程展开预测曲线与编排表。</div>
  </div>
</template>

<style scoped>
@import './shared.css';

h4 {
  margin: 0 0 8px;
  color: #409eff;
  font-size: 14px;
}
</style>
