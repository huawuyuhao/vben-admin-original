<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { workflowPermissionList } from '#/views/_shared/data/admin-workflow';

defineOptions({ name: 'AdminWorkflowPermission' });

const flow = ref('');
const scope = ref('全部');

const filtered = computed(() => {
  let rows = [...workflowPermissionList];
  if (flow.value.trim()) {
    rows = rows.filter((r) => r.flow.includes(flow.value.trim()));
  }
  return rows;
});

function flagClass(v: string) {
  return v === '允许' ? 'ok' : 'danger';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 流程配置 / 流程权限配置</div>
    <header class="head">
      <div>
        <h2>流程权限配置</h2>
        <p>按流程与角色配置访问、编辑、审批权限</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已保存（示例）')"
        >
          保存
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          流程
          <input v-model="flow" placeholder="请输入流程" />
        </label>
        <label>
          权限范围
          <select v-model="scope">
            <option>全部</option>
            <option>访问权限</option>
            <option>编辑权限</option>
            <option>审批权限</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              flow = '';
              scope = '全部';
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
              <th>流程</th>
              <th>角色/用户</th>
              <th>访问权限</th>
              <th>编辑权限</th>
              <th>审批权限</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.flow }}</td>
              <td>{{ r.target }}</td>
              <td>
                <span class="tag" :class="flagClass(r.access)">
                  ● {{ r.access }}
                </span>
              </td>
              <td>
                <span class="tag" :class="flagClass(r.edit)">● {{ r.edit }}</span>
              </td>
              <td>
                <span class="tag" :class="flagClass(r.approve)">
                  ● {{ r.approve }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`配置 ${r.target}`)"
                >
                  配置
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 30 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
