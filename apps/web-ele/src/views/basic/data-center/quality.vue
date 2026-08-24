<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcQuality' });

interface QualityRule {
  id: string;
  name: string;
  dimension: string;
  target: string;
  score: number;
  issues: number;
  status: string;
}

const rows: QualityRule[] = [
  {
    id: '1',
    name: '机柜温度完整性检核',
    dimension: '完整性',
    target: '环境监控表',
    score: 98,
    issues: 2,
    status: '通过',
  },
  {
    id: '2',
    name: 'PUE 指标准确性检核',
    dimension: '准确性',
    target: '能效指标表',
    score: 95,
    issues: 5,
    status: '通过',
  },
  {
    id: '3',
    name: '跨源能耗一致性检核',
    dimension: '一致性',
    target: '能耗汇总表',
    score: 88,
    issues: 12,
    status: '预警',
  },
  {
    id: '4',
    name: '实时采集及时性检核',
    dimension: '及时性',
    target: '采集日志表',
    score: 92,
    issues: 8,
    status: '通过',
  },
  {
    id: '5',
    name: '节点状态完整性检核',
    dimension: '完整性',
    target: '算力节点表',
    score: 76,
    issues: 24,
    status: '不通过',
  },
];

const dimension = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (dimension.value !== '全部') {
    list = list.filter((r) => r.dimension === dimension.value);
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

const kpis = computed(() => ({
  total: rows.length,
  pass: rows.filter((r) => r.status === '通过').length,
  avgScore: Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
  totalIssues: rows.reduce((s, r) => s + r.issues, 0),
}));

function statusClass(s: string) {
  if (s === '通过') return 'ok';
  if (s === '预警') return 'warn';
  if (s === '不通过') return 'danger';
  return 'mute';
}

function dimensionClass(d: string) {
  if (d === '完整性') return 'info';
  if (d === '准确性') return 'ok';
  if (d === '一致性') return 'purple';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据质量</div>
    <header class="head">
      <div>
        <h2>数据质量</h2>
        <p>管理数据质量检核规则与执行结果，覆盖完整性、准确性、一致性与及时性维度。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新建检核规则（示例）')"
        >
          + 新建规则
        </button>
        <button class="btn" type="button" @click="ElMessage.success('立即执行检核（示例）')">
          立即检核
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi">
        <strong>{{ kpis.total }}</strong>
        <span>检核规则数</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.pass }}</strong>
        <span>通过规则</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.avgScore }}</strong>
        <span>平均得分</span>
      </div>
      <div class="kpi">
        <strong>{{ kpis.totalIssues }}</strong>
        <span>问题总数</span>
      </div>
    </div>

    <section class="card">
      <div class="filter">
        <label>
          质量维度
          <select v-model="dimension">
            <option>全部</option>
            <option>完整性</option>
            <option>准确性</option>
            <option>一致性</option>
            <option>及时性</option>
          </select>
        </label>
        <label>
          检核状态
          <select v-model="status">
            <option>全部</option>
            <option>通过</option>
            <option>预警</option>
            <option>不通过</option>
          </select>
        </label>
        <label>检核对象<input placeholder="请输入对象名称" /></label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span>共 {{ filtered.length }} 条记录</span>
        <span class="count">
          <button class="btn" type="button" @click="ElMessage.success('已刷新')">↻</button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>规则名</th>
              <th>维度</th>
              <th>对象</th>
              <th>得分</th>
              <th>问题数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>
                <span class="tag" :class="dimensionClass(r.dimension)">{{ r.dimension }}</span>
              </td>
              <td>{{ r.target }}</td>
              <td>{{ r.score }}</td>
              <td>{{ r.issues }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name} 报告（示例）`)"
                >
                  报告
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}（示例）`)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="link ok"
                  @click="ElMessage.success(`执行 ${r.name}（示例）`)"
                >
                  执行
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
