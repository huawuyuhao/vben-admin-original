<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { workflowDesignList } from '#/views/_shared/data/admin-workflow';

defineOptions({ name: 'AdminWorkflowDesign' });

const name = ref('');
const type = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let rows = [...workflowDesignList];
  if (name.value.trim()) {
    rows = rows.filter((r) => r.name.includes(name.value.trim()));
  }
  if (type.value !== '全部') rows = rows.filter((r) => r.type === type.value);
  if (status.value !== '全部')
    rows = rows.filter((r) => r.status === status.value);
  return rows;
});

function typeClass(t: string) {
  return t === '并行' ? 'info' : 'warn';
}

function statusClass(s: string) {
  return s === '已发布' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 流程配置 / 流程设计</div>
    <header class="head">
      <div>
        <h2>流程设计</h2>
        <p>设计业务流程节点、类型与发布状态</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('发起流程（示例）')"
        >
          + 发起流程
        </button>
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('复制流程（示例）')"
        >
          复制流程
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
          流程类型
          <select v-model="type">
            <option>全部</option>
            <option>并行</option>
            <option>串行</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>已发布</option>
            <option>草稿</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              name = '';
              type = '全部';
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
              <th>流程名</th>
              <th>节点数</th>
              <th>类型</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.nodes }}</td>
              <td>
                <span class="tag" :class="typeClass(r.type)">{{ r.type }}</span>
              </td>
              <td>{{ r.created }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}`)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`复制 ${r.name}`)"
                >
                  复制
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`发布 ${r.name}`)"
                >
                  发布
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
