<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { messageNotifyList } from '#/views/_shared/data/admin-message';

defineOptions({ name: 'AdminMessageNotify' });

const category = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let rows = [...messageNotifyList];
  if (category.value !== '全部') {
    rows = rows.filter((r) => r.category === category.value);
  }
  if (status.value !== '全部') {
    rows = rows.filter((r) => r.status === status.value);
  }
  return rows;
});

function categoryClass(c: string) {
  if (c.includes('需求')) return 'info';
  if (c.includes('认证')) return 'ok';
  return 'purple';
}

function statusClass(s: string) {
  return s === '未读' ? 'warn' : 'ok';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 消息管理 / 消息通知管理</div>
    <header class="head">
      <div>
        <h2>消息通知管理</h2>
        <p>查看与处理系统消息通知</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('批量已读（示例）')"
        >
          批量已读
        </button>
        <button
          class="btn danger"
          type="button"
          @click="ElMessage.success('删除（示例）')"
        >
          删除
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>326</strong><span>今日消息</span></div>
      <div class="kpi"><strong>58</strong><span>未读</span></div>
      <div class="kpi"><strong>210</strong><span>需求任务消息</span></div>
      <div class="kpi"><strong>12</strong><span>新建子账号</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>
          分类
          <select v-model="category">
            <option>全部</option>
            <option>需求任务消息</option>
            <option>认证消息</option>
            <option>新建子账号消息</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>未读</option>
            <option>已读</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              category = '全部';
              status = '全部';
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
              <th>序号</th>
              <th>标题</th>
              <th>分类</th>
              <th>来源</th>
              <th>时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.title }}</td>
              <td>
                <span class="tag" :class="categoryClass(r.category)">
                  {{ r.category }}
                </span>
              </td>
              <td>{{ r.source }}</td>
              <td>{{ r.time }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`详情 ${r.title}`)"
                >
                  详情
                </button>
                <button
                  type="button"
                  class="link ok"
                  @click="ElMessage.success(`已读 ${r.title}`)"
                >
                  已读
                </button>
                <button
                  type="button"
                  class="link danger"
                  @click="ElMessage.success(`删除 ${r.title}`)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 326 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
