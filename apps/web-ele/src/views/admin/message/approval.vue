<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  approvalHistoryList,
  approvalTodoList,
} from '#/views/_shared/data/admin-message';

defineOptions({ name: 'AdminMessageApproval' });

const tab = ref<'history' | 'todo'>('todo');
const bizType = ref('全部');
const status = ref('全部');

const filteredTodo = computed(() => {
  let rows = [...approvalTodoList];
  if (bizType.value !== '全部') {
    rows = rows.filter((r) => r.bizType === bizType.value);
  }
  if (status.value !== '全部') {
    rows = rows.filter((r) => r.status === status.value);
  }
  return rows;
});

function bizClass(t: string) {
  if (t === '认证') return 'ok';
  return 'info';
}

function todoStatusClass(s: string) {
  if (s === '即将超时') return 'warn';
  if (s === '已超时') return 'danger';
  return 'mute';
}

function resultClass(r: string) {
  return r === '通过' ? 'ok' : 'danger';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 消息管理 / 审批工作台</div>
    <header class="head">
      <div>
        <h2>审批工作台</h2>
        <p>处理待办审批并查询审批历史</p>
      </div>
    </header>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'todo' }" @click="tab = 'todo'">
        待办审批
      </button>
      <button
        type="button"
        :class="{ active: tab === 'history' }"
        @click="tab = 'history'"
      >
        审批历史查询
      </button>
    </div>

    <template v-if="tab === 'todo'">
      <div class="kpi-row">
        <div class="kpi"><strong>24</strong><span>待办任务</span></div>
        <div class="kpi"><strong>5</strong><span>即将超时</span></div>
        <div class="kpi"><strong>38</strong><span>今日已处理</span></div>
        <div class="kpi"><strong>2</strong><span>超时未处理</span></div>
      </div>

      <section class="card">
        <div class="toolbar">
          <strong>待办审批</strong>
          <div class="ops">
            <button
              class="btn primary"
              type="button"
              @click="ElMessage.success('批量通过（示例）')"
            >
              + 批量通过
            </button>
            <button
              class="btn"
              type="button"
              @click="ElMessage.success('已刷新')"
            >
              刷新
            </button>
          </div>
        </div>
        <div class="filter">
          <label>
            业务类型
            <select v-model="bizType">
              <option>全部</option>
              <option>需求任务</option>
              <option>认证</option>
              <option>新建子账号</option>
            </select>
          </label>
          <label>
            状态
            <select v-model="status">
              <option>全部</option>
              <option>待审批</option>
              <option>即将超时</option>
              <option>已超时</option>
            </select>
          </label>
          <div class="filter-actions">
            <button
              class="btn"
              type="button"
              @click="
                bizType = '全部';
                status = '全部';
              "
            >
              重置
            </button>
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
        <div class="table-wrap" style="margin-top: 12px">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>申请标题</th>
                <th>业务类型</th>
                <th>申请人</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in filteredTodo" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.title }}</td>
                <td>
                  <span class="tag" :class="bizClass(r.bizType)">
                    {{ r.bizType }}
                  </span>
                </td>
                <td>{{ r.applicant }}</td>
                <td>{{ r.time }}</td>
                <td>
                  <span class="tag" :class="todoStatusClass(r.status)">
                    ● {{ r.status }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link ok"
                    @click="ElMessage.success(`通过 ${r.title}`)"
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    class="link danger"
                    @click="ElMessage.success(`驳回 ${r.title}`)"
                  >
                    驳回
                  </button>
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`详情 ${r.title}`)"
                  >
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 24 条记录 · 每页 10 条</div>
      </section>
    </template>

    <template v-else>
      <section class="card">
        <div class="toolbar">
          <strong>审批历史查询</strong>
          <button
            class="btn"
            type="button"
            @click="ElMessage.success('导出（示例）')"
          >
            导出
          </button>
        </div>
        <div class="filter">
          <label>开始日期<input type="date" /></label>
          <label>结束日期<input type="date" /></label>
          <label>
            业务类型
            <select>
              <option>全部</option>
              <option>需求任务</option>
              <option>认证</option>
              <option>新建子账号</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="btn" type="button">重置</button>
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
        <div class="table-wrap" style="margin-top: 12px">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>申请</th>
                <th>审批人</th>
                <th>意见</th>
                <th>时间</th>
                <th>结果</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in approvalHistoryList" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.title }}</td>
                <td>{{ r.approver }}</td>
                <td>{{ r.opinion }}</td>
                <td>{{ r.time }}</td>
                <td>
                  <span class="tag" :class="resultClass(r.result)">
                    ● {{ r.result }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`查看详情 ${r.title}`)"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 186 条记录 · 每页 10 条</div>
      </section>

      <div class="kpi-row">
        <div class="kpi"><strong>42%</strong><span>需求任务审批占比</span></div>
        <div class="kpi"><strong>33%</strong><span>认证审批占比</span></div>
        <div class="kpi"><strong>25%</strong><span>子账号审批占比</span></div>
      </div>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
