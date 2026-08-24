<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { workflowVersionList } from '#/views/_shared/data/admin-workflow';

defineOptions({ name: 'AdminWorkflowVersion' });

const name = ref('');

const filtered = computed(() => {
  if (!name.value.trim()) return workflowVersionList;
  return workflowVersionList.filter((r) =>
    r.name.includes(name.value.trim()),
  );
});

function statusClass(s: string) {
  return s === '当前' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 流程配置 / 流程版本管理</div>
    <header class="head">
      <div>
        <h2>流程版本管理</h2>
        <p>查看流程版本差异，支持回溯与回滚</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('回滚（示例）')"
        >
          回滚
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          流程名
          <input v-model="name" placeholder="请输入流程名" />
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
              <th>流程名</th>
              <th>版本号</th>
              <th>创建时间</th>
              <th>差异</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.version }}</td>
              <td>{{ r.created }}</td>
              <td>{{ r.diff }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`回溯 ${r.version}`)"
                >
                  回溯
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`回滚 ${r.version}`)"
                >
                  回滚
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 48 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
