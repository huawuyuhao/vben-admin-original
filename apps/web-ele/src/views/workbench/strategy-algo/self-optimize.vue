<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { optimizeJobs } from '#/views/_shared/data/strategy-algo';

defineOptions({ name: 'StrategySelfOptimize' });

function statusClass(s: string) {
  if (s === '运行中') return 'run';
  if (s === '已完成') return 'ok';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>模型自优化算法</h2>
        <p>
          监测策略校核与预测模型精度/损失，自动触发参数调优与增量训练，持续提升模型表现。
        </p>
      </div>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('已创建优化任务（示例）')"
      >
        创建优化任务
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>3</strong><span>优化任务</span></div>
      <div class="kpi"><strong>1</strong><span>运行中</span></div>
      <div class="kpi"><strong>+5.2%</strong><span>平均精度提升</span></div>
      <div class="kpi"><strong>24h</strong><span>自动检查周期</span></div>
    </div>

    <section class="card">
      <div class="card-title">自优化策略</div>
      <div class="policy-grid">
        <div class="policy">
          <h4>精度触发</h4>
          <p>当验证集准确率低于 88% 时自动启动增量训练。</p>
        </div>
        <div class="policy">
          <h4>损失震荡</h4>
          <p>连续 3 轮损失波动 &gt; 15% 时调整学习率与正则化。</p>
        </div>
        <div class="policy">
          <h4>误报治理</h4>
          <p>预警误报率超过 8% 时动态调整阈值与样本权重。</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title">优化任务记录</div>
      <table>
        <thead>
          <tr>
            <th>任务ID</th>
            <th>目标模型</th>
            <th>触发条件</th>
            <th>优化前</th>
            <th>优化后</th>
            <th>调整参数</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in optimizeJobs" :key="j.id">
            <td>{{ j.id }}</td>
            <td>{{ j.model }}</td>
            <td>{{ j.trigger }}</td>
            <td>{{ j.before }}</td>
            <td class="up">{{ j.after }}</td>
            <td>{{ j.params }}</td>
            <td>
              <span class="badge" :class="statusClass(j.status)">{{ j.status }}</span>
            </td>
            <td>{{ j.time }}</td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`日志 ${j.id}`)">
                日志
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.policy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.policy {
  padding: 14px;
  background: #f5f7fa;
  border-radius: 8px;
}

.policy h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.policy p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.up {
  font-weight: 600;
  color: #67c23a;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

@media (max-width: 900px) {
  .policy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
