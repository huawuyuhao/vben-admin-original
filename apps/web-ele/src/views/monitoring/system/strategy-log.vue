<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  reportVersions,
  strategyReports,
} from '#/views/_shared/data/monitoring-system';

defineOptions({ name: 'SysStrategyLog' });

const keyword = ref('');
const reportType = ref('全部');

const filtered = computed(() => {
  let list = [...strategyReports];
  const kw = keyword.value.trim();
  if (kw) {
    list = list.filter((r) => r.title.includes(kw) || r.id.includes(kw));
  }
  if (reportType.value !== '全部') {
    list = list.filter((r) => r.category === reportType.value);
  }
  return list;
});

function riskClass(r: string) {
  if (r === '高风险') return 'danger';
  if (r === '中风险') return 'warn';
  return 'ok';
}
</script>

<template>
  <div class="page compact">
    <header class="head">
      <div>
        <h2>策略校核日志分析</h2>
        <p>管理并查看所有已生成的策略校核报告与洞察分析。</p>
      </div>
      <div class="head-actions">
        <button class="btn" type="button" @click="ElMessage.info('模板管理')">
          模板管理
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已生成新报告（示例）')"
        >
          生成新报告
        </button>
      </div>
    </header>

    <div class="search-bar card">
      <input
        v-model="keyword"
        placeholder="搜索报告名称、ID…"
      />
      <select v-model="reportType">
        <option>全部</option>
        <option>策略校核</option>
        <option>运行分析</option>
        <option>效能监控</option>
      </select>
    </div>

    <div class="layout">
      <div class="report-grid">
        <article v-for="r in filtered" :key="r.id" class="report-card card">
          <div class="report-top">
            <span class="doc-icon">📄</span>
            <span class="risk" :class="riskClass(r.risk)">{{ r.risk }}</span>
          </div>
          <h3>{{ r.title }}</h3>
          <div class="meta">🕐 {{ r.time }}</div>
          <div class="report-foot">
            <span class="cat">{{ r.category }}</span>
            <span class="id">{{ r.id }}</span>
            <span class="actions">
              <button
                type="button"
                class="icon-btn"
                @click="ElMessage.success('下载报告')"
              >
                ↓
              </button>
              <button
                type="button"
                class="icon-btn"
                @click="ElMessage.info('打开报告')"
              >
                ↗
              </button>
            </span>
          </div>
        </article>
      </div>

      <aside class="side">
        <section class="summary card">
          <div class="card-title light">最新报告摘要</div>
          <p>
            综合分析结论：当前策略在合规性方面表现优异，但在极端市场波动下的稳定性需加强。
          </p>
          <div class="summary-kpis">
            <div>
              <em>风险点数量</em>
              <strong class="danger">12</strong>
            </div>
            <div>
              <em>优化建议</em>
              <strong class="ok">5</strong>
            </div>
          </div>
          <button
            class="btn primary block"
            type="button"
            @click="ElMessage.success('打印报告（示例）')"
          >
            🖨 打印报告
          </button>
        </section>

        <section class="card">
          <div class="card-title">报告版本管理</div>
          <ul class="versions">
            <li
              v-for="v in reportVersions"
              :key="v.version"
              :class="{ current: v.current }"
            >
              <i></i>
              <div>
                <strong>{{ v.version }}</strong>
                <span>{{ v.date }}</span>
              </div>
              <em v-if="v.current">当前</em>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.page.compact {
  max-width: 1200px;
}

.search-bar {
  display: flex;
  gap: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.search-bar input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.search-bar select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: start;
}

.report-card {
  padding: 14px;
}

.report-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.doc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ecf5ff;
  border-radius: 6px;
}

.risk {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.risk.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.risk.warn {
  color: #e6a23c;
  background: #fdf6ec;
}

.risk.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.report-card h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: #303133;
}

.meta {
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;
}

.report-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.cat {
  padding: 2px 8px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 10px;
}

.id {
  font-size: 12px;
  color: #c0c4cc;
}

.actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.icon-btn {
  width: 28px;
  height: 28px;
  color: #606266;
  cursor: pointer;
  background: #f5f7fa;
  border: none;
  border-radius: 4px;
}

.summary {
  margin-bottom: 12px;
  color: #e5eaf3;
  background: #1f2a37;
  border-color: #2a3548;
}

.summary .card-title.light {
  color: #e5eaf3;
}

.summary p {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #c0c4cc;
}

.summary-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.summary-kpis em {
  display: block;
  font-size: 12px;
  font-style: normal;
  color: #9aa4b2;
}

.summary-kpis strong {
  font-size: 24px;
}

.summary-kpis .danger {
  color: #f56c6c;
}

.summary-kpis .ok {
  color: #67c23a;
}

.btn.block {
  width: 100%;
}

.versions {
  padding: 0;
  margin: 0;
  list-style: none;
}

.versions li {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.versions li:last-child {
  border-bottom: none;
}

.versions i {
  width: 8px;
  height: 8px;
  background: #c0c4cc;
  border-radius: 50%;
}

.versions li.current i {
  background: #409eff;
}

.versions strong {
  display: block;
  font-size: 13px;
}

.versions span {
  font-size: 12px;
  color: #909399;
}

.versions em {
  margin-left: auto;
  font-size: 12px;
  font-style: normal;
  color: #409eff;
}

@media (max-width: 1000px) {
  .layout,
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
