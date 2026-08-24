<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { permissionList } from '#/views/_shared/data/admin-permission';

defineOptions({ name: 'AdminPermissionMaintain' });

const keyword = ref('');
const scope = ref('全部');

const filtered = computed(() => {
  let rows = [...permissionList];
  if (keyword.value.trim()) {
    rows = rows.filter((r) => r.target.includes(keyword.value.trim()));
  }
  if (scope.value !== '全部') {
    rows = rows.filter((r) => r.scope === scope.value);
  }
  return rows;
});

function scopeClass(s: string) {
  return s === '功能权限' ? 'info' : 'warn';
}

function statusClass(s: string) {
  return s === '已授权' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 权限管理 / 权限维护</div>
    <header class="head">
      <div>
        <h2>权限维护</h2>
        <p>按角色/用户分配功能权限与数据权限</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('已保存分配（示例）')"
        >
          保存分配
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          角色/用户
          <input v-model="keyword" placeholder="请输入角色或用户" />
        </label>
        <label>
          权限类型
          <select v-model="scope">
            <option>全部</option>
            <option>功能权限</option>
            <option>数据权限</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              keyword = '';
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
              <th>角色/用户</th>
              <th>权限项</th>
              <th>权限范围</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.target }}</td>
              <td>{{ r.items }}</td>
              <td>
                <span class="tag" :class="scopeClass(r.scope)">{{ r.scope }}</span>
              </td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
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
      <div class="pager">共 120 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
