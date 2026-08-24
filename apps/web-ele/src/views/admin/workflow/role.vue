<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { workflowRoleList } from '#/views/_shared/data/admin-workflow';

defineOptions({ name: 'AdminWorkflowRole' });

const name = ref('');

const filtered = computed(() => {
  if (!name.value.trim()) return workflowRoleList;
  return workflowRoleList.filter((r) => r.name.includes(name.value.trim()));
});

function statusClass(s: string) {
  return s === '启用' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 流程配置 / 流程角色配置</div>
    <header class="head">
      <div>
        <h2>流程角色配置</h2>
        <p>配置流程发起、审批、管理等角色职责与权限</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增角色（示例）')"
        >
          + 新增角色
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          角色名
          <input v-model="name" placeholder="请输入角色名" />
        </label>
        <div class="filter-actions">
          <button class="btn" type="button" @click="name = ''">重置</button>
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
              <th>角色名</th>
              <th>职责</th>
              <th>权限</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.duty }}</td>
              <td>{{ r.perms }}</td>
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
                  class="link danger"
                  @click="ElMessage.success(`删除 ${r.name}`)"
                >
                  删除
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`详情 ${r.name}`)"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 15 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
