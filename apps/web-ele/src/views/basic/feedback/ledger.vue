<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { feedbackList } from '#/views/_shared/data/basic-feedback';

defineOptions({ name: 'FeedbackLedger' });

const keyword = ref('');
const type = ref('全部');
const status = ref('全部');
const priority = ref('全部');

const filtered = computed(() => {
  let rows = [...feedbackList];
  if (keyword.value.trim()) {
    const k = keyword.value.trim();
    rows = rows.filter((r) => r.user.includes(k) || r.content.includes(k));
  }
  if (type.value !== '全部') rows = rows.filter((r) => r.type === type.value);
  if (status.value !== '全部')
    rows = rows.filter((r) => r.status === status.value);
  if (priority.value !== '全部')
    rows = rows.filter((r) => r.priority === priority.value);
  return rows;
});

function typeClass(t: string) {
  if (t === '系统问题') return 'info';
  if (t === '功能建议') return 'ok';
  if (t === '使用咨询') return 'purple';
  return 'mute';
}

function priorityClass(p: string) {
  if (p === '高') return 'danger';
  if (p === '中') return 'warn';
  return 'ok';
}

function statusClass(s: string) {
  if (s === '已处理') return 'ok';
  if (s === '处理中') return 'info';
  return 'warn';
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 基础管理 / 用户意见反馈管理 / 用户意见反馈台账</div>
    <header class="head">
      <div>
        <h2>用户意见反馈台账</h2>
        <p>汇总用户反馈，支持筛选、批量处理与导出</p>
      </div>
      <div class="head-actions">
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('批量导出（示例）')"
        >
          批量导出
        </button>
        <button
          class="btn ok"
          type="button"
          @click="ElMessage.success('批量处理（示例）')"
        >
          批量处理
        </button>
      </div>
    </header>

    <div class="kpi-row" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
      <div class="kpi"><strong>286</strong><span>总反馈数</span></div>
      <div class="kpi"><strong>32</strong><span>待处理</span></div>
      <div class="kpi"><strong>46</strong><span>处理中</span></div>
      <div class="kpi"><strong>208</strong><span>已处理</span></div>
      <div class="kpi"><strong>4.8</strong><span>平均满意度</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>
          用户名称/反馈内容
          <input v-model="keyword" placeholder="请输入关键字" />
        </label>
        <label>
          反馈类型
          <select v-model="type">
            <option>全部</option>
            <option>系统问题</option>
            <option>功能建议</option>
            <option>使用咨询</option>
            <option>其他问题</option>
          </select>
        </label>
        <label>
          处理状态
          <select v-model="status">
            <option>全部</option>
            <option>待处理</option>
            <option>处理中</option>
            <option>已处理</option>
          </select>
        </label>
        <label>
          优先级
          <select v-model="priority">
            <option>全部</option>
            <option>高</option>
            <option>中</option>
            <option>低</option>
          </select>
        </label>
        <label>
          反馈时间
          <input type="date" />
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              keyword = '';
              type = '全部';
              status = '全部';
              priority = '全部';
            "
          >
            重置
          </button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span class="count">共 {{ filtered.length }} 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>反馈编号</th>
              <th>用户名称</th>
              <th>反馈类型</th>
              <th>优先级</th>
              <th>反馈内容</th>
              <th>满意度</th>
              <th>反馈时间</th>
              <th>处理人</th>
              <th>处理状态</th>
              <th>处理时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.no }}</td>
              <td>{{ r.user }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>
                <span class="tag" :class="priorityClass(r.priority)">{{ r.priority }}</span>
              </td>
              <td class="content-cell">{{ r.content }}</td>
              <td class="stars">{{ stars(r.score) }}</td>
              <td>{{ r.time }}</td>
              <td>{{ r.handler }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td>{{ r.handleTime }}</td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.no}`)"
                >
                  详情
                </button>
                <button
                  v-if="r.status !== '已处理'"
                  type="button"
                  class="link"
                  @click="ElMessage.success(`处理 ${r.no}`)"
                >
                  处理
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">
        显示 1 到 {{ filtered.length }} 条，共 286 条记录
      </div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.content-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stars {
  color: #e6a23c;
  letter-spacing: 1px;
}
</style>
