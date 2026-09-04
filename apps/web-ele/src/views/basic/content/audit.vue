<script lang="ts" setup>
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentAudit' });

/** 审核列表（待对接接口） */
const auditList: never[] = [];

function typeClass(t: string) {
  if (t === '案例') return 'info';
  if (t === '公告') return 'warn';
  return 'ok';
}

function statusClass(s: string) {
  if (s === '待审核') return 'warn';
  if (s === '已通过') return 'ok';
  return 'danger';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 内容审核管理</div>
    <header class="head">
      <div>
        <h2>门户内容审核管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导出</button>
        <button class="btn ok" type="button" @click="ElMessage.success('批量通过（示例）')">
          批量通过
        </button>
        <button class="btn danger" type="button" @click="ElMessage.warning('批量驳回（示例）')">
          批量驳回
        </button>
        <button class="btn primary" type="button">审核设置</button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>24</strong><span>待我审核</span></div>
      <div class="kpi"><strong>186</strong><span>已审核通过</span></div>
      <div class="kpi"><strong>32</strong><span>已审核驳回</span></div>
      <div class="kpi"><strong>12</strong><span>今日新增待审核</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>内容标题/关键词<input /></label>
        <label>内容类型<select><option>全部</option></select></label>
        <label>审核状态<select><option>待审核</option></select></label>
        <label>提交时间范围<input type="date" /></label>
        <label>提交人<input /></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 242 条记录</label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>内容标题</th>
              <th>内容类型</th>
              <th>提交人</th>
              <th>提交时间</th>
              <th>审核状态</th>
              <th>审核人</th>
              <th>审核时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in auditList" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.title }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.submitter }}</td>
              <td>{{ r.submitTime }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.auditor }}</td>
              <td>{{ r.auditTime }}</td>
              <td class="ops">
                <button type="button" class="link">查看详情</button>
                <button
                  v-if="r.status === '待审核'"
                  type="button"
                  class="link ok"
                  @click="ElMessage.success('已通过')"
                >
                  通过
                </button>
                <button
                  v-if="r.status === '待审核'"
                  type="button"
                  class="link danger"
                >
                  驳回
                </button>
                <button
                  v-if="r.status === '已通过'"
                  type="button"
                  class="link warn"
                >
                  撤回
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ auditList.length }} 条，共 242 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
