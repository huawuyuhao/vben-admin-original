<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'TsPowerRealtime' });

const tab = ref('指令校验');
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>满足调度功耗的实时本地调度策略</h2>
        <p>接收实时调度指令，通过停止或调整任务，将最大功耗控制在要求范围内。</p>
      </div>
      <div class="head-actions">
        <span class="pill run">指令处理中</span>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">
          刷新
        </button>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="t in ['指令校验', '任务处置', '校验与结果']"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <template v-if="tab === '指令校验'">
      <div class="info-bar">
        <span>当前指令: KT-PWR-20260722-140215</span>
        <span>功耗要求: 4200kW</span>
        <span>批复总功耗: 5200kW</span>
        <span>超限量: 240kW</span>
        <span>接收时间: 2026-07-22 14:02:15</span>
        <em class="ok">指令校验通过</em>
      </div>

      <section class="card">
        <div class="card-title">当前调度指令详情</div>
        <div class="grid-2">
          <div>
            <h4>指令内容</h4>
            <dl class="kv">
              <div><dt>指令来源</dt><dd>区域算力调度端（系统自动）</dd></div>
              <div>
                <dt>接收时间</dt>
                <dd>2026-07-22 14:02:15 <span class="badge mute">待处理</span></dd>
              </div>
              <div><dt>边际控制要求</dt><dd>最大功耗 ≤ 240kW</dd></div>
              <div><dt>任务调度范围</dt><dd>全部可调整业务</dd></div>
            </dl>
          </div>
          <div>
            <h4>校验与功耗判断</h4>
            <dl class="kv">
              <div><dt>完整性校验</dt><dd style="color: #67c23a">通过</dd></div>
              <div><dt>格式校验</dt><dd style="color: #67c23a">通过</dd></div>
              <div><dt>当前最大功耗</dt><dd style="color: #f56c6c">520kW（超限）</dd></div>
              <div><dt>功耗超限量</dt><dd style="color: #f56c6c">240kW</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div class="footer ok">
        <div>
          <strong>指令校验通过，可以进入任务处置</strong>
        </div>
        <button
          class="btn primary"
          type="button"
          @click="tab = '任务处置'"
        >
          进入任务处置 &gt;
        </button>
      </div>
    </template>

    <template v-else-if="tab === '任务处置'">
      <section class="card">
        <div class="card-title">建议处置动作</div>
        <table>
          <thead>
            <tr>
              <th>任务</th>
              <th>节点</th>
              <th>当前功耗</th>
              <th>建议动作</th>
              <th>预计降载</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>LLM-Train-001</td>
              <td>910B-A01</td>
              <td>120kW</td>
              <td>降频 20%</td>
              <td>24kW</td>
            </tr>
            <tr>
              <td>FineTune-007</td>
              <td>P800-B01</td>
              <td>95kW</td>
              <td>暂停 1 个切片</td>
              <td>40kW</td>
            </tr>
            <tr>
              <td>Batch-Proc-33</td>
              <td>P800-B02</td>
              <td>80kW</td>
              <td>延后至下一窗口</td>
              <td>80kW</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <div v-else class="empty card">校验与结果：本轮预计降载 144kW，满足指令功耗上限。</div>
  </div>
</template>

<style scoped>
@import './shared.css';

h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #409eff;
}
</style>
