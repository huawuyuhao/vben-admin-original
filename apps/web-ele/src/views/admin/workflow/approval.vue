<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { workflowApprovalList } from '#/views/_shared/data/admin-workflow';

defineOptions({ name: 'AdminWorkflowApproval' });

const name = ref('');
const limit = ref('全部');

const filtered = computed(() => {
  let rows = [...workflowApprovalList];
  if (name.value.trim()) {
    rows = rows.filter((r) => r.name.includes(name.value.trim()));
  }
  if (limit.value !== '全部') {
    rows = rows.filter((r) => r.limit === limit.value);
  }
  return rows;
});

function statusClass(s: string) {
  return s === '启用' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 流程配置 / 流程审批</div>
    <header class="head">
      <div>
        <h2>流程审批</h2>
        <p>配置审批节点链路、处理时限与超时预警</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增审批（示例）')"
        >
          + 新增审批
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          流程名
          <input v-model="name" placeholder="请输入流程名" />
        </label>
        <label>
          审批时限
          <select v-model="limit">
            <option>全部</option>
            <option>24h</option>
            <option>48h</option>
            <option>72h</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              name = '';
              limit = '全部';
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
              <th>流程名</th>
              <th>审批节点</th>
              <th>处理时限</th>
              <th>超时预警</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.nodes }}</td>
              <td>{{ r.limit }}</td>
              <td>{{ r.warn }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`配置 ${r.name}`)"
                >
                  配置
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 64 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
