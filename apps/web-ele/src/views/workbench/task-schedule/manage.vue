<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { manageOps, managePlans } from '#/views/_shared/data/task-schedule';

defineOptions({ name: 'TsManage' });

const plans = ref(managePlans.map((p) => ({ ...p })));
const activeId = ref(plans.value[1]?.id || plans.value[0]?.id);
const active = computed(
  () => plans.value.find((p) => p.id === activeId.value) || plans.value[0],
);

const modeStats = [
  { name: '手动执行', count: 5 },
  { name: '日前跨域', count: 14 },
  { name: '日前本地', count: 18 },
  { name: '实时本地', count: 11 },
];

function typeClass(t: string) {
  if (t === '手动') return 'mute';
  if (t.includes('跨域')) return 'run';
  if (t.includes('本地')) return 'ok';
  return 'warn';
}

function statusClass(s: string) {
  if (s === '成功' || s === '完成') return 'ok';
  if (s === '运行中') return 'run';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>调度管理</h2>
        <p>统一管理多模式调度计划，查看计划详情、功耗对比、模式分布与操作记录。</p>
      </div>
    </header>

    <div class="top-grid">
      <section class="card list-card">
        <div class="card-title">调度计划列表</div>
        <article
          v-for="p in plans"
          :key="p.id"
          class="plan-item"
          :class="{ active: activeId === p.id }"
          @click="activeId = p.id"
        >
          <div class="plan-top">
            <strong>{{ p.name }}</strong>
            <span :class="p.enabled ? 'on' : 'off'">
              {{ p.enabled ? '启用' : '停用' }}
            </span>
          </div>
          <div class="plan-meta">
            <span>{{ p.id }}</span>
            <span class="badge" :class="typeClass(p.type)">{{ p.type }}</span>
            <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
          </div>
        </article>
        <div class="list-foot">
          显示 5 / 48 条
          <button type="button" @click="ElMessage.info('查看全部（示例）')">
            查看全部 →
          </button>
        </div>
      </section>

      <section class="card" v-if="active">
        <div class="card-title">计划详情 — {{ active.name }}</div>
        <dl class="kv">
          <div><dt>来源中心</dt><dd>{{ active.source }}</dd></div>
          <div><dt>目的中心</dt><dd>{{ active.target }}</dd></div>
          <div><dt>任务范围</dt><dd>{{ active.scope }}</dd></div>
          <div><dt>调度窗口</dt><dd>{{ active.window }}</dd></div>
          <div><dt>计划类型</dt><dd>{{ active.type }}</dd></div>
          <div><dt>触发方式</dt><dd>{{ active.trigger }}</dd></div>
          <div><dt>启停状态</dt><dd style="color: #67c23a">{{ active.enabled ? '已启用' : '已停用' }}</dd></div>
          <div><dt>执行状态</dt><dd style="color: #67c23a">{{ active.exec }}</dd></div>
        </dl>
        <h4 class="sub">调度窗口时间线</h4>
        <div class="timeline-bar">
          <i class="a">谷段 0-7h</i>
          <i class="b">平段执行</i>
          <i class="c">谷段</i>
        </div>
      </section>

      <section class="card">
        <div class="card-title">功耗监控对比</div>
        <div class="power-block">
          <h4>华东中心A（来源）</h4>
          <div class="bar-row">
            <span>当前功耗</span>
            <div class="track"><i style="width: 69%; background: #67c23a" /></div>
            <em>5840 / 8500 kW</em>
          </div>
          <div class="bar-row">
            <span>峰值历史</span>
            <div class="track"><i style="width: 95%; background: #e6a23c" /></div>
            <em>8120 / 8500 kW</em>
          </div>
        </div>
        <div class="power-block">
          <h4>西部中心A（目的）</h4>
          <div class="bar-row">
            <span>当前功耗</span>
            <div class="track"><i style="width: 55%; background: #409eff" /></div>
            <em>3280 / 6000 kW</em>
          </div>
          <div class="bar-row">
            <span>预计峰值</span>
            <div class="track"><i style="width: 75%; background: #e6a23c" /></div>
            <em>4520 / 6000 kW</em>
          </div>
        </div>
        <p class="prog">执行进度：任务迁移完成 5 / 8 批次 · 预计完成 16:30</p>
      </section>

      <section class="card">
        <div class="card-title">模式分布 & 执行状态</div>
        <div v-for="m in modeStats" :key="m.name" class="mode-row">
          <span>{{ m.name }}</span>
          <div class="track">
            <i :style="{ width: `${m.count * 4}%` }" />
          </div>
          <em>{{ m.count }}</em>
        </div>
        <ul class="stat-list">
          <li>启用中 32</li>
          <li>执行中 18</li>
          <li>待执行 8</li>
          <li>已完成 6</li>
          <li>停用 16</li>
          <li class="ok">执行成功率 98.7%</li>
        </ul>
      </section>
    </div>

    <section class="card">
      <div class="card-title">多模式调度流程</div>
      <div class="flow">
        <span>手动执行</span>
        <i>→</i>
        <span>及时调度</span>
        <i>→</i>
        <span>日前跨域</span>
        <i>→</i>
        <span>本地实时</span>
        <i>→</i>
        <span>组合应用</span>
      </div>
    </section>

    <section class="card">
      <div class="card-title">调度计划操作记录</div>
      <table>
        <thead>
          <tr>
            <th>计划名称</th>
            <th>调度类型</th>
            <th>创建人</th>
            <th>修改时间</th>
            <th>启用状态</th>
            <th>执行结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in manageOps" :key="i">
            <td>{{ r.name }}</td>
            <td>{{ r.type }}</td>
            <td>{{ r.creator }}</td>
            <td>{{ r.time }}</td>
            <td style="color: #67c23a">{{ r.enabled }}</td>
            <td>
              <span
                class="badge"
                :class="r.result === '成功' ? 'ok' : 'run'"
              >
                {{ r.result }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import './shared.css';

.top-grid {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1.2fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.list-card {
  max-height: 480px;
  overflow: auto;
}

.plan-item {
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.plan-item.active,
.plan-item:hover {
  background: #f5f9ff;
  border-color: #b3d8ff;
}

.plan-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.plan-top .on {
  color: #67c23a;
  font-size: 12px;
}

.plan-top .off {
  color: #909399;
  font-size: 12px;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.list-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.list-foot button {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.sub {
  margin: 12px 0 8px;
  font-size: 13px;
}

.timeline-bar {
  display: grid;
  grid-template-columns: 1.2fr 1.6fr 1fr;
  overflow: hidden;
  border-radius: 4px;
}

.timeline-bar i {
  padding: 8px;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  text-align: center;
}

.timeline-bar .a {
  background: #409eff;
}

.timeline-bar .b {
  background: #67c23a;
}

.timeline-bar .c {
  background: #c0c4cc;
}

.power-block {
  margin-bottom: 12px;
}

.power-block h4 {
  margin: 0 0 8px;
  font-size: 13px;
}

.bar-row,
.mode-row {
  display: grid;
  grid-template-columns: 72px 1fr 110px;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.mode-row {
  grid-template-columns: 72px 1fr 28px;
}

.track {
  height: 8px;
  overflow: hidden;
  background: #ebeef5;
  border-radius: 4px;
}

.track i {
  display: block;
  height: 100%;
  background: #409eff;
}

.bar-row em,
.mode-row em {
  color: #909399;
  font-style: normal;
}

.prog {
  margin: 8px 0 0;
  color: #606266;
  font-size: 12px;
}

.stat-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: #606266;
}

.stat-list li {
  padding: 4px 0;
}

.stat-list .ok {
  color: #67c23a;
  font-weight: 600;
}

.flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.flow span {
  padding: 8px 14px;
  color: #fff;
  font-size: 13px;
  background: #409eff;
  border-radius: 4px;
}

.flow i {
  color: #909399;
  font-style: normal;
}

.badge.warn {
  color: #e6a23c;
  background: #fdf6ec;
}

@media (max-width: 1400px) {
  .top-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
}
</style>
